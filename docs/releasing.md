# Выпуск релиза

Релиз расширения AltEDT выпускается из репозитория `alt-edt` тегом `vX.Y.Z`.
Публикация полностью автоматизирована: локально нужно подготовить версию, проверить сборку,
поставить тег и отправить его на GitHub. Всё остальное делает workflow
[`Release`](https://github.com/madmar1o/altedt/blob/main/.github/workflows/release.yml).

## Кто что делает

| Шаг | Локально | CI (`.github/workflows/release.yml`) |
|---|---|---|
| Версия в `package.json` / `package-lock.json` | да, `npm version` | сверяет |
| `CHANGELOG.md` | **нет** | генерирует `git-cliff --tag vX.Y.Z` и коммитит |
| Проверки: typecheck, lint, compile | да | повторяет lint и compile |
| Тесты | да, через pre-commit (`npm test`) | `npm run test:node` в CI |
| Сборка VSIX | да, для проверки | собирает релизный `alt-edt-X.Y.Z.vsix` |
| GitHub Release + VSIX | **нет** | создаёт и прикладывает файл |
| Open VSX и VS Code Marketplace | **нет** | публикует (`OVSX_TOKEN`, `VSCE_PAT`) |
| Подпись SignPath | **нет** | при заданных переменных репозитория |

Локально **нельзя** запускать `gh release create`, `vsce publish`, `ovsx publish`,
`npm publish` и `npm run changelog`: это либо продублирует CI, либо использует версию
`CHANGELOG.md`, которую workflow всё равно перезапишет.

## 1. Подготовка

```powershell
cd C:\open-project\alt_edt\alt-edt
git switch main
git status --porcelain          # должно быть пусто
git pull --rebase origin main
```

Если рабочее дерево грязное — закоммитьте или уберите изменения. Релиз из грязного дерева
не выпускается.

## 2. Версия

Ориентир — версия в `package.json` (`X.Y.Z`), а не `git describe`.

> **Тег `v0.9.17` принадлежит другому репозиторию.** `origin` общий с parent-репозиторием
> workspace: тег `v0.9.17` указывает на коммит в `origin/master`, где лежит конфигурация 1С
> и нет `package.json`. Этот тег не является предком `main`. Не переносите и не удаляйте его.
> Первый тег плагина — `v0.9.18`; из-за отсутствия предыдущего тега CI в первый раз соберёт
> `CHANGELOG.md` по всей истории.

Проект живёт в `0.y.z`:

- breaking change → minor (`0.(y+1).0`);
- `feat` → minor;
- `fix`, `docs`, `chore` и остальное → patch.

```powershell
npm version 0.9.18 --no-git-tag-version
```

`--no-git-tag-version` обязателен: версию и тег ставим отдельно, одним осознанным шагом.
Команда обновляет `package.json` и `package-lock.json`.

Проверьте, что старая версия не осталась в других файлах:

```powershell
git grep -n -I -F "<OLD_VERSION>" -- . ":(exclude)CHANGELOG.md" ":(exclude)package-lock.json"
```

Сейчас версия встречается ещё в заголовке `Dockerfile.test` — обновите её вручную.
`CHANGELOG.md` не трогайте: его формирует CI.

## 3. Проверки и сборка

```powershell
npm run typecheck
npm run lint
npm run compile
npm run test:node
npm run package
Get-ChildItem alt-edt-0.9.18.vsix
```

`npm run package` — это `vsce package`; файл `.vsix` нужен только для проверки,
в git он не попадает (`*.vsix` в `.gitignore`).

Полный `npm test` (включая VS Code test host) запускает pre-commit hook при коммите.
Обходить hook через `--no-verify` запрещено.

## 4. Коммит, тег, пуш

```powershell
git add -u
git commit -m "chore(release): v0.9.18"
git tag -a v0.9.18 -m "Release v0.9.18"
git push origin main
git push origin v0.9.18
git ls-remote --tags origin "refs/tags/v0.9.18"
```

Порядок важен: сначала `main`, потом тег. Иначе workflow соберёт релиз из коммита,
в котором ещё старая версия.

## 5. Проверка после пуша

Тег запускает workflow `Release`. Проверьте:

- https://github.com/madmar1o/altedt/actions — workflow `Release` завершился успешно;
- https://github.com/madmar1o/altedt/releases — есть релиз `v0.9.18` и файл
  `alt-edt-0.9.18.vsix`;
- Open VSX и VS Code Marketplace показывают новую версию.

Если установлен GitHub CLI:

```powershell
gh run list --workflow=release.yml --limit=1
gh run watch <run-id> --exit-status
gh release view v0.9.18
```

После успешного релиза CI коммитит `CHANGELOG.md` в `main`. Подтяните изменения:

```powershell
git pull --rebase origin main
```

## Если что-то пошло не так

- **Workflow упал до создания релиза.** Исправьте причину и запушьте тег заново нельзя —
  тег уже существует. Удалите тег локально и на origin, исправьте коммит и повторите:
  `git tag -d v0.9.18` и `git push origin :refs/tags/v0.9.18`.
- **Релиз создан, но маркетплейс не обновился.** Проверьте секреты `VSCE_PAT` и
  `OVSX_TOKEN` в настройках репозитория. Версию, уже опубликованную в маркетплейсе,
  повторно опубликовать нельзя — выпускайте следующий patch.
- **Не откатывайте автоматически.** Сначала зафиксируйте причину, затем удаляйте тег
  и релиз осознанно.

## Релиз через агента

В workspace установлен skill `ship`, адаптированный под этот репозиторий
(`.agents/skills/ship/references/alt-edt.md`). Запуск:

```text
/ship 0.9.18 --no-auto
```

Skill выполняет шаги 1–4 из этого документа, останавливается после пуша тега и проверяет CI.
Он не создаёт GitHub Release и не публикует в маркетплейсы — это делает workflow.

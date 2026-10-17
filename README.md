# alt_edt — плагин VS Code для 1С (AltEDT)

Плагин для Visual Studio Code (Cursor / Windsurf / VSCodium) для разработки на
платформе 1С:Предприятие 8: список баз, универсальный запуск клиентов,
дифференциальная загрузка изменений, отладка, расширяемость через собственный
плагин-механизм.

Основа — форк [yellow-hammer/vscode-1c-platform-tools](https://github.com/yellow-hammer/vscode-1c-platform-tools)
(лицензия MIT, автор Ivan Karlo). Права сохраняются в LICENSE форка.

## Структура

| Путь | Что это |
|---|---|
| `alt-edt/` | Код плагина — **отдельный git-репозиторий** (клон форка, см. `.gitignore`) |
| `.v8-project.json` | Реестр информационных баз проекта (не коммитится — содержит секреты) |
| `README.md` | Этот файл: план и заметки проекта |

## План этапов

| # | Этап | Статус |
|---|---|---|
| 0 | Инфраструктура: git ×2, клон форка, сборка `.vsix`, реестр баз | ✅ |
| 1 | Аудит форка (структура команд, отладчик, список баз) | ✅ |
| 2 | Панель «Базы» — 3 источника: `ibases.v8i` / `.v8-project.json` / профили (`baseSources.ts`, 12 unit-тестов) | ✅ |
| 3 | Мастер профилей (GUI вместо JSON) + универсальный запуск 6 режимов (`launchModes.ts`) | ✅ |
| 4 | Отладка 1С: встроенный отладчик форка + отладка выбранной базы из списка (`debugDap`) | ✅ |
| 5 | Плагин-механизм: публичный `AltEdtApi` (registerBaseProvider / registerLaunchMode / registerCommandGroup / registerPanel) | ✅ |
| 6 | Тестовый контур: dry-run, фикстуры-расширения, CI | ✅ |
| 7 | Дифф-загрузка: git-diff/objlist/UpdateDBCfg → хранилище 1С → дифф EDT (`.mdo`) | план |
| 8 | Полировка: имя AltEDT, иконки, README, опционально `bsl-language-server` | план |
| 9 | Формы — визуальный дизайнер (последок), REA по бинарнику Конфигуратора | план |

## Окружение (проверено)

- Git 2.40; Node 24.21; npm 11.19; VS Code 1.142
- Платформы 1С: 8.3.25.1633, 8.3.27.1786 / .2325 / .2342 (`ibcmd` есть в 8.3.25 и 8.3.27.2342)
- 1C:EDT 2025.2 (`1cedtcli` в PATH)
- Список платформы: `%APPDATA%\1C\1CEStart\ibases.v8i` — 125 баз, формат INI:
  `Connect=File="..."` / `Srvr="...";Ref="..."`, `Folder=/`, `App=Auto`
- Тестовая файловая база: `C:\open-project\vc\BD`
- Кэш Redis/Qdrant (Docker) — **по необходимости**, не блокирует разработку

## Ключевые находки аудита форка

- **Список баз**: `src/features/ibases/` — `IbasesProvider` принимает инжектируемый
  ридер записей; парсер `ibases.v8i` и watcher — в `src/shared/infobaseList.ts`.
  Этап 2 подключил сюда же `baseSources.ts` (реестр `.v8-project.json` + профили запуска).
- **Профили запуска**: `src/shared/envProfiles.ts` — профиль = файл `env*.json`
  (vrunner 2.x, опции в секции `default` с префиксом `--`) либо
  `autumn-properties*.json` (3.x, секция `vrunner` без префикса); `env.local.json`
  — зарезервированное перекрытие. JSONC-разбор — `src/shared/settingsJson.ts`.
- **Отладка**: у форка уже есть вкладка «Запуск и отладка» с отладчиком
  «1Cpt: Enterprise Debugger» (см. `docs/debug.md` форка) — этап 4 в основном аудит+тесты.
- **Редактор профиля**: custom editor `1c-platform-tools.profileEditor` для
  `env*.json` уже есть — часть этапа 3 готова, надо только расширить мастером.
- **Запуск**: `src/features/ibases/cestart.ts` (запуск через `1cestart` по строке
  `Connect`), `src/features/launch/launchFeature.ts` (командные профили запуска).

## Как запустить разработку плагина

```powershell
cd alt-edt
npm install
npm run compile      # сборка TypeScript
npm run watch        # режим наблюдения
# F5 в VS Code — Extension Development Host
npx @vscode/vsce package   # сборка .vsix
```

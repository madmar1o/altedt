# alt_edt — состояние сессии

Обновлено: 2026-10-18. Ветка `master` (parent), `main` (child `alt-edt/`). Работа только локально, без push.

## Что сделано (этапы 0–8 ✅, все закоммичены)

| Этап | Содержание | Коммит child |
|---|---|---|
| 0 | Инфраструктура: git ×2, клон форка, `.vsix`, реестр баз | базовый `main` |
| 1 | Аудит форка | — |
| 2 | Панель «Базы» — 3 источника (`baseSources.ts`) | `e42e292` |
| 3A | Универсальный запуск, 6 режимов (`launchModes.ts`) | `70c5de5` |
| 3B | Мастер профилей — переиспользован `profileEditor` форка | в 3A |
| 4 | Отладка: `debugDap` + приоритет явного `connectionString` | `87bab99` |
| 5 | Плагин-механизм `AltEdtApi` (`altEdtApi.ts`, `altEdtRegistry.ts`) | `f54938f` |
| 6 | dry-run, фикстура-расширение, CI | `46dcb40` |
| 7 | Загрузка из хранилища 1С (`cf.loadFromStorage`) | `68dd293` |
| 8 | Переименование в AltEDT (name/displayName/publisher, README) | `1a2d3d0` |

Parent-репо: коммиты по этапам, последний `52664fe`.

## Решения (не менять без причины)

- Имя расширения `alt-edt`, publisher `alt-edt`, displayName «AltEDT».
- Префикс команд и настроек остаётся `1c-platform-tools.*` — обратная совместимость; смена сломала бы 112 файлов и CI.
- Неплатформенные источники баз кладутся в синтетические папки дерева: `/Реестр проекта`, `/Профили запуска`.
- `ibases.v8i` + `.v8-project.json` + `env*.json` — три источника, дедуп по `name|connect`.
- Плагин-API лежит в `shared/altEdtApi.ts`, реализация-реестр в `altEdtRegistry.ts`; интеграция в `baseSources.ts` и `showLaunchModePicker`.

## Текущее состояние: отладка основы — ЗАКРЫТО ✅

`npm test` — **2047 passing (vscode) + 253 passing (node), 0 failing**, код выхода 0. Коммит child `37534e0`.

Найдено и починено (7 падений → 0):
- `pathDefaults.test.ts` ищет `name === 'alt-edt'` (после переименования).
- `extraArgs` дописываются в **конец** argv: `args.at(-2) === '/C'`, `args.at(-1) === 'thick'`.
- `resolveFileIbConnectionString` нормализует путь: `/F"x"` → `/FC:\...` (кавычки снимаются).
- Запись в `ConfigurationTarget.Global` в тест-хосте **не применяется** → dry-run тест читает default из манифеста.
- Дрейф каталога: `infobase.create` **нельзя** добавлять в `agentCommandDescriptions` — тест требует, чтобы описание бралось из манифеста (`agentCommandDescription(...) === undefined`).
- Главное: хардкод id расширения сломался после переименования. Новый модуль `src/shared/extensionIdentity.ts` (`EXTENSION_PUBLISHER/NAME/ID`, `selfExtension()` — поиск себя по `packageJSON.name`). Заменено в `commandCatalog.ts`, `collectEnvironmentSummary.ts`, `features/tools/settingsSections.ts` (`@ext:${ID}`), `shared/ipcServer.ts` (`context.extension.id`).
- `hooks.schema.json` / `pipelines.schema.json` регенерированы (105 command id) — обязательно после добавления команды.

## Инфраструктура роя: локальные модели и ctxsum (2026-10-18)

**Локальный провайдер OpenCode** — `opencode.json` → `providers.local`:
`package: "@ai-sdk/openai-compatible"`, `settings: { baseURL: "http://127.0.0.1:11435/v1", apiKey: "ollama" }`.
Ключ `package`, **не** `npm` (npm — из deprecated-варианта `provider`). Модели: `local/dcostenco/prism-coder:2b`,
`local/dcostenco/prism-coder:4b`, `local/qwen3:8b`, `local/llama3.1:8b` — субагенты на них отвечают (проверено).

**ctxsum** — сервис локального суммарирования контекста, 0 токенов провайдера:
- `infra/compose.yml` сервис `ctxsum` (профиль `ollama`), порт хост `127.0.0.1:11436` → 8080; `ollama.ps1 up` поднимает его вместе с Ollama, `ollama.ps1 status` показывает здоровье.
- `infra/ctxsum/app.py` — только stdlib: `POST /summarize {transcript, model?, keep_raw?}` → `{summary, facts[], decisions[], open_tasks[], next_action, markdown, meta}`; `GET /health`. Нарезка на чанки 6000 симв.: `prism-coder:2b` на чанки → `qwen3:8b` на слияние. Сырой транскрипт в томе `ctxsum-state` — сжатие ничего не теряет.
- `infra/ctxsum/ctxsum.ps1` — шим для хуков: `-Transcript <файл|stdin> [-Out <файл>] [-Model]`, UTF-8 задан явно.
- Замер на `session-notes.md`: 3966 → 2692 симв. за 55 с, 14 фактов, 1 решение, 1 задача.

**Ловушки, потратившие время:**
- `ConvertTo-Json` в PS 5.1 отдаёт длинную строку как `{"value": …, "Length": N}` → сервер принимает оба вида.
- `curl -d "{…}"` в PS режет кавычки; `Invoke-RestMethod -InFile` рвёт тело. Работает только `--data-binary @file` (уже записано в `ollama.ps1`).
- solcache (`remember`) требует **нативный** Ollama на 11434; если он не запущен — `Невозможно соединиться`. Поднять: `ollama serve`.
- Дисплей PS гасит кириллицу — проверять байтами.

## Next Action

Слой 2/3 по решению пользователя: MCP-сервер `ctxsum-mcp` (доступ из Claude Code/Cursor/Cline) и хуки — команда `/compact-local` в OpenCode, `PreCompact`/`SessionStart` в Claude Code. Слой 1 готов и проверен.

## Окружение

Node 24.21, VS Code 1.142, Git 2.40. Платформы 1С: 8.3.25.1633, 8.3.27.1786/.2325/.2342. EDT 2025.2 (`1cedtcli` в PATH).
Тестовая база: `C:\open-project\vc\BD`. Реестр: `.v8-project.json` (не коммитится).
Кэш: Redis+Qdrant в Docker (`C:\Users\mad\.config\opencode\infra\compose.yml`), контейнеры `solcache-redis`, `solcache-qdrant`.
PowerShell гасит кириллицу в выводе — проверять по байтам, не по дисплею.

## Next Action

Добить `agentCommandDescriptions`: найти, какие ещё команды манифеста не описаны (тест `agentCommandDescriptions`), добавить записи — затем `npm test` до 0 failing, закоммитить в child repo, обновить README родителя (этап 8 отмечен ✅ уже).

## Отложено

- Этап 9 — формы (визуальный дизайнер). Готовые скиллы экосистемы: `form-info`, `form-edit`, `form-validate`, `form-compile` (`C:\Users\mad\.agents\skills\`). В форке уже есть `formViewerPanel.ts` (просмотр + правка свойств через `cf-form-item-properties-set`) и `formPanels.ts` (сохранение по Ctrl+S). Дизайнер = добавить операции структуры (add/move/remove элементов) поверх webview.
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

## Решение пользователя: Ollama только в Docker (2026-10-18)

Нативный Ollama на хосте (11434) **не поднимаем** — весь инференс роя в контейнере `swarm-ollama`
(хост-порт `11435`): и субагенты, и эмбеддинги solcache, и ctxsum.

- `solcache.ps1`: `$Ollama = "http://127.0.0.1:11435"`, переопределение `$env:SOLCACHE_OLLAMA`.
  Симптом старой схемы: `remember` падал «Невозможно соединиться», пока нативный Ollama был выключен.
- `ollama.ps1 status` показывает нативный порт как «должен быть выключен» и предупреждает, если он поднят.
- Обновлены правила в `infra/compose.yml`, `skills/solution-cache/SKILL.md`, `skills/swarm/SKILL.md`.
- Проверено при выключенной нативной Ollama: solcache get/recall работают (score 0.793), ctxsum `ok=true`,
  в VRAM 6.17 из 8 ГиБ (`qwen3:8b` 5.86 + `nomic-embed-text` 0.31).

## Сжатие контекста: переключатель и выгрузка сессии (2026-10-18)

**Команда вкл/выкл сжатия** — `infra/ctxsum/ctxctl.ps1`:
`status | on | off | toggle [-Threshold N]`. Состояние в `infra/ctxsum/compaction.json`.
Пока сжатие выключено, шим `ctxsum.ps1` отказывает (exit 3) — единая точка отказа,
хуки не смогут сжать контекст, даже если о флаге забыли. Ручной вызов: `-Force`.

**qwen3:8b больше не выгружается**: `ollama.ps1 warm` теперь пиннит её с `keep_alive=-1`,
и ctxsum шлёт `keep_alive=-1` для модели качества (быстрая 2b — `10m`, в 8 ГиБ VRAM
обе не помещаются). В VRAM держится 5.90 ГиБ.

**Выгрузка сессии агента** — `infra/ctxsum/dump-session.py` (сессии лежат в SQLite
`~/.local/share/opencode/opencode.db`, схема: `session_v2` + `session_message`):
```powershell
docker run --rm -v "$HOME\.local\share\opencode\opencode.db:/data/session.db:ro" `
  -v "C:\Users\mad\.config\opencode\infra\ctxsum:/tool:ro" -v C:\out:/out `
  python:3.12-slim python /tool/dump-session.py --db /data/session.db --out /out/transcript.md `
  --dir "C:\open-project\alt_edt" --max-chars 120000
```
Особенности схемы: у пользователя текст в корне `data.text`, у ассистента — `data.content`
(части `text`/`tool`; `reasoning` отбрасываем); путь проекта записан со слэшами.

**Замер на реальной сессии**: 92 531 → 19 421 символ (−79 %) за 130 с; на выходе
сводка, факты, решения, открытые задачи, следующий шаг. Результат — `session-handoff.md`.

**Устойчивость ctxsum** (добавлено после падения на длинном диалоге): модель обрезает
json на длинных ответах → повтор с кратким промптом, затем деление чанка пополам
(глубина 2), слияние больших дайджестов — попарно; при неудаче отдаётся накопленное.
`num_predict=2000`.

## Ловушка PS 5.1, задевшая дважды

**Все `.ps1` в `infra` обязаны быть с BOM.** Без BOM PS 5.1 читает файл как ANSI →
кириллица портится и ломает парсер (`ParserError` на `{` и `}`).
Проверено: `ctxctl.ps1` и `ctxsum.ps1` не запускались, пока BOM не добавлен.

## Слой 2: MCP-сервер ctxsum — любой агент (2026-10-18)

`infra/ctxsum/mcp_server.py` — MCP поверх stdio без зависимостей, ходит в сервис по HTTP.
Три инструмента: `compact_session`, `summarize_text`, `compaction_status`.

OpenCode подключён в `~/.config/opencode/opencode.json`:
`mcp.ctxsum = {type:'local', command:['docker','exec','-i','swarm-ctxsum','python','-u','/tool/mcp_server.py']}`.
Для Claude Code — одна команда: `claude mcp add ctxsum -- docker exec -i swarm-ctxsum python -u /tool/mcp_server.py`
(тот же stdio; хуки `PreCompact`/`SessionStart` — в `infra/ctxsum/README.md`).
Команда OpenCode `/compact-local` — `~/.config/opencode/command/compact-local.md`.

Сервис теперь умеет и сам брать сессию: `POST /compact-session {dir,max_chars}` — БД агента
(`opencode.db`) смонтирован в контейнер read-only. Флаг сжатия сервис читает из
`compaction.json` (источник истины — хостовый `ctxctl.ps1`) и отказывает кодом 409.
Проверено сквозным MCP-вызовом: 40 032 → 9 342 симв.

**Ловушка Docker**: правка файла, смонтированного bind-mount'ом, не перезапускает процесс —
`docker compose up -d` пишет «Container Running», а запросы падают со старой ошибкой.
После правки `app.py` нужен `docker restart swarm-ctxsum`.

## VRAM-ограничение: qwen и 2b не помещаются вместе (2026-10-18)

GPU RTX 3070, 8 ГиБ. `qwen3:8b` занимает 5.86 ГиБ, `prism-coder:2b` — ~3 ГиБ;
вместе 8.9 ГиБ, поэтому загрузка 2b на фазе чанков **вытесняла qwen**, а следующий
вызов снова платил холодную загрузку (~13 с). Решение: `FAST_MODEL` пустой — весь
конвейер на модели качества. Проверено: 30 032 → 6 390 симв. за 133 с, в VRAM только
`qwen3:8b` (5.86 ГиБ), вытеснения нет. Вернуть 2b — только если в VRAM есть запас.

**Ловушка Ollama API**: `keep_alive: "-1"` строкой → `HTTP 400 time: missing unit in
duration "-1"`. Для «навсегда» нужно число `-1` либо не слать поле вовсе: в compose
уже `OLLAMA_KEEP_ALIVE=24h`. Признак поломки коварен — сервис отдаёт пустую сводку
за 0.1 с (все чанки пропущены), поэтому проверять надо `chars_out`.

## Почему MCP показывал error (2026-10-18)

MCP запускался как `docker exec -i swarm-ctxsum python /tool/mcp_server.py`, то есть его
stdio-канал жил **внутри контейнера сервиса**. Мой `docker restart swarm-ctxsum` (правка
`keep_alive`) убил все exec-сессии — у всех подключённых агентов MCP стал error, хотя сам
сервис был здоров.

Лечение (проверено): отдельный контейнер `swarm-ctxsum-mcp`, общение по HTTP
(`CTXSUM_URL=http://ctxsum:8080`). Контейнер живёт как exec-хост (`sleep infinity`):
`mcp_server.py` читает stdin и выходит при закрытом stdin, поэтому на постоянном запуске
он уходил бы в рестарт — клиент поднимает процесс сам.
Тест: `docker restart swarm-ctxsum` → MCP-контейнер жив, рукопожатие и tools/call проходят.

Правило на будущее: **MCP-обёртки не держать внутри перезапускаемых сервисных контейнеров.**

## Next Action

Слой 3 (хуки) — по необходимости: Claude Code на машине не установлен, хуки для него
описаны в `infra/ctxsum/README.md` и включаются одной строкой в `settings.json`.

## Окружение

Node 24.21, VS Code 1.142, Git 2.40. Платформы 1С: 8.3.25.1633, 8.3.27.1786/.2325/.2342. EDT 2025.2 (`1cedtcli` в PATH).
Тестовая база: `C:\open-project\vc\BD`. Реестр: `.v8-project.json` (не коммитится).
Кэш: Redis+Qdrant в Docker (`C:\Users\mad\.config\opencode\infra\compose.yml`), контейнеры `solcache-redis`, `solcache-qdrant`.
PowerShell гасит кириллицу в выводе — проверять по байтам, не по дисплею.

## Next Action

Добить `agentCommandDescriptions`: найти, какие ещё команды манифеста не описаны (тест `agentCommandDescriptions`), добавить записи — затем `npm test` до 0 failing, закоммитить в child repo, обновить README родителя (этап 8 отмечен ✅ уже).

## Отложено

- Этап 9 — формы (визуальный дизайнер). Готовые скиллы экосистемы: `form-info`, `form-edit`, `form-validate`, `form-compile` (`C:\Users\mad\.agents\skills\`). В форке уже есть `formViewerPanel.ts` (просмотр + правка свойств через `cf-form-item-properties-set`) и `formPanels.ts` (сохранение по Ctrl+S). Дизайнер = добавить операции структуры (add/move/remove элементов) поверх webview.
# Журнал изменений

Все заметные изменения в репозитории `alt_edt` будут задокументированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/).

## [0.9.17] - 2026-10-18

### Новые возможности

- **gitflow:** Инициализирована модель ветвления Git Flow (master/develop/feature/release/hotfix)
- **tdd:** Добавлена методология разработки через тестирование (Red-Green-Refactor)
- **pre-commit:** Добавлены хуки pre-commit с lint-staged и npm test

### Документация

- Добавлен GIT_FLOW.md с правилами ветвления и conventional commits
- Добавлен TDD_METHODOLOGY.md с правилами цикла разработки
- Добавлен этот CHANGELOG.md

### Инфраструктура

- Перенесена документация проекта в корневой репозиторий
- Настроен remote `origin` → `https://github.com/madmar1o/altedt.git`

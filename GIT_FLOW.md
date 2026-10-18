# Git Flow для проекта AltEDT

## Обзор

В проекте используется модель ветвления Git Flow (по Vincent Driessen) с следующими ветками:

## Структура веток

### Постоянные ветки

| Ветка | Назначение | Защита |
|-------|-----------|--------|
| `master` | Производственный код, готовые к релизу версии | Да (требуется PR + ревью) |
| `develop` | Основная ветка разработки, интеграция фич | Да (требуется PR + ревью) |

### Временные ветки

| Тип | Префикс | Назначение | Откуда создавать | В什么 мержить |
|-----|---------|-----------|-----------------|---------------|
| Feature | `feature/` | Новая функциональность | `develop` | `develop` |
| Release | `release/` | Подготовка релиза | `develop` | `develop` + `master` |
| Hotfix | `hotfix/` | Критическое исправление продакшена | `master` | `develop` + `master` |

## Правила работы

### 1. Начало работы над функционалом (Feature)

```bash
# Переключиться на develop
git checkout develop
git pull origin develop

# Создать feature-ветку
git checkout -b feature/название-функции

# Разрабатывать, коммитить, пушить
git add .
git commit -m "feat: описание изменений"
git push origin feature/название-функции

# Создать Pull Request в develop
```

### 2. Завершение функции (Feature -> Develop)

1. Создать Pull Request из `feature/xxx` в `develop`
2. Пройти код ревью (минимум 1 aprobación)
3. Пройти все тесты (CI)
4. Сделать squash и мерж в `develop`
5. Удалить feature-ветку

### 3. Подготовка релиза (Release)

```bash
# Создать release-ветку из develop
git checkout develop
git checkout -b release/v0.9.17

# Обновить версии, changelog, проверить тесты
# Коммитить исправления только багов релиза

# Завершить релиз
git checkout master
git merge --no-ff release/v0.9.17
git tag v0.9.17
git checkout develop
git merge --no-ff release/v0.9.17
git push origin master develop --tags
```

### 4. Горячее исправление (Hotfix)

```bash
# Создать hotfix-ветку из master
git checkout master
git checkout -b hotfix/описание-исправления

# Исправить баг, обновить версию (patch)
git commit -m "fix: критическое исправление"

# Мержить в master и develop
git checkout master
git merge --no-ff hotfix/описание-исправления
git tag v0.9.17.1
git checkout develop
git merge --no-ff hotfix/описание-исправления
git push origin master develop --tags
```

## Требования к коммитам

Используется conventional commits:

```
<тип>[область]: описание

[тело]

[подвал]
```

### Типы коммитов

| Тип | Назначение |
|-----|-----------|
| `feat` | Новая функциональность |
| `fix` | Исправление бага |
| `docs` | Изменение документации |
| `style` | Форматирование, Missing semicolons и т.д. |
| `refactor` | Рефакторинг кода без изменения функционала |
| `test` | Добавление или изменение тестов |
| `chore` | Изменение процесса сборки, инструментов, инфраструктуры |
| `perf` | Улучшение производительности |
| `ci` | Изменение CI конфигурации |
| `build` | Изменение системы сборки |

### Примеры

```bash
git commit -m "feat(плагин): добавить команду выгрузки конфигурации"
git commit -m "fix(база): исправить подключение к файловой ИБ"
git commit -m "test(редактор): добавить тесты для редактора форм"
git commit -m "docs(readme): обновить инструкцию по установке"
```

## Требования к Pull Request

1. Описание изменений
2. Ссылка на задачу (если есть)
3. Как проверить (шаги)
4. Скриншоты (для UI изменений)
5. Чеклист тестирования:
   - [ ] Unit тесты проходят
   - [ ] Интеграционные тесты проходят
   - [ ] Ручное тестирование выполнено
   - [ ] Документация обновлена

## Защита веток

- `master` и `develop` защищены
- Нельзя делать push напрямую
- Требуется PR и код ревью
- Нельзя мержить без прохождения всех тестов

## Версионирование

Используется Semantic Versioning (SemVer):

```
MAJOR.MINOR.PATCH
```

- `MAJOR` — изменения с обратной несовместимостью
- `MINOR` — новая функциональность с обратной совместимостью
- `PATCH` — исправление багов с обратной совместимостью

## CI/CD конвейер

1. Pull Request -> Запуск тестов -> Code Review -> Мерж
2. Push в `master` -> Сборка .vsix -> GitHub Release
3. Push в `develop` -> Сборка -> Деплой на тестовый сервер

# Выпуск v0.9.17 — инструкция по установке

Этот документ описывает, как скачать релиз, установить зависимости и подключить плагин.

## 1. Скачать релиз

### Вариант А: через VS Code Marketplace (рекомендуется)

Откройте панель расширений (`Ctrl+Shift+X`) и найдите `1C: Platform Tools` или `AltEDT`.

### Вариант Б: через .vsix файл с GitHub

1. Перейдите на страницу релизов:  
   https://github.com/madmar1o/altedt/releases

2. Скачайте файл `alt-edt-0.9.17.vsix` из раздела **Assets**.

3. В VS Code:  
   `F1` → `Extensions: Install from VSIX…` → выберите скачанный `.vsix` файл.

### Вариант В: из исходников

```powershell
git clone https://github.com/madmar1o/altedt.git
cd altd_edt/alt-edt
git checkout master
npm install
npm run compile
npx @vscode/vsce package   # собирает .vsix
```

## 2. Установить зависимости

Плагин требует следующее окружение:

| Инструмент | Назначение | Установка |
|------------|------------|-----------|
| **Node.js** ≥ 20 | Запуск плагина и тестов | https://nodejs.org |
| **npm** ≥ 11 | Управление пакетами | вместе с Node.js |
| **Платформа 1С:Предприятие 8.3** | Запуск ИБ, отладка | https://releases.1c.ru |
| **OneScript** + **OPM** | Запуск vanessa-runner, тесты | https://oscript.io |
| **vanessa-runner** | Тестирование 1С | `opm install vanessa-runner` |

Внутри плагина зависимости устанавливаются через дерево **1С: Инструменты → Зависимости** или команду:

```
1С: Зависимости: Установить зависимости
```

## 3. Установить плагин

### Из маркетплейса

1. Откройте VS Code (Cursor, Windsurf, VSCodium).
2. `Ctrl+Shift+X` → найдите `AltEDT` → `Установить`.
3. Перезагрузите окно (`Ctrl+Shift+P` → `Developer: Reload Window`).

### Из .vsix файла

1. `Ctrl+Shift+P` → `Extensions: Install from VSIX…`
2. Укажите путь к скачанному `alt-edt-0.9.17.vsix`.
3. Перезагрузите окно.

## 4. Подключить патч

Если у вас есть файл патча (`.patch` или `.diff`):

```powershell
# В корне репозитория плагина
git apply patch-file.patch
```

Или через Git:

```powershell
git am patch-file.patch
```

После применения патча пересоберите плагин:

```powershell
cd alt-edt
npm install
npm run compile
npx @vscode/vsce package
```

И установите обновлённый `.vsix` повторно (см. раздел **Установить плагин**).

## 5. Прогнать тесты (в Docker-песочнице)

### Способ А: готовый Docker-образ (быстрый старт)

Собрать и запустить тесты в одном командном вызове:

```powershell
# Из корня репозитория alt-edt
docker build -t altdt-test:v0.9.17 -f Dockerfile.test .
docker run --rm altdt-test:v0.9.17 npm run test:node
```

### Способ Б: интерактивная песочница

```powershell
# Сборка образа
docker build -t altdt-test:v0.9.17 -f Dockerfile.test .

# Интерактивный запуск с bash
docker run --rm -it altdt-test:v0.9.17 /bin/bash

# Внутри контейнера:
cd /app
npm install          # шаг 2: установить зависимости
npm run compile      # компиляция TypeScript
npm run test:node    # шаг 4: прогон node-тестов
```

### Ожидаемый результат

```
ℹ tests 247
ℹ pass 238
ℹ fail 1      ← 알려진 limitation Linux (см. ниже)
ℹ cancelled 0
ℹ skipped 8   ← Windows-специфичные тесты
```

### Известное ограничение в Docker/Linux

Один тест `на POSIX файл без права на исполнение не situés` (`executableLookup.test.ts`) падает на Linux, так как фикстура `oscript.bat` существует в контейнере и находится `findExecutable`, хотя на Windows этот тест пропускается. Это предуexisting проблема теста, не связанная с изменениями v0.9.17. Все остальные 238 тестов проходят.

### Документация Docker-режима плагина

Включение выполнения команд vrunner внутри контейнера (`.vscode/settings.json`):

```json
{
  "1c-platform-tools.docker.enabled": true,
  "1c-platform-tools.docker.image": "your-registry/vrunner:8.3.27"
}
```

Подробнее — в `alt-edt/docs/docker.md`.

## Версии

| Версия | Дата | Статус |
|--------|------|--------|
| 0.9.17 | 2026-10-18 | Текущий релиз |

Предыдущие версии см. в [CHANGELOG.md](./alt-edt/CHANGELOG.md).

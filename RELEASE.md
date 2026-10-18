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

Плагин поддерживает прогон тестов в Docker-контейнере (docker-outside-of-docker):

### Включение Docker-режима

В `.vscode/settings.json` или пользовательских настройках:

```json
{
  "1c-platform-tools.docker.enabled": true,
  "1c-platform-tools.docker.image": "your-registry/vrunner:8.3.27"
}
```

### Запуск тестов

```powershell
cd alt-edt
npm test
```

Или только node-тесты (без VS Code):

```powershell
npm run test:node
```

Ожидаемый результат: все тесты проходят, `0 failing`.

## Версии

| Версия | Дата | Статус |
|--------|------|--------|
| 0.9.17 | 2026-10-18 | Текущий релиз |

Предыдущие версии см. в [CHANGELOG.md](./alt-edt/CHANGELOG.md).

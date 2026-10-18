/**
 * Утилиты для работы с версиями конфигурации 1С
 */

export interface Version {
    major: number;
    minor: number;
    patch: number;
    build: number;
}

/**
 * Разбирает строку версии в объект Version
 * Формат: major.minor.patch[.build]
 */
export function parseVersion(version: string): Version {
    if (!version || typeof version !== 'string') {
        throw new Error('Версия должна быть непустой строкой');
    }

    const parts = version.split('.').map(Number);

    if (parts.some(isNaN)) {
        throw new Error(`Некорректный формат версии: ${version}`);
    }

    return {
        major: parts[0] || 0,
        minor: parts[1] || 0,
        patch: parts[2] || 0,
        build: parts[3] || 0,
    };
}

/**
 * Сравнивает две версии
 * Возвращает -1 если первая меньше, 0 если равны, 1 если первая больше
 */
export function compareVersions(v1: string, v2: string): number {
    const a = parseVersion(v1);
    const b = parseVersion(v2);

    if (a.major !== b.major) {
        return a.major < b.major ? -1 : 1;
    }
    if (a.minor !== b.minor) {
        return a.minor < b.minor ? -1 : 1;
    }
    if (a.patch !== b.patch) {
        return a.patch < b.patch ? -1 : 1;
    }
    if (a.build !== b.build) {
        return a.build < b.build ? -1 : 1;
    }

    return 0;
}

/**
 * Форматирует объект Version в строку
 * Если build равен 0, он не включается в строку
 */
export function formatVersion(version: Version): string {
    const parts = [version.major, version.minor, version.patch];
    if (version.build > 0) {
        parts.push(version.build);
    }
    return parts.join('.');
}

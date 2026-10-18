import * as assert from 'node:assert';
import { parseVersion, compareVersions, formatVersion } from '../../shared/versionUtils';

suite('Версии конфигурации 1С - versionUtils', () => {

    test('parseVersion должен корректно разбирать строку версии', () => {
        const result = parseVersion('8.3.27.2342');
        assert.deepStrictEqual(result, { major: 8, minor: 3, patch: 27, build: 2342 });
    });

    test('parseVersion должен обрабатывать версию без номера сборки', () => {
        const result = parseVersion('8.3.27');
        assert.deepStrictEqual(result, { major: 8, minor: 3, patch: 27, build: 0 });
    });

    test('compareVersions должен вернуть -1 если первая версия меньше', () => {
        const result = compareVersions('8.3.25', '8.3.27');
        assert.strictEqual(result, -1);
    });

    test('compareVersions должен вернуть 0 если версии равны', () => {
        const result = compareVersions('8.3.27.2342', '8.3.27.2342');
        assert.strictEqual(result, 0);
    });

    test('compareVersions должен вернуть 1 если первая версия больше', () => {
        const result = compareVersions('8.3.27', '8.3.25');
        assert.strictEqual(result, 1);
    });

    test('formatVersion должен форматировать объект версии в строку', () => {
        const result = formatVersion({ major: 8, minor: 3, patch: 27, build: 2342 });
        assert.strictEqual(result, '8.3.27.2342');
    });

    test('formatVersion должен обрабатывать версию без номера сборки', () => {
        const result = formatVersion({ major: 8, minor: 3, patch: 27, build: 0 });
        assert.strictEqual(result, '8.3.27');
    });

    test('parseVersion должен выбрасывать ошибку на некорректный формат', () => {
        assert.throws(() => parseVersion('invalid'), Error);
    });

    test('parseVersion должен выбрасывать ошибку на пустую строку', () => {
        assert.throws(() => parseVersion(''), Error);
    });
});

/**
 * Режимы запуска базы: модель палитры (чистая, без vscode).
 * Запуск: npm run test:node
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { cestartSpec, LAUNCH_MODES, type LaunchModeId } from '../../features/ibases/launchModes';

describe('модель режимов запуска', () => {
	test('режимов шесть, идентификаторы уникальны', () => {
		assert.equal(LAUNCH_MODES.length, 6);
		const ids = LAUNCH_MODES.map((mode) => mode.id);
		assert.equal(new Set(ids).size, ids.length);
		assert.deepEqual(
			ids.sort(),
			['configurator', 'debug', 'enterprise', 'enterpriseThick', 'server', 'web'].sort()
		);
	});

	test('каждый режим подписан и с иконкой', () => {
		for (const mode of LAUNCH_MODES) {
			assert.ok(mode.label.length > 0, `нет названия у ${mode.id}`);
			assert.ok(mode.icon.length > 0, `нет иконки у ${mode.id}`);
		}
	});

	test('cestartSpec: у ibsrv-режимов спецификации нет', () => {
		assert.equal(cestartSpec('web'), undefined);
		assert.equal(cestartSpec('server'), undefined);
	});

	test('cestartSpec: толстый клиент — ENTERPRISE с ключом /C thick', () => {
		const spec = cestartSpec('enterpriseThick');
		assert.ok(spec);
		assert.equal(spec.mode, 'ENTERPRISE');
		assert.deepEqual(spec.extraArgs, ['/C', 'thick']);
	});

	test('cestartSpec: отладка — ENTERPRISE с ключом /DEBUG', () => {
		const spec = cestartSpec('debug');
		assert.ok(spec);
		assert.equal(spec.mode, 'ENTERPRISE');
		assert.deepEqual(spec.extraArgs, ['/DEBUG']);
	});

	test('cestartSpec: тонкий клиент и конфигуратор без дополнительных ключей', () => {
		for (const id of ['enterprise', 'configurator'] as const) {
			const spec = cestartSpec(id);
			assert.ok(spec, `нет спецификации у ${id}`);
			assert.deepEqual(spec.extraArgs, []);
		}
		assert.equal(cestartSpec('configurator')?.mode, 'DESIGNER');
	});

	test('cestartSpec принимает все идентификаторы модели', () => {
		for (const mode of LAUNCH_MODES) {
			const id: LaunchModeId = mode.id;
			assert.doesNotThrow(() => cestartSpec(id));
		}
	});
});

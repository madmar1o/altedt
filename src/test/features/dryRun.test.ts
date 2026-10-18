/**
 * Режим прогрева: настройка execution.dryRun объявлена в манифесте и читается как boolean.
 *
 * Проверка идёт по манифесту, а не через запись в конфигурацию: в тестовом хосте
 * запись в Global-цель не применяется, и такой тест мигал бы без причины.
 */
import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import { readFileSync } from 'node:fs';
import * as vscode from 'vscode';

const MANIFEST = path.resolve(__dirname, '../../..', 'package.json');

suite('dry-run режим', () => {
	test('настройка объявлена в манифесте как boolean с default false', () => {
		const pkg = JSON.parse(readFileSync(MANIFEST, 'utf8')) as {
			contributes?: { configuration?: Array<{ properties?: Record<string, { type?: string; default?: unknown }> }> };
		};
		const sections = pkg.contributes?.configuration ?? [];
		let found: { type?: string; default?: unknown } | undefined;
		for (const section of sections) {
			const schema = section.properties?.['1c-platform-tools.execution.dryRun'];
			if (schema) {
				found = schema;
				break;
			}
		}
		assert.ok(found, 'настройка 1c-platform-tools.execution.dryRun не объявлена');
		assert.equal(found.type, 'boolean');
		assert.equal(found.default, false);
	});

	test('расширение видит настройку в конфигурации и читает её как boolean', () => {
		const value = vscode.workspace
			.getConfiguration('1c-platform-tools')
			.get<boolean>('execution.dryRun');
		assert.equal(typeof value, 'boolean');
	});
});
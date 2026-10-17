/**
 * Dry-run режим: настройка execution.dryRun показывает команду без реального запуска.
 * Запуск: npm run test:node
 */
import * as assert from 'node:assert/strict';
import * as vscode from 'vscode';

suite('dry-run режим', () => {
	test('настройка существует и читается как boolean', async () => {
		const config = vscode.workspace.getConfiguration('1c-platform-tools');
		assert.ok(config.has('execution.dryRun'));
		await config.update('execution.dryRun', true, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get<boolean>('execution.dryRun'), true);
		await config.update('execution.dryRun', false, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get<boolean>('execution.dryRun'), false);
	});
});

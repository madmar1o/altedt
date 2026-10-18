import * as assert from 'node:assert';
import { cestartSpec } from '../../features/ibases/launchModes';
import { launchInfobase } from '../../features/ibases/cestart';

suite('launchModes: extraArgs в launchInfobase', () => {
	test('толстый клиент: /C thick после штатных ключей', () => {
		const spawned: Array<{ command: string; args: readonly string[] }> = [];
		const spec = cestartSpec('enterpriseThick');
		assert.ok(spec);
		const result = launchInfobase('Тестовая', spec.mode, {
			find: () => ({ binary: 'C:\\1cestart.exe', bases: [] }),
			exists: () => true,
			extraArgs: spec.extraArgs,
			spawn: (command, args) => {
				spawned.push({ command, args });
			},
		});
		assert.ok(result.ok);
		const args = [...result.args];
		assert.equal(args[0], 'ENTERPRISE');
		// Ключи режима дописываются после штатных, поэтому стоят в конце списка.
		assert.equal(args.at(-2), '/C');
		assert.equal(args.at(-1), 'thick');
	});

	test('отладка: /DEBUG после штатных ключей', () => {
		const spec = cestartSpec('debug');
		assert.ok(spec);
		const result = launchInfobase('Тестовая', spec.mode, {
			find: () => ({ binary: 'C:\\1cestart.exe', bases: [] }),
			exists: () => true,
			extraArgs: spec.extraArgs,
			spawn: () => undefined,
		});
		assert.ok(result.ok);
		assert.ok(result.args.includes('/DEBUG'));
	});

	test('без extraArgs список ключей не меняется', () => {
		const result = launchInfobase('Тестовая', 'ENTERPRISE', {
			find: () => ({ binary: 'C:\\1cestart.exe', bases: [] }),
			exists: () => true,
			spawn: () => undefined,
		});
		assert.ok(result.ok);
		assert.ok(!result.args.includes('/C'), 'лишний ключ /C');
		assert.ok(!result.args.includes('/DEBUG'), 'лишний ключ /DEBUG');
	});
});

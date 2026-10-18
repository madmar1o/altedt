/**
 * Источники дерева баз: реестр проекта `.v8-project.json` и профили запуска.
 * Запуск: npm run test:node
 */
import { describe, test, after } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
	PROFILE_FOLDER,
	PROJECT_FOLDER,
	readLaunchProfiles,
	readProjectRegistry,
	readWorkspaceBases,
} from '../../features/ibases/baseSources';
import type { InfobaseEntry } from '../../shared/infobaseList';

const roots: string[] = [];

function makeRoot(): string {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'baseSources-test-'));
	roots.push(root);
	return root;
}

after(() => {
	for (const root of roots) {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

describe('реестр проекта .v8-project.json', () => {
	test('файловая и серверная базы попадают в папку «Реестр проекта»', () => {
		const root = makeRoot();
		fs.writeFileSync(
			path.join(root, '.v8-project.json'),
			JSON.stringify({
				databases: [
					{ id: 'dev', name: 'Разработка', type: 'file', path: 'Bases/Dev' },
					{ id: 'test', name: 'Тестовая', type: 'server', server: 'srv01', ref: 'MyApp_Test' },
				],
				default: 'dev',
			})
		);
		const entries = readProjectRegistry(root);
		assert.equal(entries.length, 2);
		assert.equal(entries[0].name, 'Разработка');
		assert.equal(entries[0].connect, `File="${path.resolve(root, 'Bases/Dev')}";`);
		assert.equal(entries[0].folder, PROJECT_FOLDER);
		assert.equal(entries[1].connect, 'Srvr="srv01";Ref="MyApp_Test";');
		assert.equal(entries[1].folder, PROJECT_FOLDER);
	});

	test('относительный путь базы разрешается от корня проекта', () => {
		const root = makeRoot();
		fs.writeFileSync(
			path.join(root, '.v8-project.json'),
			JSON.stringify({ databases: [{ id: 'dev', name: 'dev', type: 'file', path: 'build/ib' }] })
		);
		const entries = readProjectRegistry(root);
		assert.equal(entries[0].connect, `File="${path.resolve(root, 'build/ib')}";`);
	});

	test('имя без имени берётся из id, запись без подключения пропускается', () => {
		const root = makeRoot();
		fs.writeFileSync(
			path.join(root, '.v8-project.json'),
			JSON.stringify({
				databases: [{ id: 'vc', type: 'file', path: 'vc' }, { id: 'broken', name: 'Без подключения' }],
			})
		);
		const entries = readProjectRegistry(root);
		assert.equal(entries.length, 1);
		assert.equal(entries[0].name, 'vc');
	});

	test('нет файла или битый JSON — пустой список', () => {
		assert.deepEqual(readProjectRegistry(makeRoot()), []);

		const broken = makeRoot();
		fs.writeFileSync(path.join(broken, '.v8-project.json'), '{oops');
		assert.deepEqual(readProjectRegistry(broken), []);

		const notAnObject = makeRoot();
		fs.writeFileSync(path.join(notAnObject, '.v8-project.json'), '[1,2]');
		assert.deepEqual(readProjectRegistry(notAnObject), []);
	});
});

describe('профили запуска', () => {
	test('env.json: база профиля из --ibconnection, папка «Профили запуска»', () => {
		const root = makeRoot();
		fs.writeFileSync(path.join(root, 'env.json'), JSON.stringify({ default: { '--ibconnection': '/F./build/ib' } }));
		const entries = readLaunchProfiles(root);
		assert.equal(entries.length, 1);
		assert.equal(entries[0].name, 'По умолчанию');
		assert.equal(entries[0].folder, PROFILE_FOLDER);
		assert.equal(entries[0].connect, `File="${path.resolve(root, 'build/ib')}";`);
	});

	test('autumn-properties.json: формат 3.x с серверной строкой', () => {
		const root = makeRoot();
		fs.writeFileSync(
			path.join(root, 'autumn-properties.json'),
			JSON.stringify({ vrunner: { ibconnection: '/Slocalhost\\demo' } })
		);
		const entries = readLaunchProfiles(root);
		assert.equal(entries.length, 1);
		assert.equal(entries[0].connect, 'Srvr="localhost";Ref="demo";');
	});

	test('именованный профиль env.dev.json даёт запись «dev»', () => {
		const root = makeRoot();
		fs.writeFileSync(path.join(root, 'env.dev.json'), JSON.stringify({ default: { '--ibconnection': '/F/tmp/dev' } }));
		const entries = readLaunchProfiles(root);
		assert.equal(entries.length, 1);
		assert.equal(entries[0].name, 'dev');
	});

	test('комментарии в файле настроек разбору не мешают', () => {
		const root = makeRoot();
		fs.writeFileSync(path.join(root, 'env.json'), '// профиль\n{\n  "default": { "--ibconnection": "/F./build/ib" } // хвост\n}\n');
		assert.equal(readLaunchProfiles(root).length, 1);
	});

	test('профиль без строки подключения, env.local.json и битый файл не показываются', () => {
		const root = makeRoot();
		fs.writeFileSync(path.join(root, 'env.ci.json'), JSON.stringify({ default: {} }));
		fs.writeFileSync(path.join(root, 'env.local.json'), JSON.stringify({ '--ibconnection': '/F/tmp/x' }));
		fs.writeFileSync(path.join(root, 'autumn-properties.json'), '{oops');
		assert.deepEqual(readLaunchProfiles(root), []);
	});
});

describe('readWorkspaceBases', () => {
	const platformEntry: InfobaseEntry = {
		name: 'Платформенная',
		connect: 'File="plat";',
		folder: '/',
		orderInList: 1,
		orderInTree: 1,
	};

	test('порядок: платформа, затем реестры и профили папок', () => {
		const root = makeRoot();
		fs.writeFileSync(
			path.join(root, '.v8-project.json'),
			JSON.stringify({ databases: [{ id: 'p', name: 'Из реестра', type: 'file', path: 'p' }] })
		);
		fs.writeFileSync(path.join(root, 'env.json'), JSON.stringify({ default: { '--ibconnection': '/F/tmp/prof' } }));
		const merged = readWorkspaceBases([root], () => [platformEntry]);
		assert.deepEqual(
			merged.map((entry) => entry.name),
			['Платформенная', 'Из реестра', 'По умолчанию']
		);
	});

	test('дубль имени и строки подключения отбрасывается', () => {
		const root = makeRoot();
		const resolvedPlat = path.resolve(root, 'plat');
		fs.writeFileSync(
			path.join(root, '.v8-project.json'),
			JSON.stringify({ databases: [{ id: 'x', name: 'Платформенная', type: 'file', path: resolvedPlat }] })
		);
		const platformEntry: InfobaseEntry = {
			name: 'Платформенная',
			connect: `File="${resolvedPlat}";`,
			folder: '/',
			orderInList: 1,
			orderInTree: 1,
		};
		const merged = readWorkspaceBases([root], () => [platformEntry]);
		assert.equal(merged.length, 1);
		assert.equal(merged[0].folder, '/');
	});

	test('без рабочей области остаётся список платформы', () => {
		const merged = readWorkspaceBases([], () => [platformEntry]);
		assert.deepEqual(
			merged.map((entry) => entry.name),
			['Платформенная']
		);
	});
});

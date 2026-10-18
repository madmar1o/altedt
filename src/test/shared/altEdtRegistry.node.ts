/**
 * Реестр сторонних расширений AltEDT: регистрация, дедупликация, сброс.
 * Запуск: npm run test:node
 */
import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
	createAltEdtApi,
	resetAltEdtRegistry,
	altEdtBaseProviders,
	altEdtLaunchModes,
	altEdtCommandGroups,
	altEdtPanels,
} from '../../shared/altEdtRegistry';
import type { IBaseProvider, ILaunchMode, ICommandGroup, IPanel } from '../../shared/altEdtApi';
import type { InfobaseEntry } from '../../shared/infobaseList';

function makeBaseEntry(name: string): InfobaseEntry {
	return { name, connect: `File="${name}";`, folder: '/Тест', orderInList: 0, orderInTree: 0 };
}

function makeBaseProvider(id: string, folder: string): IBaseProvider {
	return {
		id,
		folder,
		read: () => [makeBaseEntry(id)],
	};
}

function makeLaunchMode(id: string): ILaunchMode {
	return {
		id,
		label: `Режим ${id}`,
		launch: () => undefined,
	};
}

function makeCommandGroup(id: string): ICommandGroup {
	return {
		id,
		title: `Группа ${id}`,
		commands: { doIt: 'Сделать' },
	};
}

function makePanel(id: string): IPanel {
	return {
		id,
		title: `Панель ${id}`,
		getTreeDataProvider: () => ({}),
	};
}

beforeEach(() => {
	resetAltEdtRegistry();
});

describe('createAltEdtApi', () => {
	test('регистрирует источник баз', () => {
		const api = createAltEdtApi();
		api.registerBaseProvider(makeBaseProvider('ext1', '/Расширение 1'));
		assert.equal(altEdtBaseProviders().length, 1);
		assert.equal(altEdtBaseProviders()[0].id, 'ext1');
	});

	test('дубликат источника баз не добавляется повторно', () => {
		const api = createAltEdtApi();
		api.registerBaseProvider(makeBaseProvider('ext1', '/Расширение 1'));
		api.registerBaseProvider(makeBaseProvider('ext1', '/Другая папка'));
		assert.equal(altEdtBaseProviders().length, 1);
	});

	test('регистрирует режим запуска', () => {
		const api = createAltEdtApi();
		api.registerLaunchMode(makeLaunchMode('custom'));
		assert.equal(altEdtLaunchModes().length, 1);
		assert.equal(altEdtLaunchModes()[0].id, 'custom');
	});

	test('дубликат режима запуска не добавляется повторно', () => {
		const api = createAltEdtApi();
		api.registerLaunchMode(makeLaunchMode('custom'));
		api.registerLaunchMode(makeLaunchMode('custom'));
		assert.equal(altEdtLaunchModes().length, 1);
	});

	test('регистрирует группу команд', () => {
		const api = createAltEdtApi();
		api.registerCommandGroup(makeCommandGroup('grp1'));
		assert.equal(altEdtCommandGroups().length, 1);
		assert.equal(altEdtCommandGroups()[0].id, 'grp1');
	});

	test('регистрирует панель', () => {
		const api = createAltEdtApi();
		api.registerPanel(makePanel('panel1'));
		assert.equal(altEdtPanels().length, 1);
		assert.equal(altEdtPanels()[0].id, 'panel1');
	});

	test('разные расширения не видят чужие регистрации через один API', () => {
		const api1 = createAltEdtApi();
		const api2 = createAltEdtApi();
		api1.registerBaseProvider(makeBaseProvider('ext1', '/Папка 1'));
		api2.registerBaseProvider(makeBaseProvider('ext2', '/Папка 2'));
		assert.equal(altEdtBaseProviders().length, 2);
	});
});

describe('resetAltEdtRegistry', () => {
	test('очищает все регистрации', () => {
		const api = createAltEdtApi();
		api.registerBaseProvider(makeBaseProvider('ext1', '/Папка'));
		api.registerLaunchMode(makeLaunchMode('custom'));
		api.registerCommandGroup(makeCommandGroup('grp'));
		api.registerPanel(makePanel('panel'));
		resetAltEdtRegistry();
		assert.equal(altEdtBaseProviders().length, 0);
		assert.equal(altEdtLaunchModes().length, 0);
		assert.equal(altEdtCommandGroups().length, 0);
		assert.equal(altEdtPanels().length, 0);
	});
});

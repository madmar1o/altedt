/**
 * Тестовое расширение-фикстура для проверки AltEdtApi.
 *
 * Регистрирует источник баз, режим запуска, группу команд и панель
 * через публичный API AltEDT.
 */
import * as vscode from 'vscode';
import type { IAltEdtApi } from '../../../shared/altEdtApi';
import type { InfobaseEntry } from '../../../shared/infobaseList';

function makeFixtureBase(name: string): InfobaseEntry {
	return {
		name,
		connect: `File="C:\\fixtures\\${name}";`,
		folder: '/Фикстуры',
		orderInList: 0,
		orderInTree: 0,
	};
}

export function activate(context: vscode.ExtensionContext, api: IAltEdtApi) {
	// Источник баз
	api.registerBaseProvider({
		id: 'fixtures.provider',
		folder: '/Фикстуры',
		read: () => [makeFixtureBase('Фикстура 1'), makeFixtureBase('Фикстура 2')],
	});

	// Режим запуска
	api.registerLaunchMode({
		id: 'fixtures.custom',
		label: 'Кастомный режим (фикстура)',
		description: 'Тестовый режим запуска',
		launch: (base) => {
			void vscode.window.showInformationMessage(`[fixture] запуск «${base.name}»`);
		},
	});

	// Группа команд
	api.registerCommandGroup({
		id: 'fixtures.group',
		title: 'Группа фикстур',
		commands: {
			hello: 'Say Hello',
		},
	});

	// Панель
	api.registerPanel({
		id: 'fixtures.panel',
		title: 'Панель фикстур',
		getTreeDataProvider: () => ({
			getChildren: () => [],
			getTreeItem: (item: unknown) => item as vscode.TreeItem,
		}),
	});

	context.subscriptions.push(
		vscode.commands.registerCommand('alt-edt-test-fixtures.hello', () => {
			void vscode.window.showInformationMessage('AltEDT fixture hello');
		})
	);
}

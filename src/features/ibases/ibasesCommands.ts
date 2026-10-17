/**
 * Команды списка информационных баз: запуск через 1cestart и выбор из палитры.
 *
 * Учётки профиля запуска сюда не подставляются — только имя записи v8i.
 */

import * as vscode from 'vscode';
import { logger } from '../../shared/logger';
import { infobaseConnectionString, readInfobases, type InfobaseEntry } from '../../shared/infobaseList';
import { projectPlatformRoots } from '../../shared/platformSettings';
import {
	CESTART_NOT_FOUND_MESSAGE,
	launchInfobase,
	launchStartWindow,
	shouldPassIbName,
	type CestartMode,
} from './cestart';
import { launchEdtStart } from './edtStart';
import { cestartSpec, LAUNCH_MODES, type LaunchModeId } from './launchModes';
import type { IbasesProvider } from './ibasesProvider';
import { IbaseItem } from './nodes';

const log = logger.scope('ibases');

/** Команды ibsrv, которые предлагает палитра режима «Автономный сервер». */
const SERVER_ACTIONS: ReadonlyArray<{ command: string; label: string; icon: string }> = [
	{ command: '1c-platform-tools.server.start', label: 'Запустить сервер', icon: 'play' },
	{ command: '1c-platform-tools.server.debug', label: 'Запустить с отладкой', icon: 'debug-alt' },
	{ command: '1c-platform-tools.server.openInBrowser', label: 'Открыть в браузере', icon: 'globe' },
	{ command: '1c-platform-tools.server.showLogs', label: 'Показать журнал', icon: 'output' },
	{ command: '1c-platform-tools.server.stop', label: 'Остановить', icon: 'debug-stop' },
];

const ENTERPRISE_BUTTON: vscode.QuickInputButton = {
	iconPath: new vscode.ThemeIcon('play'),
	tooltip: 'Предприятие',
};

const DESIGNER_BUTTON: vscode.QuickInputButton = {
	iconPath: new vscode.ThemeIcon('tools'),
	tooltip: 'Конфигуратор',
};

/** Строка выбора базы в палитре. */
interface IbasePickItem extends vscode.QuickPickItem {
	readonly entry: InfobaseEntry;
}

/**
 * Запускает базу и показывает ошибку, если запуск не удался.
 *
 * @param entry - Запись списка платформы
 * @param mode - Предприятие или Конфигуратор
 * @param extraArgs - Дополнительные ключи стартеру (режимы толстый клиент, отладка)
 * @returns Промис, который разрешается после запуска или отказа
 */
async function runInfobase(entry: InfobaseEntry, mode: CestartMode, extraArgs: readonly string[] = []): Promise<void> {
	const result = launchInfobase(entry.name, mode, {
		roots: projectPlatformRoots(),
		connect: entry.connect,
		useIbName: shouldPassIbName(
			entry.name,
			readInfobases().map((item) => item.name)
		),
		extraArgs,
	});
	if (result.ok) {
		log.info(`запуск ${mode} «${entry.name}»: ${result.binary} ${result.args.join(' ')}`);
		return;
	}
	await showLaunchFailure(result.message);
}

/** Открывает окно запуска платформы со списком баз. */
async function openStartWindow(): Promise<void> {
	const result = launchStartWindow({ roots: projectPlatformRoots() });
	if (result.ok) {
		log.info(`окно запуска платформы: ${result.binary}`);
		return;
	}
	await showLaunchFailure(result.message);
}

/**
 * Показывает, почему запуск не удался; без стартера предлагает открыть настройку каталога платформы.
 *
 * @param message - Причина
 */
async function showLaunchFailure(message: string): Promise<void> {
	log.warn(message);
	if (message !== CESTART_NOT_FOUND_MESSAGE) {
		void vscode.window.showErrorMessage(message);
		return;
	}
	const choice = await vscode.window.showErrorMessage(message, 'Настройки');
	if (choice === 'Настройки') {
		await vscode.commands.executeCommand('workbench.action.openSettings', '1c-platform-tools.platform.path');
	}
}

/** Открывает окно 1C:EDT Start: его проекты это рабочие области EDT, по одной под базу. */
function openEdtStart(): void {
	const result = launchEdtStart();
	if (result.ok) {
		log.info(`окно 1C:EDT Start: ${result.binary} ${result.args.join(' ')}`);
		return;
	}
	log.warn(result.message);
	void vscode.window.showErrorMessage(result.message);
}

/**
 * Берёт запись базы из узла дерева.
 *
 * @param node - Аргумент команды
 * @returns Запись или undefined
 */
function ibaseEntryFrom(node: unknown): InfobaseEntry | undefined {
	return node instanceof IbaseItem ? node.entry : undefined;
}

/**
 * Собирает строки QuickPick из текущего списка платформы.
 *
 * @returns Элементы выбора
 */
function pickItems(): IbasePickItem[] {
	return readInfobases()
		.map((entry) => ({
			label: entry.name,
			description: infobaseConnectionString(entry.connect),
			detail: entry.folder === '/' ? undefined : entry.folder,
			buttons: [ENTERPRISE_BUTTON, DESIGNER_BUTTON],
			entry,
		}))
		.sort(
			(left, right) =>
				(left.detail ?? '').localeCompare(right.detail ?? '', 'ru') ||
				left.label.localeCompare(right.label, 'ru')
		);
}

/**
 * Показывает список баз в палитре и запускает выбранную.
 *
 * Enter и кнопка «Предприятие» открывают Предприятие, кнопка «Конфигуратор»
 * Конфигуратор, кнопка «EDT» рабочую область базы в EDT.
 *
 * @returns Промис, который разрешается, когда окно выбора закрыто
 */
async function showInfobaseList(): Promise<void> {
	const items = pickItems();
	if (items.length === 0) {
		void vscode.window.showInformationMessage('В списке информационных баз 1С нет ни одной базы.');
		return;
	}

	const pick = vscode.window.createQuickPick<IbasePickItem>();
	pick.title = 'Информационные базы 1С';
	pick.placeholder = 'База для запуска';
	pick.matchOnDescription = true;
	pick.matchOnDetail = true;
	pick.items = items;

	const finished = new Promise<void>((resolve) => {
		const done = (): void => {
			pick.dispose();
			resolve();
		};
		pick.onDidTriggerItemButton((event) => {
			pick.hide();
			const mode: CestartMode = event.button.tooltip === DESIGNER_BUTTON.tooltip ? 'DESIGNER' : 'ENTERPRISE';
			void runInfobase(event.item.entry, mode);
		});
		pick.onDidAccept(() => {
			const chosen = pick.selectedItems[0];
			pick.hide();
			if (chosen) {
				void runInfobase(chosen.entry, 'ENTERPRISE');
			}
		});
		pick.onDidHide(() => {
			done();
		});
	});

	pick.show();
	await finished;
}

/**
 * Показывает действия автономного сервера ibsrv и выполняет выбранное.
 *
 * @returns Промис, который разрешается после выбора или отказа
 */
async function pickServerAction(): Promise<void> {
	const picked = await vscode.window.showQuickPick(
		SERVER_ACTIONS.map((action) => ({ label: `$(${action.icon}) ${action.label}`, command: action.command })),
		{ title: 'Автономный сервер ibsrv', placeHolder: 'Действие' }
	);
	if (picked) {
		await vscode.commands.executeCommand(picked.command);
	}
}

/**
 * Запускает базу в выбранном режиме.
 *
 * @param entry - Запись списка
 * @param id - Режим: стартер платформы либо действия ibsrv
 * @returns Промис, который разрешается после запуска или отказа
 */
async function runInfobaseWithMode(entry: InfobaseEntry, id: LaunchModeId): Promise<void> {
	if (id === 'web') {
		await vscode.commands.executeCommand('1c-platform-tools.server.openInBrowser');
		return;
	}
	if (id === 'server') {
		await pickServerAction();
		return;
	}
	const spec = cestartSpec(id);
	if (!spec) {
		return;
	}
	await runInfobase(entry, spec.mode, spec.extraArgs);
}

/**
 * Показывает палитру режимов запуска для базы и выполняет выбранное.
 *
 * @param node - Узел дерева базы
 * @returns Промис, который разрешается после выбора или отказа
 */
async function showLaunchModePicker(node: unknown): Promise<void> {
	const entry = ibaseEntryFrom(node);
	if (!entry) {
		return;
	}
	const picked = await vscode.window.showQuickPick(
		LAUNCH_MODES.map((mode) => ({
			label: `$(${mode.icon}) ${mode.label}`,
			description: mode.description,
			id: mode.id,
		})),
		{ title: `Запустить «${entry.name}»`, placeHolder: 'Режим запуска' }
	);
	if (picked) {
		await runInfobaseWithMode(entry, picked.id);
	}
}

/**
 * Регистрирует команды списка информационных баз.
 *
 * @param provider - Дерево списка
 * @returns Подписки команд
 */
export function registerIbasesCommands(provider: IbasesProvider): vscode.Disposable[] {
	return [
		vscode.commands.registerCommand('1c-platform-tools.infobaseList.refresh', () => {
			provider.refresh();
		}),
		vscode.commands.registerCommand('1c-platform-tools.infobaseList.open', () => showInfobaseList()),
		vscode.commands.registerCommand('1c-platform-tools.infobaseList.launchEnterprise', async (node: unknown) => {
			const entry = ibaseEntryFrom(node);
			if (!entry) {
				return;
			}
			await runInfobase(entry, 'ENTERPRISE');
		}),
		vscode.commands.registerCommand('1c-platform-tools.infobaseList.launchDesigner', async (node: unknown) => {
			const entry = ibaseEntryFrom(node);
			if (!entry) {
				return;
			}
			await runInfobase(entry, 'DESIGNER');
		}),
		vscode.commands.registerCommand('1c-platform-tools.infobaseList.launchWithMode', async (node: unknown) => {
			await showLaunchModePicker(node);
		}),
		vscode.commands.registerCommand('1c-platform-tools.infobaseList.openStartWindow', () => openStartWindow()),
		vscode.commands.registerCommand('1c-platform-tools.infobaseList.openEdtStart', () => openEdtStart()),
	];
}

/**
 * Список информационных баз в панели «1С: Администрирование».
 *
 * Панель доступна всегда: запускают базы и без открытого проекта 1С.
 * Кроме списка платформы в дерево входят реестр проекта (`.v8-project.json`)
 * и профили запуска (`env*.json`, `autumn-properties*.json`) папок рабочей
 * области; изменение этих файлов перерисовывает дерево.
 */

import * as vscode from 'vscode';
import { logger } from '../../shared/logger';
import { startupDirectory } from '../../shared/infobaseList';
import { readWorkspaceBases } from './baseSources';
import { IBASES_VIEW_ID } from './constants';
import { registerIbasesCommands } from './ibasesCommands';
import { IbasesProvider } from './ibasesProvider';
import { watchInfobaseList } from './watchInfobaseList';

const log = logger.scope('ibases');

/** Файлы, изменение которых перерисовывает дерево: реестр и профили запуска. */
const WORKSPACE_WATCH_GLOB = '{**/.v8-project.json,**/env*.json,**/autumn-properties*.json}';

/**
 * Папки рабочей области, в которых ищутся реестр проекта и профили запуска.
 *
 * @returns Абсолютные пути папок; без открытой рабочей области — пусто
 */
function workspaceRoots(): string[] {
	return (vscode.workspace.workspaceFolders ?? []).map((folder) => folder.uri.fsPath);
}

/**
 * Регистрирует представление списка информационных баз и его команды.
 *
 * @returns Подписки фичи
 */
export function registerIbasesFeature(): vscode.Disposable[] {
	const provider = new IbasesProvider(() => readWorkspaceBases(workspaceRoots()));
	const treeView = vscode.window.createTreeView(IBASES_VIEW_ID, {
		treeDataProvider: provider,
		showCollapseAll: true,
	});
	const watch = watchInfobaseList(() => provider.refresh(), startupDirectory());
	const refresh = (): void => provider.refresh();
	const watchWorkspace = vscode.workspace.createFileSystemWatcher(WORKSPACE_WATCH_GLOB);
	const watchEvents = [
		watchWorkspace.onDidCreate(refresh),
		watchWorkspace.onDidChange(refresh),
		watchWorkspace.onDidDelete(refresh),
	];
	const visibility = treeView.onDidChangeVisibility((event) => {
		if (event.visible) {
			provider.refresh();
		}
	});
	log.info('список информационных баз готов');
	return [
		treeView,
		watch,
		watchWorkspace,
		...watchEvents,
		visibility,
		provider,
		...registerIbasesCommands(provider),
	];
}

/**
 * Идентичность расширения: как расширение называет себя среди установленных.
 *
 * Имя и издатель берутся из манифеста, а расширение ищет себя по имени, а не по
 * склеенному `publisher.name`: переименование в манифесте не должно оставлять
 * каталог команд, IPC и сводку окружения пустыми.
 *
 * @module extensionIdentity
 */

import * as vscode from 'vscode';

/** Издатель расширения: значение `publisher` из манифеста. */
export const EXTENSION_PUBLISHER = 'alt-edt';

/** Имя расширения: значение `name` из манифеста. */
export const EXTENSION_NAME = 'alt-edt';

/** Идентификатор расширения в виде `publisher.name`, как его показывает VS Code. */
export const EXTENSION_ID = `${EXTENSION_PUBLISHER}.${EXTENSION_NAME}`;

/**
 * Расширение ищет себя по имени из манифеста.
 *
 * Сначала берётся точный идентификатор, затем — поиск по имени среди
 * установленных: так каталог команд не пустеет, если идентификатор разошёлся
 * с манифестом.
 *
 * @returns Описание расширения или `undefined`, если оно не установлено
 */
export function selfExtension(): vscode.Extension<unknown> | undefined {
	const byId = vscode.extensions.getExtension(EXTENSION_ID);
	if (byId) {
		return byId;
	}
	return vscode.extensions.all.find(
		(extension) => (extension.packageJSON as { name?: string } | undefined)?.name === EXTENSION_NAME
	);
}
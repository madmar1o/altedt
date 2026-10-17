/**
 * Режимы запуска базы из списка: единая модель для команды «Запустить базу…».
 *
 * Режимы двух классов: штатный стартер платформы (`1cestart`) — такие режимы
 * описываются режимом стартера и дополнительными ключами; и действия
 * автономного сервера ibsrv (веб-клиент, сервер) — они делегируются готовым
 * командам расширения и здесь только перечислены.
 *
 * Модуль чистый (без vscode) — переиспользуется в node-тестах.
 * @module launchModes
 */

import type { CestartMode } from './cestart';

/** Идентификатор режима запуска. */
export type LaunchModeId =
	| 'enterprise'
	| 'enterpriseThick'
	| 'debug'
	| 'debugDap'
	| 'configurator'
	| 'web'
	| 'server';

/** Описание режима запуска для палитры выбора. */
export interface LaunchMode {
	/** Идентификатор. */
	readonly id: LaunchModeId;
	/** Название в палитре. */
	readonly label: string;
	/** Подсказка: что делает режим. */
	readonly description?: string;
	/** Иконка Codicon без обрамления `$()`. */
	readonly icon: string;
}

/** Спецификация режима стартера платформы. */
export interface CestartLaunchSpec {
	/** Режим стартера: Предприятие или Конфигуратор. */
	readonly mode: CestartMode;
	/** Дополнительные ключи после штатных, например `/C thick`. */
	readonly extraArgs: readonly string[];
}

/** Режимы стартера: база открывается через 1cestart. */
const CESTART_SPECS: Readonly<Partial<Record<LaunchModeId, CestartLaunchSpec>>> = {
	enterprise: { mode: 'ENTERPRISE', extraArgs: [] },
	enterpriseThick: { mode: 'ENTERPRISE', extraArgs: ['/C', 'thick'] },
	debug: { mode: 'ENTERPRISE', extraArgs: ['/DEBUG'] },
	configurator: { mode: 'DESIGNER', extraArgs: [] },
};

/** Все режимы палитры выбора, в порядке показа. */
export const LAUNCH_MODES: readonly LaunchMode[] = [
	{ id: 'enterprise', label: 'Предприятие (тонкий клиент)', icon: 'play' },
	{
		id: 'enterpriseThick',
		label: 'Предприятие (толстый клиент)',
		description: 'Ключ /C thick',
		icon: 'device-desktop',
	},
	{
		id: 'debug',
		label: 'Предприятие с отладкой',
		description: 'Ключ /DEBUG — отладчик ждёт подключения',
		icon: 'debug-alt',
	},
	{
		id: 'debugDap',
		label: 'Отладка (VS Code)',
		description: 'Запуск через onec-debug-adapter с выбранной базой',
		icon: 'debug',
	},
	{ id: 'configurator', label: 'Конфигуратор', icon: 'tools' },
	{
		id: 'web',
		label: 'Веб-клиент',
		description: 'Через автономный сервер ibsrv',
		icon: 'globe',
	},
	{
		id: 'server',
		label: 'Автономный сервер ibsrv…',
		description: 'Запуск, отладка, веб-публикация, журнал',
		icon: 'server',
	},
];

/**
 * Спецификация режима стартера.
 *
 * @param id - Идентификатор режима
 * @returns Спецификация либо undefined для режимов ibsrv (web, server)
 */
export function cestartSpec(id: LaunchModeId): CestartLaunchSpec | undefined {
	return CESTART_SPECS[id];
}

/**
 * Источники записей для дерева информационных баз.
 *
 * Панель «Информационные базы» объединяет три источника: список платформы
 * (`ibases.v8i`), реестр проекта (`.v8-project.json`) и профили запуска
 * (`env*.json`, `autumn-properties*.json`). Неплатформенные источники кладут
 * базы в свои синтетические папки, поэтому в дереве видно, откуда база взялась.
 *
 * Модуль чистый (без vscode) — переиспользуется в node-тестах.
 * @module baseSources
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseEnvFileName, type EnvProfile } from '../../shared/envProfiles';
import { readInfobases, type InfobaseEntry } from '../../shared/infobaseList';
import { readSettingsJsonSync } from '../../shared/settingsJson';

/** Имя файла реестра информационных баз проекта. */
export const PROJECT_REGISTRY_FILE = '.v8-project.json';

/** Папка баз реестра проекта в дереве списка. */
export const PROJECT_FOLDER = '/Реестр проекта';

/** Папка профилей запуска в дереве списка. */
export const PROFILE_FOLDER = '/Профили запуска';

/**
 * Признак простого объекта JSON (не массив и не null).
 *
 * @param value - Проверяемое значение
 * @returns true, если значение — объект
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Непустая строковое поле объекта.
 *
 * @param source - Объект
 * @param key - Имя поля
 * @returns Значение без обрамляющих пробелов либо undefined
 */
function stringField(source: Record<string, unknown>, key: string): string | undefined {
	const value = source[key];
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * Строка подключения файловой базы в формате поля `Connect` из `ibases.v8i`.
 *
 * @param filePath - Абсолютный путь к каталогу базы
 * @returns Строка подключения
 */
function fileConnect(filePath: string): string {
	return `File="${filePath}";`;
}

/**
 * Строка подключения серверной базы в формате поля `Connect` из `ibases.v8i`.
 *
 * @param server - Адрес сервера
 * @param ref - Имя базы на сервере
 * @returns Строка подключения
 */
function serverConnect(server: string, ref: string): string {
	return `Srvr="${server}";Ref="${ref}";`;
}

/**
 * Записи реестра информационных баз проекта (`.v8-project.json`).
 *
 * Формат: `databases[]` с полями `id`, `name`, `type`, `path` (файловая) либо
 * `server`/`ref` (серверная). Файл в корне `root`; отсутствие или битый
 * содержательный вид дают пустой список — панель не должна падать.
 *
 * @param root - Корень проекта
 * @returns Записи для папки «Реестр проекта»
 */
export function readProjectRegistry(root: string): InfobaseEntry[] {
	let doc: unknown;
	try {
		doc = readSettingsJsonSync(path.join(root, PROJECT_REGISTRY_FILE));
	} catch {
		return [];
	}
	if (!isPlainObject(doc) || !Array.isArray(doc.databases)) {
		return [];
	}
	const out: InfobaseEntry[] = [];
	for (const raw of doc.databases) {
		if (!isPlainObject(raw)) {
			continue;
		}
		const name = stringField(raw, 'name') ?? stringField(raw, 'id');
		if (!name) {
			continue;
		}
		const server = stringField(raw, 'server');
		const ref = stringField(raw, 'ref');
		const filePath = stringField(raw, 'path');
		let connect: string | undefined;
		if (server && ref) {
			connect = serverConnect(server, ref);
		} else if (filePath) {
			connect = fileConnect(path.resolve(root, filePath));
		}
		if (!connect) {
			continue;
		}
		out.push({ name, connect, folder: PROJECT_FOLDER, orderInList: 0, orderInTree: 0 });
	}
	return out;
}

/**
 * Строка подключения из значения `--ibconnection` профиля (`/F…` либо `/S…`).
 *
 * Относительный путь файловой базы разрешается от корня проекта: профили
 * хранят `/F./build/ib`, а списку баз нужен абсолютный путь.
 *
 * @param ibConnection - Значение из файла профиля
 * @param root - Корень проекта
 * @returns Строка подключения либо undefined, если значение не разобрано
 */
function ibConnectionToConnect(ibConnection: string, root: string): string | undefined {
	let value = ibConnection.trim();
	if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
		value = value.slice(1, -1);
	}
	const file = /^\/F(.+)$/i.exec(value);
	if (file) {
		const raw = file[1].trim();
		const absolute = path.isAbsolute(raw) || /^[A-Za-z]:[\\/]/.test(raw) || raw.startsWith('\\\\');
		return fileConnect(absolute ? raw : path.resolve(root, raw));
	}
	const server = /^\/S([^\\/]+)\\(.+)$/.exec(value);
	if (server) {
		return serverConnect(server[1].trim(), server[2].trim());
	}
	return undefined;
}

/**
 * Значение строки подключения из документа профиля.
 *
 * Форматы различаются по версии vanessa-runner: 2.x держит опции в секции
 * `default` с префиксом `--`, 3.x — в секции `vrunner` без него. Именованный
 * профиль может собирать секцию со своим id, поэтому перебираются все три.
 *
 * @param doc - Разобранный JSON файла профиля
 * @param id - Идентификатор профиля
 * @returns Значение `ibconnection` либо undefined
 */
function ibConnectionFrom(doc: Record<string, unknown>, id: string): string | undefined {
	for (const wrapper of [doc[id], doc.default, doc.vrunner]) {
		if (!isPlainObject(wrapper)) {
			continue;
		}
		const value = wrapper['--ibconnection'] ?? wrapper.ibconnection;
		if (typeof value === 'string' && value.trim()) {
			return value.trim();
		}
	}
	return undefined;
}

/**
 * Записи профилей запуска корня проекта.
 *
 * Профиль — файл настроек vanessa-runner с подключением к базе: `env.json`
 * и `env.<id>.json` (2.x), `autumn-properties*.json` (3.x). Файлы без строки
 * подключения и файл-мусор пропускаются; профиль «По умолчанию» идёт первым.
 *
 * @param root - Корень проекта
 * @returns Записи для папки «Профили запуска»
 */
export function readLaunchProfiles(root: string): InfobaseEntry[] {
	let fileNames: string[];
	try {
		fileNames = fs.readdirSync(root);
	} catch {
		return [];
	}
	const picked: Array<{ profile: EnvProfile; connect: string }> = [];
	for (const fileName of fileNames) {
		const profile = parseEnvFileName(fileName, 'v2') ?? parseEnvFileName(fileName, 'v3');
		if (!profile) {
			continue;
		}
		let doc: unknown;
		try {
			doc = readSettingsJsonSync(path.join(root, fileName));
		} catch {
			continue;
		}
		if (!isPlainObject(doc)) {
			continue;
		}
		const ibConnection = ibConnectionFrom(doc, profile.id);
		if (!ibConnection) {
			continue;
		}
		const connect = ibConnectionToConnect(ibConnection, root);
		if (!connect) {
			continue;
		}
		picked.push({ profile, connect });
	}
	picked.sort((left, right) => {
		if (left.profile.isBase !== right.profile.isBase) {
			return left.profile.isBase ? -1 : 1;
		}
		return left.profile.id.localeCompare(right.profile.id, 'ru');
	});
	return picked.map(({ profile, connect }) => ({
		name: profile.label,
		connect,
		folder: PROFILE_FOLDER,
		orderInList: 0,
		orderInTree: 0,
	}));
}

/** Читатель списка платформы: в тестах подставляется фикстура. */
export type PlatformBaseReader = () => InfobaseEntry[];

/**
 * Все базы для дерева: список платформы, затем реестры и профили папок
 * рабочей области. Повторы по имени и строке подключения отбрасываются.
 *
 * @param roots - Папки рабочей области (в каждой ищутся свои настройки)
 * @param platform - Читатель списка платформы (по умолчанию файлы `ibases.v8i`)
 * @returns Слитый список в порядке: платформа, реестры, профили
 */
export function readWorkspaceBases(
	roots: readonly string[],
	platform: PlatformBaseReader = readInfobases
): InfobaseEntry[] {
	const out: InfobaseEntry[] = [];
	const seen = new Set<string>();
	const append = (entries: readonly InfobaseEntry[]): void => {
		for (const entry of entries) {
			const key = `${entry.name}|${entry.connect}`;
			if (!seen.has(key)) {
				seen.add(key);
				out.push(entry);
			}
		}
	};
	append(platform());
	for (const root of roots) {
		append(readProjectRegistry(root));
		append(readLaunchProfiles(root));
	}
	return out;
}

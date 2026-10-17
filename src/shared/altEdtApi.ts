/**
 * Публичный API AltEDT для сторонних расширений.
 *
 * Расширения подключаются через `package.json` → `altEdt.contributes`, а затем
 * регистрируют свои компоненты через этот API. Пакеты обнаруживаются по наличию
 * поля `altEdt` в `package.json` (в `node_modules` рабочей области).
 *
 * @module altEdtApi
 */

import type { InfobaseEntry } from './infobaseList';

/**
 * Источник баз для панели «Базы».
 *
 * Аналогичен встроенному `readProjectRegistry`, но реализуется сторонним
 * расширением. Метод `read` вызывается при каждом обновлении дерева баз.
 */
export interface IBaseProvider {
	/** Уникальный идентификатор источника (например, `my-extension.source`). */
	readonly id: string;
	/** Название папки, в которой показываются базы этого источника. */
	readonly folder: string;
	/** Читает список баз источника. */
	readonly read: () => InfobaseEntry[];
}

/**
 * Режим запуска базы — расширение палитры «Запустить базу…».
 */
export interface ILaunchMode {
	/** Уникальный идентификатор режима. */
	readonly id: string;
	/** Название в палитре выбора. */
	readonly label: string;
	/** Подсказка в палитре. */
	readonly description?: string;
	/**
	 * Запускает базу в этом режиме.
	 *
	 * @param base — Запись списка базы, выбранная пользователем.
	 */
	readonly launch: (base: { readonly name: string; readonly connect: string }) => Promise<void> | void;
}

/**
 * Группа команд, добавляемая в палитру команд.
 */
export interface ICommandGroup {
	/** Уникальный идентификатор группы. */
	readonly id: string;
	/** Название в палитре. */
	readonly title: string;
	/**
	 * Команды группы.
	 *
	 * Ключ — идентификатор команды (будет дополнен префиксом `id`), значение —
	 * заголовок для палитры.
	 */
	readonly commands: Readonly<Record<string, string>>;
}

/**
 * Панель в боковой панели (TreeView).
 */
export interface IPanel {
	/** Уникальный идентификатор панели (используется как `viewType` в package.json). */
	readonly id: string;
	/** Заголовок панели. */
	readonly title: string;
	/**
	 * Возвращает дерево для панели. Вызывается при регистрации.
	 *
	 * @returns TreeDataProvider для регистрации через `window.registerTreeDataProvider`.
	 */
	readonly getTreeDataProvider: () => unknown;
}

/**
 * Публичный API AltEDT для сторонних расширений.
 */
export interface IAltEdtApi {
	/**
	 * Регистрирует источник баз.
	 *
	 * @param provider — Источник баз.
	 */
	registerBaseProvider(provider: IBaseProvider): void;

	/**
	 * Регистрирует режим запуска базы.
	 *
	 * @param mode — Режим запуска.
	 */
	registerLaunchMode(mode: ILaunchMode): void;

	/**
	 * Регистрирует группу команд.
	 *
	 * @param group — Группа команд.
	 */
	registerCommandGroup(group: ICommandGroup): void;

	/**
	 * Регистрирует панель в боковой панели.
	 *
	 * Панель должна быть также объявлена в `contributes.views` package.json
	 * расширения-клиента.
	 *
	 * @param panel — Панель.
	 */
	registerPanel(panel: IPanel): void;
}

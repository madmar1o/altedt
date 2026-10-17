/**
 * Реестр сторонних расширений AltEDT.
 *
 * Хранит провайдеры баз, режимы запуска, группы команд и панели, зарегистрированные
 * через публичный {@link IAltEdtApi}. Используется при построении дерева баз,
 * палитры режимов запуска и регистрации команд расширений-клиентов.
 *
 * @module altEdtRegistry
 */

import type { IAltEdtApi, IBaseProvider, ILaunchMode, ICommandGroup, IPanel } from './altEdtApi';

/** Внутреннее состояние реестра. */
interface RegistryState {
	/** Источники баз сторонних расширений. */
	readonly baseProviders: IBaseProvider[];
	/** Режимы запуска сторонних расширений. */
	readonly launchModes: ILaunchMode[];
	/** Группы команд сторонних расширений. */
	readonly commandGroups: ICommandGroup[];
	/** Панели сторонних расширений. */
	readonly panels: IPanel[];
}

const state: RegistryState = {
	baseProviders: [],
	launchModes: [],
	commandGroups: [],
	panels: [],
};

/**
 * Возвращает копию текущего состояния реестра.
 *
 * @returns Текущее состояние реестра.
 */
export function altEdtRegistry(): Readonly<RegistryState> {
	return state;
}

/**
 * Возвращает зарегистрированные источники баз.
 *
 * @returns Массив источников баз.
 */
export function altEdtBaseProviders(): readonly IBaseProvider[] {
	return state.baseProviders;
}

/**
 * Возвращает зарегистрированные режимы запуска.
 *
 * @returns Массив режимов запуска.
 */
export function altEdtLaunchModes(): readonly ILaunchMode[] {
	return state.launchModes;
}

/**
 * Возвращает зарегистрированные группы команд.
 *
 * @returns Массив групп команд.
 */
export function altEdtCommandGroups(): readonly ICommandGroup[] {
	return state.commandGroups;
}

/**
 * Возвращает зарегистрированные панели.
 *
 * @returns Массив панелей.
 */
export function altEdtPanels(): readonly IPanel[] {
	return state.panels;
}

/**
 * Создаёт публичный API для стороннего расширения.
 *
 * Каждое расширение-клиент получает свой экземпляр API через активацию.
 *
 * @returns Объект, реализующий {@link IAltEdtApi}.
 */
export function createAltEdtApi(): IAltEdtApi {
	return {
		registerBaseProvider(provider) {
			if (state.baseProviders.some((p) => p.id === provider.id)) {
				return;
			}
			state.baseProviders.push(provider);
		},
		registerLaunchMode(mode) {
			if (state.launchModes.some((m) => m.id === mode.id)) {
				return;
			}
			state.launchModes.push(mode);
		},
		registerCommandGroup(group) {
			if (state.commandGroups.some((g) => g.id === group.id)) {
				return;
			}
			state.commandGroups.push(group);
		},
		registerPanel(panel) {
			if (state.panels.some((p) => p.id === panel.id)) {
				return;
			}
			state.panels.push(panel);
		},
	};
}

/**
 * Сбрасывает состояние реестра (для тестов).
 */
export function resetAltEdtRegistry(): void {
	state.baseProviders.length = 0;
	state.launchModes.length = 0;
	state.commandGroups.length = 0;
	state.panels.length = 0;
}

import { lifecycle_outside_component, missing_context } from './errors.js';

/**
 * @template T
 * @param {(key: object) => T} get_context
 * @param {(key: object, context: T) => T} set_context
 * @param {(key: object) => boolean} has_context
 * @returns {[() => T, (context: T) => T, () => boolean]}
 */
export function create_context(get_context, set_context, has_context) {
	const key = {};

	return [
		() => {
			if (!has_context(key)) {
				missing_context();
			}

			return get_context(key);
		},
		(context) => set_context(key, context),
		() => has_context(key)
	];
}

/**
 * @typedef {{ p: Context | null, c: Map<unknown, unknown> | null }} Context
 */

/**
 * Finds the nearest context map, starting with `context` itself, without creating one.
 * Returns `null` if no component up the tree has set context.
 * @param {Context | null} context
 * @returns {Map<unknown, unknown> | null}
 */
function find_context_map(context) {
	while (context !== null && context.c === null) {
		context = context.p;
	}
	return context === null ? null : context.c;
}

/**
 * For reads (`getContext`, `hasContext`): the nearest context map, or `null`.
 * Reading does not need an own copy of the parent map, so none is created.
 * @param {Context | null} context
 * @param {string} name
 * @returns {Map<unknown, unknown> | null}
 */
export function get_context_map(context, name) {
	if (context === null) {
		lifecycle_outside_component(name);
	}

	return find_context_map(context);
}

/**
 * For writes (`setContext`) and for handing the map out (`getAllContexts`): the
 * component's own context map, created as a copy of the parent map if needed.
 * @param {Context | null} context
 * @param {string} name
 * @returns {Map<unknown, unknown>}
 */
export function get_or_init_context_map(context, name) {
	if (context === null) {
		lifecycle_outside_component(name);
	}

	return (context.c ??= new Map(find_context_map(context.p) || undefined));
}

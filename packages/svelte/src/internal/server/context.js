/** @import { SSRContext } from '#server' */
/** @import { Renderer } from './renderer.js' */
import { DEV } from 'esm-env';
import { create_context, get_or_init_context_map } from '../shared/context.js';
import * as e from './errors.js';

/** @type {SSRContext | null} */
export var ssr_context = null;

/** @param {SSRContext | null} v */
export function set_ssr_context(v) {
	ssr_context = v;
}

/**
 * @template T
 * @returns {[() => T, (context: T) => T, () => boolean]}
 * @since 5.40.0
 */
export function createContext() {
	return /** @type {[() => T, (context: T) => T, () => boolean]} */ (
		create_context(getContext, setContext, hasContext)
	);
}

/**
 * @template T
 * @param {any} key
 * @returns {T}
 */
export function getContext(key) {
	const context_map = get_or_init_context_map(ssr_context, 'getContext');
	const result = /** @type {T} */ (context_map.get(key));

	return result;
}

/**
 * @template T
 * @param {any} key
 * @param {T} context
 * @returns {T}
 */
export function setContext(key, context) {
	const context_map = get_or_init_context_map(ssr_context, 'setContext');

	if (/** @type {SSRContext} */ (ssr_context).i) {
		e.set_context_after_init();
	}

	context_map.set(key, context);
	return context;
}

/**
 * @param {any} key
 * @returns {boolean}
 */
export function hasContext(key) {
	return get_or_init_context_map(ssr_context, 'hasContext').has(key);
}

/** @returns {Map<any, any>} */
export function getAllContexts() {
	return get_or_init_context_map(ssr_context, 'getAllContexts');
}

/**
 * Opens a component frame. The compiler calls this directly, so the body it belongs to
 * is inlined into the parent instead of costing a closure per component.
 * @param {Renderer | null} renderer the renderer the component body writes into
 * @param {Function} [fn]
 */
export function push(renderer, fn) {
	ssr_context = { p: ssr_context, c: null, r: renderer, i: false, d: null };

	if (DEV) {
		ssr_context.function = fn;
		ssr_context.element = ssr_context.p?.element;
	}

	if (renderer === null || renderer.global.mode !== 'sync') return;

	// callbacks are grouped per component, so the group of whatever is rendering
	// right now steps aside until this component closes
	const global = renderer.global;

	ssr_context.d = global.on_destroy_group;
	global.on_destroy_group = null;
}

/**
 * Closes the frame {@link push} opened. Runs from a `finally`, so a component that throws
 * still hands the group back and the ancestors keep their callbacks.
 */
export function pop() {
	const context = /** @type {SSRContext} */ (ssr_context);
	const renderer = context.r;

	ssr_context = context.p;

	if (renderer === null || renderer.global.mode !== 'sync') return;

	const global = renderer.global;
	const group = global.on_destroy_group;

	if (group !== null) (global.on_destroy_done ??= []).push(group);
	global.on_destroy_group = context.d;
}

/**
 * Wraps an `await` expression in such a way that the component context that was
 * active before the expression evaluated can be reapplied afterwards —
 * `await a + b()` becomes `(await $.save(a))() + b()`, meaning `b()` will have access
 * to the context of its component.
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<() => T>}
 */
export async function save(promise) {
	var previous_context = ssr_context;
	var value = await promise;

	return () => {
		ssr_context = previous_context;
		return value;
	};
}

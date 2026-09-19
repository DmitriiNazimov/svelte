import * as fs from 'node:fs';
import * as path from 'node:path';
import { render } from 'svelte/server';
import { fastest_test } from '../../../utils.js';
import { compile } from 'svelte/compiler';

const dir = `${process.cwd()}/benchmarking/benchmarks/ssr/cards`;

// a real SSR request makes one `render()` call per component, not one huge render, so this
// measures what a `render()` call costs. Enough calls to re-optimize after the forced GC
const RENDERS = 100_000;

const kinds = ['new', 'hot', 'sale', 'default'];

async function compile_svelte() {
	for (const name of ['Card', 'Badge']) {
		const output = compile(read(`${dir}/${name}.svelte`), {
			generate: 'server',
			filename: `${name}.svelte`
		});

		// `Card` imports `./Badge.svelte`; point it at the compiled file
		write(
			`${dir}/output/${name}.svelte.js`,
			output.js.code.replace(/from '(\.\/[^']+\.svelte)'/g, "from '$1.js'")
		);
	}

	const module = await import(`${dir}/output/Card.svelte.js`);

	return module.default;
}

/**
 * @param {number} i
 */
function create_props(i) {
	return {
		id: i,
		title: `Card ${i}`,
		href: `/cards/${i}`,
		tags: Array.from({ length: 3 }, (_, j) => ({
			kind: kinds[(i + j) % kinds.length],
			label: `tag ${j}`
		})),
		published: i % 4 !== 0
	};
}

export const cards_bench = {
	label: 'cards_bench',
	fn: async () => {
		const Card = await compile_svelte();
		const props = Array.from({ length: 100 }, (_, i) => create_props(i));
		const context = new Map([['app', { base: '/en', locale: 'en', strings: { draft: 'Draft' } }]]);

		const run = () => {
			for (let i = 0; i < RENDERS; i++) {
				render(Card, { props: props[i % props.length], context }).body;
			}
		};

		// Do 3 loops to warm up JIT
		for (let i = 0; i < 3; i++) {
			run();
		}

		return await fastest_test(10, run);
	}
};

/**
 * @param {string} file
 */
function read(file) {
	return fs.readFileSync(file, 'utf-8').replace(/\r\n/g, '\n');
}

/**
 * @param {string} file
 * @param {string} contents
 */
function write(file, contents) {
	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
	} catch {}

	fs.writeFileSync(file, contents);
}

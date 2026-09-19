<script>
	import { getAllContexts, getContext } from 'svelte';

	const a = getContext('a');
	const b = getContext('b');
	const all = getAllContexts();
</script>

<p>leaf: {a} {b} {all.size}</p>

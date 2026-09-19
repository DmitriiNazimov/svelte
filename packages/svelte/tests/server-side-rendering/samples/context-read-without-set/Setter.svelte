<script>
	import { getContext, setContext } from 'svelte';
	import Leaf from './Leaf.svelte';

	setContext('a', 2);
	setContext('b', 'x');

	const a = getContext('a');
</script>

<p>setter: {a}</p>
<Leaf />

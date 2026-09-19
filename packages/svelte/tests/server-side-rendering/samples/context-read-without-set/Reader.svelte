<script>
	import { getContext, hasContext } from 'svelte';
	import Setter from './Setter.svelte';
	import Sibling from './Sibling.svelte';

	// reads only, never sets: must see the parent's value and must not get in the way
	// of the children below, which set and read their own context
	const a = getContext('a');
	const has_b = hasContext('b');
</script>

<p>reader: {a} {has_b}</p>
<Setter />
<Sibling />

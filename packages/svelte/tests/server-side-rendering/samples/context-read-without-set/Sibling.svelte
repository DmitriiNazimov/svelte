<script>
	import { getContext, hasContext } from 'svelte';

	// rendered after Setter: must still see the parent's value, not the sibling's
	const a = getContext('a');
	const has_b = hasContext('b');
</script>

<p>sibling: {a} {has_b}</p>

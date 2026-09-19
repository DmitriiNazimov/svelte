<script>
	import { setContext } from 'svelte';
	import Reader from './Reader.svelte';

	setContext('a', 1);
</script>

<Reader />

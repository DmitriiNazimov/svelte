<script>
	let { kind = 'default', children } = $props();
</script>

<span class="badge" data-kind={kind}>{@render children()}</span>

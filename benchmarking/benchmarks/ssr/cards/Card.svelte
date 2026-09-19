<script>
	import { getContext } from 'svelte';
	import Badge from './Badge.svelte';

	let { id, title, href, tags, published } = $props();

	const app = getContext('app');
	const url = app.base + href;
</script>

<article class="card" data-id={id} data-lang={app.locale}>
	<h3 class="card__title"><a href={url}>{title}</a></h3>
	{#if published}
		<ul class="card__tags">
			{#each tags as tag}
				<li class="card__tag"><Badge {...tag}>{tag.label}</Badge></li>
			{/each}
		</ul>
	{:else}
		<p class="card__draft">{app.strings.draft}</p>
	{/if}
</article>

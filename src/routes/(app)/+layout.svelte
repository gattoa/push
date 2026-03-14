<script>
	import Navigation from '$lib/components/Navigation.svelte';
	let { children } = $props();
</script>

<Navigation />
<main style="padding-top: 4rem;">{@render children()}</main>

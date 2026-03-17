<script>
	import { onMount } from 'svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import { initWorkoutStore, isStoreReady } from '$lib/stores/workout.svelte';

	let { children } = $props();

	onMount(() => {
		initWorkoutStore();
	});
</script>

<Navigation />
{#if isStoreReady()}
	<main style="padding-top: 4rem;">{@render children()}</main>
{/if}

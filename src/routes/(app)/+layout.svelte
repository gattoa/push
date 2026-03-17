<script>
	import { onMount } from 'svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import { initWorkoutStore, isLoaded } from '$lib/stores/workout.svelte';
	import { getDeviceId } from '$lib/utils/device';
	import { ensureDevice } from '$lib/services/supabase-sync';

	let { children } = $props();

	onMount(() => {
		const deviceId = getDeviceId();
		if (deviceId) ensureDevice(deviceId);
		initWorkoutStore();
	});
</script>

<Navigation />
{#if isLoaded()}
	<main style="padding-top: 4rem;">{@render children()}</main>
{/if}

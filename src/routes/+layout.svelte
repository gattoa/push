<script>
	import Navigation from '$lib/components/Navigation.svelte';
	import ApiStatusIndicator from '$lib/components/ApiStatusIndicator.svelte';
</script>

<Navigation />
<ApiStatusIndicator />
<main><slot /></main>

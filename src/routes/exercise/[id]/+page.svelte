<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { searchExerciseVideos } from '$lib/api/youtube';

	let videos: any[] = [];
	let loading = true;

	onMount(async () => {
		try {
			const result = await searchExerciseVideos('bench press');
			videos = result.items || [];
		} catch (e) {
			console.error('YouTube error:', e);
		} finally {
			loading = false;
		}
	});
</script>

<h1>Exercise: {$page.params.id}</h1>
<h2>YouTube Videos</h2>
{#if loading}
	<p>Loading...</p>
{:else}
	{#each videos as video}
		<div>
			<h3>{video.snippet.title}</h3>
			<img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
			<a href="https://www.youtube.com/watch?v={video.id.videoId}" target="_blank">Watch</a>
		</div>
	{/each}
{/if}

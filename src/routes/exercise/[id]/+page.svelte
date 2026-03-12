<script lang="ts">
	let { data } = $props();
</script>

{#if data.video}
	<iframe
		width="560"
		height="315"
		src="https://www.youtube.com/embed/{data.video.id.videoId}"
		title={data.video.snippet.title}
		frameborder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
		allowfullscreen
	></iframe>
{:else}
	<p style="color: red;">No video found</p>
{/if}

<script>
	import { onMount } from "svelte";
	import ExerciseCard from "$lib/components/ExerciseCard.svelte";
	import { searchExerciseVideos } from "$lib/api/youtube";

	const exercises = [
		{ id: "1", name: "Bench Press", muscle_group: "Chest" },
		{ id: "2", name: "Squat", muscle_group: "Legs" },
		{ id: "3", name: "Deadlift", muscle_group: "Back" },
	];

	let testVideo = null;
	let videoStatus = "loading";

	onMount(async () => {
		try {
			const result = await searchExerciseVideos("workout");
			if (result.items && result.items.length > 0) {
				testVideo = result.items[0];
				videoStatus = "success";
			} else {
				videoStatus = "no results";
			}
		} catch (err) {
			videoStatus = "error: " + err.message;
		}
	});
</script>

<h1>Workout Tracker</h1>

<h2>YouTube Integration Test</h2>
{#if videoStatus === "loading"}
	<p>Loading YouTube video...</p>
{:else if videoStatus === "success" && testVideo}
	<div style="padding: 15px; margin-bottom: 20px;">
		<h3>{testVideo.snippet.title}</h3>
		<iframe
			width="560"
			height="315"
			src="https://www.youtube.com/embed/{testVideo.id.videoId}"
			title={testVideo.snippet.title}
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		></iframe>
	</div>
{:else}
	<p style="color: red; border: 2px solid red; padding: 10px;">Status: {videoStatus}</p>
{/if}

<h2>Exercises</h2>
{#each exercises as exercise}
	<ExerciseCard {exercise} />
{/each}

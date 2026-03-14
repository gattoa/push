<script lang="ts">
	import { onMount } from 'svelte';
	import type { ExerciseDBExercise, AppPreferences } from '$lib/types';
	import { mockPlannedExercises, getSetsForExercise, getLogsForExercise } from '$lib/mock/workouts';
	import SetRow from '$lib/components/SetRow.svelte';
	import QuickComplete from '$lib/components/QuickComplete.svelte';
	import ExerciseHistory from '$lib/components/ExerciseHistory.svelte';
	import { mockWeekHistories } from '$lib/mock/profile-history';
	import { computeExerciseHistory } from '$lib/mock/profile';

	let { data } = $props();
	let exercise: ExerciseDBExercise | null = $derived(data.exercise);
	let units: 'lbs' | 'kg' = $state('lbs');

	let exerciseId = $derived(data.exerciseId ?? '');
	let plannedExercise = $derived(mockPlannedExercises.find(e => e.exercisedb_id === exerciseId) ?? null);
	let plannedSets = $derived(plannedExercise ? getSetsForExercise(plannedExercise.id) : []);
	let setLogs = $derived(plannedExercise ? getLogsForExercise(plannedExercise.id) : []);
	let exerciseHistory = $derived(exerciseId ? computeExerciseHistory(exerciseId, mockWeekHistories) : null);

	onMount(() => {
		const rawPrefs = localStorage.getItem('push_preferences');
		if (rawPrefs) {
			try {
				const prefs: Partial<AppPreferences> = JSON.parse(rawPrefs);
				if (prefs.units) units = prefs.units;
			} catch { /* ignore */ }
		}
	});
</script>

<div class="exercise-page">
	<button class="back-btn" onclick={() => history.back()}>
		<span class="back-arrow">‹</span> Back
	</button>

{#if plannedExercise && plannedSets.length > 0}
	<section>
		<h2>Log Sets</h2>
		{#each plannedSets as ps (ps.id)}
			{@const log = setLogs.find(s => s.planned_set_id === ps.id)}
			{#if log}
				<SetRow plannedSet={ps} setLog={log} />
			{/if}
		{/each}
		<QuickComplete {plannedSets} {setLogs} />
		<button disabled>[Swap Exercise]</button>
	</section>
	<hr />
{/if}

{#if !exercise && exerciseHistory}
	<h1>{exerciseHistory.exerciseName}</h1>
{/if}

{#if exerciseHistory && exerciseHistory.sessions.length > 0}
	<ExerciseHistory history={exerciseHistory} {units} />
	<hr />
{/if}

{#if exercise}
	<article>
		<h1>{exercise.name}</h1>

		<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
			{#each exercise.bodyParts as part}
				<span style="background: #e0e0e0; padding: 4px 10px; border-radius: 12px; font-size: 13px;">{part}</span>
			{/each}
			{#each exercise.equipments as equip}
				<span style="background: #d0e8ff; padding: 4px 10px; border-radius: 12px; font-size: 13px;">{equip}</span>
			{/each}
		</div>

		{#if exercise.overview}
			<p>{exercise.overview}</p>
		{/if}

		{#if exercise.videoUrl}
			<video controls width="100%" style="max-width: 560px; border-radius: 8px; margin-bottom: 16px;">
				<source src={exercise.videoUrl} type="video/mp4" />
				<track kind="captions" />
			</video>
		{:else if exercise.imageUrl}
			<img src={exercise.imageUrl} alt={exercise.name} style="max-width: 560px; width: 100%; border-radius: 8px; margin-bottom: 16px;" />
		{/if}

		{#if exercise.targetMuscles.length > 0}
			<h2>Target Muscles</h2>
			<p>{exercise.targetMuscles.join(', ')}</p>
		{/if}

		{#if exercise.secondaryMuscles.length > 0}
			<h2>Secondary Muscles</h2>
			<p>{exercise.secondaryMuscles.join(', ')}</p>
		{/if}

		{#if exercise.instructions.length > 0}
			<h2>Instructions</h2>
			<ol>
				{#each exercise.instructions as step}
					<li>{step}</li>
				{/each}
			</ol>
		{/if}

		{#if exercise.exerciseTips.length > 0}
			<h2>Tips</h2>
			<ul>
				{#each exercise.exerciseTips as tip}
					<li>{tip}</li>
				{/each}
			</ul>
		{/if}

		{#if exercise.variations.length > 0}
			<h2>Variations</h2>
			<ul>
				{#each exercise.variations as variation}
					<li>{variation}</li>
				{/each}
			</ul>
		{/if}
	</article>
{:else if !exerciseHistory}
	<p style="color: red;">Exercise not found.</p>
{/if}
</div>

<style>
	.exercise-page {
		max-width: 480px;
		margin: 0 auto;
		padding: 0 1rem 6rem;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #666;
		padding: 0.5rem 0;
		margin-bottom: 0.5rem;
	}

	.back-btn:hover {
		color: #000;
	}

	.back-arrow {
		font-size: 1.25rem;
		line-height: 1;
	}
</style>

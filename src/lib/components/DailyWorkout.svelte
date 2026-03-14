<script lang="ts">
	import type { PlannedDay, PlannedExercise, PlannedSet, SetLog } from '$lib/types';
	import ExerciseTile from './ExerciseTile.svelte';
	import ReviewSummary from './ReviewSummary.svelte';
	import { mockPlannedDays, mockPlannedExercises, mockPlannedSets, mockSetLogs } from '$lib/mock/workouts';

	let { plannedDay, exercises, plannedSets, setLogs }: {
		plannedDay: PlannedDay;
		exercises: PlannedExercise[];
		plannedSets: PlannedSet[];
		setLogs: SetLog[];
	} = $props();
</script>

{#if plannedDay.is_rest_day}
	<p>Rest Day — recover and come back stronger.</p>
{:else if plannedDay.is_review_day}
	<ReviewSummary allDays={mockPlannedDays} allExercises={mockPlannedExercises} allPlannedSets={mockPlannedSets} allSetLogs={mockSetLogs} />
{:else}
	{#each exercises.sort((a, b) => a.order - b.order) as exercise (exercise.id)}
		{@const exPlannedSets = plannedSets.filter(s => s.planned_exercise_id === exercise.id)}
		{@const exSetLogs = setLogs.filter(s => s.planned_exercise_id === exercise.id)}
		<ExerciseTile {exercise} plannedSets={exPlannedSets} setLogs={exSetLogs} />
	{/each}
{/if}

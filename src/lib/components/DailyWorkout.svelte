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
	<div class="empty-card">
		<p>Rest Day — recover and come back stronger.</p>
	</div>
{:else if plannedDay.is_review_day}
	<ReviewSummary allDays={mockPlannedDays} allExercises={mockPlannedExercises} allPlannedSets={mockPlannedSets} allSetLogs={mockSetLogs} />
{:else}
	<div class="exercise-list">
		{#each exercises.sort((a, b) => a.order - b.order) as exercise (exercise.id)}
			{@const exPlannedSets = plannedSets.filter(s => s.planned_exercise_id === exercise.id)}
			{@const exSetLogs = setLogs.filter(s => s.planned_exercise_id === exercise.id)}
			<ExerciseTile {exercise} plannedSets={exPlannedSets} setLogs={exSetLogs} />
		{/each}
	</div>
{/if}

<style>
	.exercise-list {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.empty-card {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 12px;
		padding: 2rem 1rem;
		text-align: center;
	}

	.empty-card p {
		color: #999;
		font-size: 0.9375rem;
		margin: 0;
	}
</style>

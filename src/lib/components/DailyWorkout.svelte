<script lang="ts">
	import type { PlannedDay, PlannedExercise, PlannedSet, SetLog } from '$lib/types';
	import ExerciseTile from './ExerciseTile.svelte';

	let { plannedDay, exercises, plannedSets, setLogs, onSetComplete }: {
		plannedDay: PlannedDay;
		exercises: PlannedExercise[];
		plannedSets: PlannedSet[];
		setLogs: SetLog[];
		onSetComplete?: () => void;
	} = $props();

	const totalSets = $derived(plannedSets.length);
	const completedSets = $derived(setLogs.filter(s => s.completed).length);
	const allDone = $derived(completedSets === totalSets && totalSets > 0);

	const activeExerciseId = $derived(() => {
		for (const ex of exercises.toSorted((a, b) => a.order - b.order)) {
			const exLogs = setLogs.filter(s => s.planned_exercise_id === ex.id);
			if (exLogs.length === 0 || !exLogs.every(s => s.completed)) return ex.id;
		}
		return null;
	});

	const sorted = $derived(exercises.toSorted((a, b) => a.order - b.order));
</script>

{#if plannedDay.is_rest_day || plannedDay.is_review_day}
	<!-- Rest day and review day designs are out of scope — placeholder only -->
	<div class="placeholder-card">
		<p>{plannedDay.is_rest_day ? 'Rest Day' : 'Review Day'}</p>
	</div>
{:else}
	{#if allDone}
		<div class="complete-card">
			<p class="complete-title">Workout Complete</p>
			<p class="complete-sub">{totalSets} sets · {exercises.length} exercises</p>
		</div>
	{/if}

	<div class="exercise-list" class:dimmed={allDone}>
		{#each sorted as exercise (exercise.id)}
			{@const exPlannedSets = plannedSets.filter(s => s.planned_exercise_id === exercise.id)}
			{@const exSetLogs = setLogs.filter(s => s.planned_exercise_id === exercise.id)}
			<ExerciseTile
				{exercise}
				plannedSets={exPlannedSets}
				setLogs={exSetLogs}
				isActive={activeExerciseId() === exercise.id}
				{onSetComplete}
			/>
		{/each}
	</div>
{/if}

<style>
	.exercise-list {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.exercise-list.dimmed {
		opacity: 0.6;
	}

	.placeholder-card {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 14px;
		padding: 2rem 1rem;
		text-align: center;
	}

	.placeholder-card p {
		color: #999;
		font-size: 0.9375rem;
		margin: 0;
	}

	.complete-card {
		background: #000;
		border-radius: 14px;
		padding: 1.5rem 1rem;
		text-align: center;
		margin-bottom: 0.5rem;
	}

	.complete-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #fff;
		margin: 0 0 0.25rem;
	}

	.complete-sub {
		font-size: 0.8125rem;
		color: #999;
		margin: 0;
	}
</style>

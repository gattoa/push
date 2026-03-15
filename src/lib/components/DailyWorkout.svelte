<script lang="ts">
	import type { PlannedDay, PlannedExercise, PlannedSet, SetLog } from '$lib/types';
	import ExerciseTile from './ExerciseTile.svelte';
	import { today as copy } from '$lib/copy';

	let { plannedDay, exercises, plannedSets, setLogs, onSetComplete, nextSession }: {
		plannedDay: PlannedDay;
		exercises: PlannedExercise[];
		plannedSets: PlannedSet[];
		setLogs: SetLog[];
		onSetComplete?: () => void;
		nextSession?: { day: PlannedDay; exercises: PlannedExercise[] } | null;
	} = $props();

	const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

{#if plannedDay.is_rest_day}
	{#if nextSession}
		<div class="next-session">
			<span class="next-session-header">
				{copy.restDay.nextSessionLabel(DAY_NAMES[nextSession.day.day_of_week], nextSession.day.label)}
			</span>
			<ul class="next-session-exercises">
				{#each nextSession.exercises.toSorted((a, b) => a.order - b.order) as exercise}
					<li>
						<span class="exercise-name">{exercise.exercise_name}</span>
						<span class="exercise-body-parts">{exercise.body_parts.map(p => p.toLowerCase()).join(', ')}</span>
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<p class="week-done">{copy.weekComplete}</p>
	{/if}
{:else}
	<div class="exercise-list">
		{#each sorted as exercise, i (exercise.id)}
			{@const exPlannedSets = plannedSets.filter(s => s.planned_exercise_id === exercise.id)}
			{@const exSetLogs = setLogs.filter(s => s.planned_exercise_id === exercise.id)}
			{@const prevExercise = i > 0 ? sorted[i - 1] : null}
			{@const isContinuationOfSuperset = exercise.superset_group && prevExercise?.superset_group === exercise.superset_group}

			{#if isContinuationOfSuperset}
				<div class="superset-connector">
					<div class="connector-line"></div>
					<span class="connector-label">superset</span>
					<div class="connector-line"></div>
				</div>
			{/if}

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

	.superset-connector {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: -0.375rem 0;
		z-index: 1;
	}

	.connector-line {
		width: 1px;
		height: 0.5rem;
		background: #ccc;
	}

	.connector-label {
		font-size: 0.5625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #bbb;
		background: #f5f5f7;
		padding: 0.125rem 0.5rem;
		border-radius: 100px;
		white-space: nowrap;
	}

	.next-session {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 14px;
		padding: 1rem;
	}

	.next-session-header {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #999;
		letter-spacing: -0.01em;
	}

	.next-session-exercises {
		list-style: none;
		margin: 0.75rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.next-session-exercises li {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.exercise-name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #000;
	}

	.exercise-body-parts {
		font-size: 0.75rem;
		color: #999;
		font-weight: 500;
	}

	.week-done {
		color: #999;
		font-size: 0.9375rem;
		font-weight: 500;
		text-align: center;
		margin: 1rem 0 0;
	}

</style>

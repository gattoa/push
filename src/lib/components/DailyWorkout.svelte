<script lang="ts">
	import type { PlannedDay, PlannedExercise, PlannedSet, SetLog } from '$lib/types';
	import ExerciseTile from './ExerciseTile.svelte';
	import TomorrowPreview from './TomorrowPreview.svelte';
	import WeekSummary from './WeekSummary.svelte';

	let { plannedDay, exercises, plannedSets, setLogs, onSetComplete, currentDayIndex, allDays, allExercises, allPlannedSets }: {
		plannedDay: PlannedDay;
		exercises: PlannedExercise[];
		plannedSets: PlannedSet[];
		setLogs: SetLog[];
		onSetComplete?: () => void;
		currentDayIndex: number;
		allDays: PlannedDay[];
		allExercises: PlannedExercise[];
		allPlannedSets: PlannedSet[];
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

	// Recovery context: body parts from the most recent training day before today
	const recoveringParts = $derived(() => {
		for (let offset = 1; offset <= 6; offset++) {
			const idx = currentDayIndex - offset;
			if (idx < 0) break;
			const day = allDays[idx];
			if (day && !day.is_rest_day && !day.is_review_day) {
				const dayExercises = allExercises.filter(e => e.planned_day_id === day.id);
				return [...new Set(dayExercises.flatMap(e => e.body_parts))];
			}
		}
		return [];
	});
</script>

{#if plannedDay.is_review_day}
	<!-- Review day design is out of scope — placeholder only -->
	<div class="placeholder-card">
		<p>Review Day</p>
	</div>
{:else if plannedDay.is_rest_day}
	<div class="rest-day-content">
		{#if recoveringParts().length > 0}
			<div class="recovery-card">
				<span class="recovery-label">Recovering</span>
				<div class="recovery-parts">
					{#each recoveringParts() as part}
						<span class="recovery-chip">{part.toLowerCase()}</span>
					{/each}
				</div>
			</div>
		{/if}

		<TomorrowPreview
			{currentDayIndex}
			days={allDays}
			exercises={allExercises}
			plannedSets={allPlannedSets}
		/>

		<WeekSummary {currentDayIndex} days={allDays} />
	</div>
{:else}
	{#if allDone}
		<div class="complete-card">
			<p class="complete-title">Workout Complete</p>
			<p class="complete-sub">{totalSets} sets · {exercises.length} exercises</p>
		</div>
	{/if}

	{#if allDone}
		<TomorrowPreview
			{currentDayIndex}
			days={allDays}
			exercises={allExercises}
			plannedSets={allPlannedSets}
		/>
		<WeekSummary {currentDayIndex} days={allDays} />
	{/if}

	<div class="exercise-list" class:dimmed={allDone}>
		{#each sorted as exercise, i (exercise.id)}
			{@const exPlannedSets = plannedSets.filter(s => s.planned_exercise_id === exercise.id)}
			{@const exSetLogs = setLogs.filter(s => s.planned_exercise_id === exercise.id)}
			{@const prevExercise = i > 0 ? sorted[i - 1] : null}
			{@const isStartOfSuperset = exercise.superset_group && (!prevExercise || prevExercise.superset_group !== exercise.superset_group)}
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

	.exercise-list.dimmed {
		opacity: 0.6;
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

	.rest-day-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.recovery-card {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 14px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.recovery-label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #bbb;
	}

	.recovery-parts {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.recovery-chip {
		font-size: 0.75rem;
		font-weight: 600;
		color: #555;
		background: #f2f2f2;
		padding: 0.25rem 0.625rem;
		border-radius: 100px;
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

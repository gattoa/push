<script lang="ts">
	import type { PlannedDay, PlannedExercise, PlannedSet, SetLog } from '$lib/types';
	import { getDayName } from '$lib/mock/workouts';

	let { allDays, allExercises, allPlannedSets, allSetLogs }: {
		allDays: PlannedDay[];
		allExercises: PlannedExercise[];
		allPlannedSets: PlannedSet[];
		allSetLogs: SetLog[];
	} = $props();
</script>

<h2>Weekly Review</h2>

{#each allDays.filter(d => !d.is_rest_day && !d.is_review_day) as day (day.id)}
	{@const dayExercises = allExercises.filter(e => e.planned_day_id === day.id)}
	{@const daySets = allSetLogs.filter(s => dayExercises.some(e => e.id === s.planned_exercise_id))}
	{@const completedSets = daySets.filter(s => s.completed).length}
	{@const exercisesCompleted = dayExercises.filter(ex => {
		const exSets = daySets.filter(s => s.planned_exercise_id === ex.id);
		return exSets.length > 0 && exSets.every(s => s.completed);
	}).length}

	<p>
		{getDayName(day.day_of_week)} ({day.label}):
		{exercisesCompleted}/{dayExercises.length} exercises,
		{completedSets}/{daySets.length} sets
	</p>
{/each}

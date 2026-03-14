<script lang="ts">
	import { mockPlannedDays, mockPlannedSets, mockPlannedExercises, mockSetLogs, getTodayIndex } from '$lib/mock/workouts';
	import DailyWorkout from '$lib/components/DailyWorkout.svelte';

	const todayIndex = getTodayIndex();
	const todayPlan = mockPlannedDays[todayIndex];
	const todayExercises = mockPlannedExercises.filter(e => e.planned_day_id === todayPlan.id);
	const todayPlannedSets = mockPlannedSets.filter(s =>
		todayExercises.some(e => e.id === s.planned_exercise_id)
	);
	const todaySetLogs = mockSetLogs.filter(s =>
		todayExercises.some(e => e.id === s.planned_exercise_id)
	);
</script>

<h1>{todayPlan.label}</h1>
<h2>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>

<DailyWorkout
	plannedDay={todayPlan}
	exercises={todayExercises}
	plannedSets={todayPlannedSets}
	setLogs={todaySetLogs}
/>

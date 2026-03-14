<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { mockPlannedDays, mockPlannedSets, mockPlannedExercises, mockSetLogs, getTodayIndex } from '$lib/mock/workouts';
	import DailyWorkout from '$lib/components/DailyWorkout.svelte';

	onMount(() => {
		if (!localStorage.getItem('push_onboarding_complete')) {
			goto('/onboarding');
		}
	});

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

<div class="today-page">
	<div class="today-header">
		<a href="/plan" class="today-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</a>
		<h1>{todayPlan.label}</h1>
	</div>

	<DailyWorkout
		plannedDay={todayPlan}
		exercises={todayExercises}
		plannedSets={todayPlannedSets}
		setLogs={todaySetLogs}
	/>
</div>

<style>
	.today-page {
		max-width: 480px;
		margin: 0 auto;
		padding: 0 1rem 6rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.today-header {
		text-align: center;
		padding: 0.5rem 0 0.25rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0;
	}

	.today-date {
		font-size: 0.875rem;
		color: #999;
		text-decoration: none;
		margin: 0;
	}

	.today-date:hover {
		color: #666;
	}
</style>

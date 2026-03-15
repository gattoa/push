<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { mockPlannedDays, mockPlannedSets, mockPlannedExercises, mockSetLogs, getTodayIndex } from '$lib/mock/workouts';
	import DailyWorkout from '$lib/components/DailyWorkout.svelte';

	let dayIndex = $state(getTodayIndex());

	onMount(() => {
		if (!localStorage.getItem('push_onboarding_complete')) {
			goto('/onboarding');
		}
		const d = new URLSearchParams(window.location.search).get('day');
		if (d !== null) dayIndex = parseInt(d);
	});

	const todayPlan = $derived(mockPlannedDays[dayIndex]);
	const todayExercises = $derived(mockPlannedExercises.filter(e => e.planned_day_id === todayPlan.id));
	const todayPlannedSets = $derived(mockPlannedSets.filter(s =>
		todayExercises.some(e => e.id === s.planned_exercise_id)
	));

	// Wrap in $state for deep reactivity — mutations in SetCheckbox propagate up
	let allSetLogs = $state(structuredClone(mockSetLogs));
	const todaySetLogs = $derived(
		allSetLogs.filter(s => todayExercises.some(e => e.id === s.planned_exercise_id))
	);

	const isTrainingDay = $derived(!todayPlan.is_rest_day && !todayPlan.is_review_day);
	const completedSets = $derived(todaySetLogs.filter(s => s.completed).length);
	const totalSets = $derived(todayPlannedSets.length);
	const progressPct = $derived(totalSets > 0 ? (completedSets / totalSets) * 100 : 0);
	const bodyParts = $derived([...new Set(todayExercises.flatMap(e => e.body_parts))]);
</script>

<div class="today-page">
	<div class="today-header">
		<a href="/plan" class="today-date">
			{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
		</a>
		<h1>{todayPlan.label}</h1>
		{#if isTrainingDay && bodyParts.length > 0}
			<div class="body-parts">
				{#each bodyParts as part}
					<span class="chip">{part.toLowerCase()}</span>
				{/each}
			</div>
		{/if}
	</div>

	{#if isTrainingDay && totalSets > 0}
		<div class="progress-section">
			<div class="progress-track">
				<div class="progress-fill" style="width: {progressPct}%"></div>
			</div>
			<span class="progress-text">{completedSets} of {totalSets} sets</span>
		</div>
	{/if}

	<DailyWorkout
		plannedDay={todayPlan}
		exercises={todayExercises}
		plannedSets={todayPlannedSets}
		setLogs={todaySetLogs}
		currentDayIndex={dayIndex}
		allDays={mockPlannedDays}
		allExercises={mockPlannedExercises}
		allPlannedSets={mockPlannedSets}
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
		padding: 0.5rem 0 0;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 800;
		margin: 0.125rem 0 0;
		letter-spacing: -0.02em;
	}

	.today-date {
		font-size: 0.8125rem;
		color: #999;
		text-decoration: none;
		font-weight: 500;
	}

	.today-date:hover {
		color: #666;
	}

	.body-parts {
		display: flex;
		justify-content: center;
		gap: 0.375rem;
		margin-top: 0.5rem;
		flex-wrap: wrap;
	}

	.chip {
		font-size: 0.6875rem;
		font-weight: 600;
		color: #777;
		background: #f2f2f2;
		padding: 0.1875rem 0.625rem;
		border-radius: 100px;
	}

	.progress-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.progress-track {
		flex: 1;
		height: 4px;
		background: #eee;
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: #000;
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.75rem;
		color: #999;
		font-weight: 500;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { getTodayIndex } from '$lib/utils/date';
	import {
		getPlan, getDays, getDay, getExercises, getExercisesForDay,
		getPlannedSetsForDay, getSetLogsForDay, getAllSetLogs,
		reloadWorkoutStore
	} from '$lib/stores/workout.svelte';
	import { generatePlan } from '$lib/services/plan-generator';
	import { saveGeneratedPlan } from '$lib/services/workout';
	import DailyWorkout from '$lib/components/DailyWorkout.svelte';
	import CheckInCard from '$lib/components/CheckInCard.svelte';
	import PlanLoading from '$lib/components/PlanLoading.svelte';
	import { isCheckInPending } from '$lib/stores/checkin';
	import { today as copy } from '$lib/copy';
	import type { PlannedDay, PlannedExercise } from '$lib/types';

	let dayIndex = $state(getTodayIndex());
	let planSource: string | null = $state(null);
	let buildingPlan = $state(false);
	let generationError = $state(false);

	let forceCheckIn = $state(false);

	async function triggerGeneration() {
		buildingPlan = true;
		generationError = false;
		const rawData = localStorage.getItem('push_onboarding_data');
		if (rawData) {
			try {
				const onboardingData = JSON.parse(rawData);
				const plan = await generatePlan(onboardingData);
				console.log(`[Push] Plan generated via ${plan.source} — ${plan.exercises.length} exercises, ${plan.sets.length} sets`);
				await saveGeneratedPlan(plan);
				await reloadWorkoutStore();
				planSource = plan.source;
			} catch (e) {
				console.error('[Push] Plan generation failed:', e);
				generationError = true;
			}
		} else {
			generationError = true;
		}
		buildingPlan = false;
	}

	function retryGeneration() {
		triggerGeneration();
	}

	onMount(() => {
		const hasPlan = localStorage.getItem('push_generated_plan');
		if (!hasPlan) {
			triggerGeneration();
			return;
		}

		try {
			planSource = JSON.parse(hasPlan).source ?? null;
		} catch {}

		const params = new URLSearchParams(window.location.search);
		const d = params.get('day');
		if (d !== null) dayIndex = parseInt(d);
		forceCheckIn = params.get('checkin') === 'true';
	});

	const todayPlan = $derived(getDay(dayIndex));
	const todayExercises = $derived(getExercisesForDay(todayPlan.id));
	const todayPlannedSets = $derived(getPlannedSetsForDay(todayPlan.id));
	const todaySetLogs = $derived(getSetLogsForDay(todayPlan.id));

	const isTrainingDay = $derived(!todayPlan.is_rest_day);

	// Check-in: appears after all training days in the week are completed
	const allTrainingDaysComplete = $derived(() => {
		const allDays = getDays();
		const allLogs = getAllSetLogs();
		for (const day of allDays) {
			if (day.is_rest_day) continue;
			const dayExercises = getExercisesForDay(day.id);
			if (dayExercises.length === 0) continue;
			const dayLogs = allLogs.filter(s => dayExercises.some(e => e.id === s.planned_exercise_id));
			if (!dayLogs.every(s => s.completed)) return false;
		}
		return true;
	});
	let checkInDismissed = $state(false);
	const showCheckIn = $derived(
		(forceCheckIn || allTrainingDaysComplete()) && !checkInDismissed && isCheckInPending(getPlan()!.id)
	);
	const completedSets = $derived(todaySetLogs.filter(s => s.completed).length);
	const totalSets = $derived(todayPlannedSets.length);
	const progressPct = $derived(totalSets > 0 ? (completedSets / totalSets) * 100 : 0);
	const bodyParts = $derived([...new Set(todayExercises.flatMap(e => e.body_parts))]);

	// Next training day (for rest day display) — only looks forward within the week, no wrap-around
	const nextTrainingDay = $derived((): { day: PlannedDay; exercises: PlannedExercise[] } | null => {
		const allDays = getDays();
		for (let idx = dayIndex + 1; idx < allDays.length; idx++) {
			const day = allDays[idx];
			if (day && !day.is_rest_day) {
				const exs = getExercisesForDay(day.id);
				return { day, exercises: exs };
			}
		}
		return null;
	});
</script>

{#if buildingPlan || generationError}
	<div class="today-page">
		<PlanLoading error={generationError} onretry={retryGeneration} />
	</div>
{:else}
<div class="today-page">
	<div class="today-header">
		<a href="/plan" class="today-date">
			{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
		</a>
		<h1>{todayPlan.label}</h1>
		{#if planSource}
			<span class="source-badge" class:ai={planSource === 'ai'}>{planSource === 'ai' ? 'AI Plan' : 'Mock Plan'}</span>
		{/if}
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
			<span class="progress-text">
				{#if progressPct === 100}
					{copy.workoutComplete}
				{:else}
					{completedSets} of {totalSets} sets
				{/if}
			</span>
		</div>
	{/if}

	{#if showCheckIn}
		<CheckInCard
			weekPlanId={getPlan()!.id}
			ondismiss={() => checkInDismissed = true}
		/>
	{/if}

	<DailyWorkout
		plannedDay={todayPlan}
		exercises={todayExercises}
		plannedSets={todayPlannedSets}
		setLogs={todaySetLogs}
		nextSession={nextTrainingDay()}
	/>
</div>
{/if}

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

	.source-badge {
		display: inline-block;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.125rem 0.5rem;
		border-radius: 100px;
		background: #fee2e2;
		color: #b91c1c;
		margin-top: 0.25rem;
	}

	.source-badge.ai {
		background: #dcfce7;
		color: #15803d;
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

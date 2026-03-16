<script lang="ts">
	import type { ExerciseDBExercise } from '$lib/types';
	import {
		getExerciseByDbId,
		getSetsForExercise,
		getLogsForExercise
	} from '$lib/stores/workout.svelte';
	import { getPreferences } from '$lib/stores/preferences';
	import SetRow from '$lib/components/SetRow.svelte';
	import QuickComplete from '$lib/components/QuickComplete.svelte';
	import ExerciseHistory from '$lib/components/ExerciseHistory.svelte';
	import { getWeekHistories } from '$lib/services/history';
	import { computeExerciseHistory } from '$lib/utils/workout-stats';
	import { onMount } from 'svelte';

	let { data } = $props();
	let exercise: ExerciseDBExercise | null = $derived(data.exercise);
	const units = getPreferences().units;

	let exerciseHistoryData = $state<import('$lib/types').ExerciseHistorySummary | null>(null);

	onMount(() => {
		const histories = getWeekHistories();
		const eid = data.exerciseId ?? '';
		if (eid && histories.length > 0) {
			exerciseHistoryData = computeExerciseHistory(eid, histories);
		}
	});

	let exerciseId = $derived(data.exerciseId ?? '');
	let plannedExercise = $derived(getExerciseByDbId(exerciseId) ?? null);
	let plannedSets = $derived(plannedExercise ? getSetsForExercise(plannedExercise.id) : []);
	let setLogs = $derived(plannedExercise ? getLogsForExercise(plannedExercise.id) : []);
	let exerciseHistory = $derived(exerciseHistoryData);

	let completedCount = $derived(setLogs.filter(s => s.completed).length);
	let allDone = $derived(completedCount === plannedSets.length && plannedSets.length > 0);

	const displayName = $derived(
		plannedExercise?.exercise_name ?? exercise?.name ?? exerciseHistory?.exerciseName ?? 'Exercise'
	);

	const equipments = $derived(
		plannedExercise?.equipments ?? exercise?.equipments ?? []
	);

	const targetMuscles = $derived(exercise?.targetMuscles ?? []);
	const secondaryMuscles = $derived(exercise?.secondaryMuscles ?? []);

	// Tab state
	type Tab = 'log' | 'guide' | 'history';
	let activeTab = $state<Tab>('log');

	const hasGuide = $derived(
		exercise && (
			exercise.videoUrl ||
			exercise.imageUrl ||
			exercise.overview ||
			exercise.instructions.length > 0 ||
			exercise.exerciseTips.length > 0
		)
	);

	const hasHistory = $derived(
		exerciseHistory && exerciseHistory.sessions.length > 0
	);

	const hasLog = $derived(
		plannedExercise && plannedSets.length > 0
	);

	// Determine which tabs are available
	const availableTabs = $derived((): { id: Tab; label: string }[] => {
		const tabs: { id: Tab; label: string }[] = [];
		if (hasLog) tabs.push({ id: 'log', label: 'Log' });
		if (hasGuide) tabs.push({ id: 'guide', label: 'Guide' });
		if (hasHistory) tabs.push({ id: 'history', label: 'History' });
		return tabs;
	});

	// Show tab UI only if there's more than one tab
	const showTabs = $derived(availableTabs().length > 1);
</script>

<div class="exercise-page">
	<button class="back-btn" onclick={() => history.back()}>
		<span class="back-arrow">&#8249;</span> Back
	</button>

	<!-- Identity: name → muscles → cue → equipment -->
	<div class="exercise-identity">
		<div class="name-row">
			<h1>{displayName}</h1>
			{#if allDone}
				<span class="status-badge done">&#10003;</span>
			{:else if completedCount > 0}
				<span class="status-badge partial">{completedCount}/{plannedSets.length}</span>
			{/if}
		</div>

		{#if targetMuscles.length > 0 || secondaryMuscles.length > 0}
			<div class="muscle-chips">
				{#each targetMuscles as muscle}
					<span class="chip target">{muscle}</span>
				{/each}
				{#each secondaryMuscles as muscle}
					<span class="chip secondary">{muscle}</span>
				{/each}
			</div>
		{/if}

		{#if plannedExercise?.cue}
			<p class="cue">"{plannedExercise.cue}"</p>
		{/if}

		{#if equipments.length > 0}
			<span class="equipment">{equipments.join(' · ')}</span>
		{/if}
	</div>

	<!-- Tabbed content -->
	{#if showTabs}
		<div class="tab-bar">
			{#each availableTabs() as tab}
				<button
					class="tab-btn"
					class:active={activeTab === tab.id}
					onclick={() => activeTab = tab.id}
				>
					{tab.label}
				</button>
			{/each}
		</div>
	{/if}

	<div class="tab-content">
		{#if activeTab === 'log' && hasLog && plannedExercise}
			<div class="log-section">
				<div class="log-header">
					<span class="log-header-label set-col">SET</span>
					<span class="log-header-label">WEIGHT</span>
					<span class="log-header-label">REPS</span>
				</div>
				<div class="sets-list">
					{#each plannedSets as ps (ps.id)}
						{@const log = setLogs.find(s => s.planned_set_id === ps.id)}
						{#if log}
							<SetRow plannedSet={ps} setLog={log} />
						{/if}
					{/each}
				</div>
				<QuickComplete {plannedSets} {setLogs} exerciseId={plannedExercise.id} />
			</div>
		{:else if activeTab === 'guide' && hasGuide && exercise}
			<div class="guide-section">
				{#if exercise.videoUrl}
					<video controls width="100%" class="media" loop muted playsinline>
						<source src={exercise.videoUrl} type="video/mp4" />
						<track kind="captions" />
					</video>
				{:else if exercise.imageUrl}
					<img src={exercise.imageUrl} alt={exercise.name} class="media" />
				{/if}

				{#if exercise.overview}
					<p class="overview">{exercise.overview}</p>
				{/if}

				{#if exercise.instructions.length > 0}
					<div class="info-block">
						<h3>Instructions</h3>
						<ol>
							{#each exercise.instructions as step}
								<li>{step}</li>
							{/each}
						</ol>
					</div>
				{/if}

				{#if exercise.exerciseTips.length > 0}
					<div class="info-block">
						<h3>Tips</h3>
						<ul>
							{#each exercise.exerciseTips as tip}
								<li>{tip}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{:else if activeTab === 'history' && hasHistory && exerciseHistory}
			<ExerciseHistory history={exerciseHistory} {units} embedded />
		{/if}
	</div>

	{#if !exercise && !exerciseHistory && !plannedExercise}
		<p class="not-found">Exercise not found.</p>
	{/if}
</div>

<style>
	.exercise-page {
		max-width: 480px;
		margin: 0 auto;
		padding: 0 1rem 6rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #666;
		padding: 0.5rem 0;
	}

	.back-btn:hover {
		color: #000;
	}

	.back-arrow {
		font-size: 1.25rem;
		line-height: 1;
	}

	/* Exercise identity */
	.exercise-identity {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.name-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	h1 {
		font-size: 1.375rem;
		font-weight: 800;
		margin: 0;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.status-badge {
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0.125rem 0.5rem;
		border-radius: 6px;
		flex-shrink: 0;
	}

	.status-badge.done {
		background: #000;
		color: #fff;
	}

	.status-badge.partial {
		background: #f0f0f0;
		color: #666;
	}

	/* Muscle chips */
	.muscle-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.chip {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 0.1875rem 0.5rem;
		border-radius: 100px;
	}

	.chip.target {
		background: #f2f2f2;
		color: #555;
	}

	.chip.secondary {
		background: #f8f8f8;
		color: #999;
	}

	/* Cue */
	.cue {
		font-size: 0.875rem;
		font-weight: 500;
		color: #555;
		margin: 0;
	}

	/* Equipment */
	.equipment {
		font-size: 0.75rem;
		color: #999;
		font-weight: 500;
	}

	/* Tab bar */
	.tab-bar {
		display: flex;
		gap: 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.tab-btn {
		flex: 1;
		padding: 0.625rem 0;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #999;
		transition: all 0.15s;
	}

	.tab-btn.active {
		color: #000;
		font-weight: 600;
		border-bottom-color: #000;
	}

	/* Tab content */
	.tab-content {
		min-height: 200px;
	}

	/* Log section */
	.log-section {
		display: flex;
		flex-direction: column;
	}

	.log-header {
		display: flex;
		align-items: center;
		padding: 0.375rem 0;
		gap: 0.5rem;
	}

	.log-header-label {
		font-size: 0.6875rem;
		font-weight: 700;
		color: #bbb;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.log-header-label.set-col {
		min-width: 0.875rem;
	}

	.sets-list {
		display: flex;
		flex-direction: column;
	}

	/* Guide section */
	.guide-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.media {
		width: 100%;
		border-radius: 8px;
	}

	.overview {
		font-size: 0.875rem;
		color: #444;
		line-height: 1.5;
		margin: 0;
	}

	.info-block {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-block h3 {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #000;
		margin: 0;
	}

	.info-block ol,
	.info-block ul {
		font-size: 0.8125rem;
		color: #555;
		margin: 0;
		padding-left: 1.25rem;
		line-height: 1.6;
	}

	.not-found {
		color: #999;
		font-size: 0.875rem;
		text-align: center;
		margin: 2rem 0;
	}
</style>

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
	import { mockWeekHistories } from '$lib/mock/profile-history';
	import { computeExerciseHistory } from '$lib/mock/profile';

	let { data } = $props();
	let exercise: ExerciseDBExercise | null = $derived(data.exercise);
	const units = getPreferences().units;

	let exerciseId = $derived(data.exerciseId ?? '');
	let plannedExercise = $derived(getExerciseByDbId(exerciseId) ?? null);
	let plannedSets = $derived(plannedExercise ? getSetsForExercise(plannedExercise.id) : []);
	let setLogs = $derived(plannedExercise ? getLogsForExercise(plannedExercise.id) : []);
	let exerciseHistory = $derived(exerciseId ? computeExerciseHistory(exerciseId, mockWeekHistories) : null);

	let completedCount = $derived(setLogs.filter(s => s.completed).length);
	let allDone = $derived(completedCount === plannedSets.length && plannedSets.length > 0);

	const displayName = $derived(
		plannedExercise?.exercise_name ?? exercise?.name ?? exerciseHistory?.exerciseName ?? 'Exercise'
	);

	const bodyParts = $derived(
		plannedExercise?.body_parts ?? exercise?.bodyParts ?? []
	);

	const equipments = $derived(
		plannedExercise?.equipments ?? exercise?.equipments ?? []
	);

	let historyOpen = $state(false);
	let infoOpen = $state(false);
</script>

<div class="exercise-page">
	<button class="back-btn" onclick={() => history.back()}>
		<span class="back-arrow">&#8249;</span> Back
	</button>

	<div class="exercise-identity">
		<div class="name-row">
			<h1>{displayName}</h1>
			{#if allDone}
				<span class="status-badge done">&#10003;</span>
			{:else if completedCount > 0}
				<span class="status-badge partial">{completedCount}/{plannedSets.length}</span>
			{/if}
		</div>

		{#if bodyParts.length > 0 || equipments.length > 0}
			<div class="chips">
				{#each bodyParts as part}
					<span class="chip body-part">{part.toLowerCase()}</span>
				{/each}
				{#each equipments as equip}
					<span class="chip equipment">{equip}</span>
				{/each}
			</div>
		{/if}

		{#if plannedExercise?.cue}
			<p class="cue">{plannedExercise.cue}</p>
		{/if}
	</div>

	{#if plannedExercise && plannedSets.length > 0}
		<section class="log-section">
			<div class="sets-list">
				{#each plannedSets as ps (ps.id)}
					{@const log = setLogs.find(s => s.planned_set_id === ps.id)}
					{#if log}
						<SetRow plannedSet={ps} setLog={log} />
					{/if}
				{/each}
			</div>
			<QuickComplete {plannedSets} {setLogs} exerciseId={plannedExercise.id} />
		</section>
	{/if}

	{#if exerciseHistory && exerciseHistory.sessions.length > 0}
		<button class="section-toggle" onclick={() => historyOpen = !historyOpen}>
			<span class="section-toggle-label">History</span>
			<span class="section-toggle-meta">{exerciseHistory.sessions.length} sessions</span>
			<span class="section-toggle-arrow" class:open={historyOpen}>&#8250;</span>
		</button>
		{#if historyOpen}
			<div class="section-content">
				<ExerciseHistory history={exerciseHistory} {units} />
			</div>
		{/if}
	{/if}

	{#if exercise}
		<button class="section-toggle" onclick={() => infoOpen = !infoOpen}>
			<span class="section-toggle-label">Exercise Info</span>
			<span class="section-toggle-arrow" class:open={infoOpen}>&#8250;</span>
		</button>
		{#if infoOpen}
			<div class="section-content">
				{#if exercise.overview}
					<p class="overview">{exercise.overview}</p>
				{/if}

				{#if exercise.videoUrl}
					<video controls width="100%" class="media">
						<source src={exercise.videoUrl} type="video/mp4" />
						<track kind="captions" />
					</video>
				{:else if exercise.imageUrl}
					<img src={exercise.imageUrl} alt={exercise.name} class="media" />
				{/if}

				{#if exercise.targetMuscles.length > 0}
					<div class="info-block">
						<h3>Target Muscles</h3>
						<p>{exercise.targetMuscles.join(', ')}</p>
					</div>
				{/if}

				{#if exercise.secondaryMuscles.length > 0}
					<div class="info-block">
						<h3>Secondary Muscles</h3>
						<p>{exercise.secondaryMuscles.join(', ')}</p>
					</div>
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

				{#if exercise.variations.length > 0}
					<div class="info-block">
						<h3>Variations</h3>
						<ul>
							{#each exercise.variations as variation}
								<li>{variation}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
	{:else if !exerciseHistory && !plannedExercise}
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

	.chips {
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

	.chip.body-part {
		background: #f2f2f2;
		color: #777;
	}

	.chip.equipment {
		background: #e8f0ff;
		color: #5577aa;
	}

	.cue {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #666;
		font-style: italic;
		margin: 0;
	}

	/* Log section */
	.log-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.sets-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Collapsible sections */
	.section-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.75rem 0;
		background: none;
		border: none;
		border-top: 1px solid #f0f0f0;
		cursor: pointer;
		font-family: inherit;
	}

	.section-toggle-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #000;
	}

	.section-toggle-meta {
		font-size: 0.75rem;
		color: #999;
		font-weight: 500;
	}

	.section-toggle-arrow {
		margin-left: auto;
		font-size: 1rem;
		color: #999;
		transition: transform 0.2s ease;
	}

	.section-toggle-arrow.open {
		transform: rotate(90deg);
	}

	.section-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-bottom: 0.5rem;
	}

	.overview {
		font-size: 0.875rem;
		color: #444;
		line-height: 1.5;
		margin: 0;
	}

	.media {
		width: 100%;
		border-radius: 8px;
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

	.info-block p {
		font-size: 0.8125rem;
		color: #555;
		margin: 0;
		line-height: 1.5;
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

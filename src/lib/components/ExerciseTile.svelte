<script lang="ts">
	import type { PlannedExercise, PlannedSet, SetLog } from '$lib/types';
	import SetCheckbox from './SetCheckbox.svelte';

	let { exercise, plannedSets, setLogs, isActive = false, onSetComplete }: {
		exercise: PlannedExercise;
		plannedSets: PlannedSet[];
		setLogs: SetLog[];
		isActive?: boolean;
		onSetComplete?: () => void;
	} = $props();

	const completedCount = $derived(setLogs.filter(s => s.completed).length);
	const allDone = $derived(completedCount === plannedSets.length && plannedSets.length > 0);

	const contextParts = $derived(() => {
		const parts: string[] = [];
		if (exercise.cue) parts.push(exercise.cue);
		if (exercise.equipments.length > 0) parts.push(exercise.equipments.join(', '));
		parts.push(...exercise.body_parts.map(p => p.toLowerCase()));
		return parts.join(' · ');
	});
</script>

<div class="tile" class:done={allDone} class:active={isActive && !allDone}>
	<div class="tile-header">
		<a href="/exercise/{exercise.exercisedb_id}" class="exercise-name">{exercise.exercise_name}</a>
		{#if allDone}
			<span class="badge done-badge">&#10003;</span>
		{:else if completedCount > 0}
			<span class="badge progress-badge">{completedCount}/{plannedSets.length}</span>
		{/if}
	</div>

	{#if contextParts()}
		<span class="context">{contextParts()}</span>
	{/if}

	<div class="sets-row">
		{#each plannedSets as ps (ps.id)}
			{@const log = setLogs.find(s => s.planned_set_id === ps.id)}
			{#if log}
				<SetCheckbox plannedSet={ps} setLog={log} onComplete={onSetComplete} />
			{/if}
		{/each}
	</div>
</div>

<style>
	.tile {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 14px;
		padding: 0.875rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		transition: all 0.2s ease;
	}

	.tile.active {
		border-color: #000;
	}

	.tile.done {
		border-color: #eee;
		opacity: 0.45;
	}

	.tile-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.exercise-name {
		font-size: 1rem;
		font-weight: 600;
		color: #000;
		text-decoration: none;
		line-height: 1.3;
	}

	.exercise-name:hover {
		text-decoration: underline;
	}

	.context {
		font-size: 0.6875rem;
		font-weight: 500;
		color: #999;
		letter-spacing: 0.01em;
	}

	.badge {
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0.125rem 0.5rem;
		border-radius: 6px;
		flex-shrink: 0;
	}

	.done-badge {
		background: #000;
		color: #fff;
	}

	.progress-badge {
		background: #f0f0f0;
		color: #666;
	}

	.sets-row {
		display: flex;
		gap: 0.25rem;
		margin-top: 0.25rem;
	}
</style>

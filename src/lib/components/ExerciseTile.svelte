<script lang="ts">
	import type { PlannedExercise, PlannedSet, SetLog } from '$lib/types';
	import SetCheckbox from './SetCheckbox.svelte';

	let { exercise, plannedSets, setLogs }: {
		exercise: PlannedExercise;
		plannedSets: PlannedSet[];
		setLogs: SetLog[];
	} = $props();

	const completedCount = $derived(setLogs.filter(s => s.completed).length);
	const allDone = $derived(completedCount === plannedSets.length && plannedSets.length > 0);
</script>

<div class="tile" class:done={allDone}>
	<div class="tile-header">
		<a href="/exercise/{exercise.exercisedb_id}" class="exercise-name">{exercise.exercise_name}</a>
		{#if allDone}
			<span class="check">✓</span>
		{:else if completedCount > 0}
			<span class="progress">{completedCount}/{plannedSets.length}</span>
		{/if}
	</div>
	<div class="sets">
		{#each plannedSets as ps (ps.id)}
			{@const log = setLogs.find(s => s.planned_set_id === ps.id)}
			{#if log}
				<SetCheckbox plannedSet={ps} setLog={log} />
			{/if}
		{/each}
	</div>
</div>

<style>
	.tile {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 12px;
		padding: 0.875rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		transition: border-color 0.15s;
	}

	.tile.done {
		border-color: #ddd;
		opacity: 0.7;
	}

	.tile-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.exercise-name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #000;
		text-decoration: none;
	}

	.exercise-name:hover {
		text-decoration: underline;
	}

	.check {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #000;
	}

	.progress {
		font-size: 0.75rem;
		font-weight: 600;
		color: #999;
	}

	.sets {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
</style>

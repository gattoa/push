<script lang="ts">
	import type { PlannedSet, SetLog } from '$lib/types';
	import { getPreferences } from '$lib/stores/preferences';
	import { toggleSet } from '$lib/stores/workout.svelte';

	let { plannedSet, setLog, onComplete }: {
		plannedSet: PlannedSet;
		setLog: SetLog;
		onComplete?: () => void;
	} = $props();

	const units = getPreferences().units;

	function toggle() {
		toggleSet(setLog.id);
		if (setLog.completed) {
			onComplete?.();
		}
	}

	const weightLabel = $derived(
		plannedSet.target_weight === null ? 'BW' : `${plannedSet.target_weight}`
	);
	const hasWeight = $derived(plannedSet.target_weight !== null);
</script>

<button
	class="set-col"
	class:completed={setLog.completed}
	onclick={toggle}
	aria-label={setLog.completed ? `Undo set ${plannedSet.set_number}` : `Complete set ${plannedSet.set_number}: ${weightLabel} ${hasWeight ? units : ''} × ${plannedSet.target_reps}`}
>
	<span class="reps">
		{#if setLog.completed}<span class="check">✓</span>{/if}{plannedSet.target_reps}
	</span>
	<span class="weight">{weightLabel}</span>
</button>

<style>
	.set-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
		min-width: 44px;
		min-height: 44px;
		padding: 0.375rem 0.5rem;
		background: none;
		border: 1px solid transparent;
		border-radius: 8px;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}

	.set-col:active {
		transform: scale(0.93);
	}

	.set-col.completed {
		opacity: 0.4;
	}

	.reps {
		font-size: 1.0625rem;
		font-weight: 700;
		color: #000;
		line-height: 1.2;
	}

	.set-col.completed .reps {
		text-decoration: line-through;
	}

	.check {
		font-size: 0.75rem;
		margin-right: 0.125rem;
	}

	.weight {
		font-size: 0.6875rem;
		font-weight: 500;
		color: #999;
		line-height: 1.2;
	}
</style>

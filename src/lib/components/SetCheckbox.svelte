<script lang="ts">
	import type { PlannedSet, SetLog } from '$lib/types';
	import { getPreferences } from '$lib/stores/preferences';

	let { plannedSet, setLog }: {
		plannedSet: PlannedSet;
		setLog: SetLog;
	} = $props();

	const units = getPreferences().units;

	function toggle() {
		setLog.completed = !setLog.completed;
		if (setLog.completed) {
			setLog.actual_reps = plannedSet.target_reps;
			setLog.actual_weight = plannedSet.target_weight;
		}
	}

	const weightLabel = $derived(
		plannedSet.target_weight === null ? 'BW' : `${plannedSet.target_weight} ${units}`
	);
</script>

<button class="set-row" class:completed={setLog.completed} onclick={toggle}>
	<div class="checkbox" class:checked={setLog.completed}>
		{#if setLog.completed}
			<svg width="10" height="10" viewBox="0 0 16 16" fill="none">
				<polyline points="3,8 6.5,11.5 13,4.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		{/if}
	</div>
	<span class="set-label">{weightLabel} × {plannedSet.target_reps}</span>
</button>

<style>
	.set-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.375rem 0;
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		width: 100%;
		text-align: left;
	}

	.checkbox {
		width: 22px;
		height: 22px;
		border-radius: 6px;
		border: 2px solid #ddd;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.15s;
		color: #fff;
	}

	.checkbox.checked {
		background: #000;
		border-color: #000;
	}

	.set-label {
		font-size: 0.875rem;
		color: #333;
		font-weight: 500;
	}

	.set-row.completed .set-label {
		color: #bbb;
		text-decoration: line-through;
	}
</style>

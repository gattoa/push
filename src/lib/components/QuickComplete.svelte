<script lang="ts">
	import type { PlannedSet, SetLog } from '$lib/types';
	import { completeAllSets } from '$lib/stores/workout.svelte';

	let { plannedSets, setLogs, exerciseId }: {
		plannedSets: PlannedSet[];
		setLogs: SetLog[];
		exerciseId: string;
	} = $props();

	let allDone = $derived(setLogs.every(s => s.completed));

	function quickComplete() {
		completeAllSets(exerciseId);
	}
</script>

<button class="quick-complete" class:done={allDone} onclick={quickComplete} disabled={allDone}>
	{allDone ? '✓ All Complete' : 'Complete All Sets'}
</button>

<style>
	.quick-complete {
		width: 100%;
		padding: 0.625rem;
		border: 1px solid #e0e0e0;
		border-radius: 10px;
		background: #fafafa;
		color: #000;
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
	}

	.quick-complete:hover:not(:disabled) {
		background: #f0f0f0;
	}

	.quick-complete:active:not(:disabled) {
		transform: scale(0.98);
	}

	.quick-complete.done {
		background: #000;
		color: #fff;
		border-color: #000;
		opacity: 0.5;
		cursor: default;
	}
</style>

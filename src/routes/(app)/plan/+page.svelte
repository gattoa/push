<script lang="ts">
	import WeekSchedule from '$lib/components/WeekSchedule.svelte';
	import { computeWeekMomentum } from '$lib/utils/workout-stats';
	import { getTodayIndex } from '$lib/utils/date';
	import { getCurrentWeekHistory, swapDays } from '$lib/stores/workout.svelte';
	import type { WeekMomentum } from '$lib/types';

	let momentum: WeekMomentum | null = $state(null);
	let editing = $state(false);

	function recompute() {
		const current = getCurrentWeekHistory();
		if (!current) {
			momentum = null;
			return;
		}
		momentum = computeWeekMomentum([current], getTodayIndex());
	}

	recompute();

	function handleSwap(indexA: number, indexB: number) {
		swapDays(indexA, indexB);
		recompute();
	}
</script>

{#if momentum}
<div class="plan">
	<div class="plan-header">
		<h1>This Week</h1>
		<button class="edit-btn" onclick={() => { editing = !editing; }}>
			{editing ? 'Done' : 'Edit'}
		</button>
	</div>
	{#if editing}
		<p class="edit-hint">Tap two days to swap them</p>
	{/if}
	<WeekSchedule {momentum} editable={editing} onswap={handleSwap} />
</div>
{:else}
<div class="plan">
	<div class="plan-header">
		<h1>This Week</h1>
	</div>
	<p class="empty-state">No plan yet. Head to Today to generate one.</p>
</div>
{/if}

<style>
	.plan {
		max-width: 480px;
		margin: 0 auto;
		padding: 0 1rem 6rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.plan-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.5rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0;
	}

	.edit-btn {
		background: none;
		border: none;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #000;
		cursor: pointer;
		padding: 0.25rem 0;
		font-family: inherit;
	}

	.edit-hint {
		font-size: 0.8125rem;
		color: #999;
		margin: -0.5rem 0 0;
	}

	.empty-state {
		color: #999;
		font-size: 0.9375rem;
		text-align: center;
		padding: 3rem 1rem;
	}
</style>

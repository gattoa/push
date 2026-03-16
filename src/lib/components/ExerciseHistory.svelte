<script lang="ts">
	import type { ExerciseHistorySummary } from '$lib/types';
	import { convertWeight } from '$lib/utils/workout-stats';

	let { history, units, embedded = false }: {
		history: ExerciseHistorySummary;
		units: 'lbs' | 'kg';
		embedded?: boolean;
	} = $props();

	const isBodyweight = $derived(
		history.currentEstimated1RM === null && history.sessions.length > 0
	);

	function bestReps(): number {
		let best = 0;
		for (const session of history.sessions) {
			for (const s of session.sets) {
				if (s.completed && s.reps !== null && s.reps > best) {
					best = s.reps;
				}
			}
		}
		return best;
	}

	function formatSet(weight: number | null, reps: number | null): string {
		if (weight === null || weight === 0) {
			return reps !== null ? `BW×${reps}` : '—';
		}
		const w = convertWeight(weight, units);
		return reps !== null ? `${w}×${reps}` : `${w}`;
	}

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${months[d.getMonth()]} ${d.getDate()}`;
	}
</script>

<section class="history">
	{#if !embedded}
		<h2 class="history-title">History</h2>
	{/if}

	<!-- Summary -->
	<div class="card summary">
		{#if isBodyweight}
			<span class="summary-value">{bestReps()}</span>
			<span class="summary-label">Best Reps</span>
		{:else if history.currentEstimated1RM !== null}
			<div class="summary-row">
				<span class="summary-value">{convertWeight(history.currentEstimated1RM, units).toLocaleString()} {units}</span>
				{#if history.percentChange !== null && history.percentChange !== 0}
					<span class="change-badge" class:positive={history.percentChange > 0} class:negative={history.percentChange < 0}>
						{history.percentChange > 0 ? '+' : ''}{history.percentChange}%
					</span>
				{/if}
			</div>
			<span class="summary-label">Est. 1RM</span>
		{/if}
	</div>

	<!-- Sessions -->
	<div class="card sessions">
		{#each history.sessions as session, i (session.date)}
			{#if i > 0}<div class="divider"></div>{/if}
			<div class="session">
				<div class="session-header">
					<span class="session-date">{formatDate(session.date)} · {session.dayLabel}</span>
					{#if session.isPR}
						<span class="pr-badge">PR</span>
					{/if}
				</div>
				<div class="session-sets">
					{#each session.sets as s}
						<span class="session-set" class:incomplete={!s.completed}>
							{formatSet(s.weight, s.reps)}
						</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.history {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.history-title {
		font-size: 1.125rem;
		font-weight: 700;
		margin: 0;
		color: #000;
	}

	.card {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 12px;
		overflow: hidden;
	}

	/* Summary */
	.summary {
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.summary-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.summary-value {
		font-size: 1.5rem;
		font-weight: 800;
		color: #000;
	}

	.summary-label {
		font-size: 0.6875rem;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 600;
	}

	.change-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
	}

	.change-badge.positive {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.change-badge.negative {
		background: #fce4ec;
		color: #c62828;
	}

	/* Sessions */
	.sessions {
		padding: 0;
	}

	.session {
		padding: 0.75rem 1rem;
	}

	.session-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.375rem;
	}

	.session-date {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #000;
	}

	.pr-badge {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
		background: #000;
		color: #fff;
	}

	.session-sets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: #666;
	}

	.session-set.incomplete {
		color: #bbb;
	}

	.divider {
		height: 1px;
		background: #f0f0f0;
		margin: 0 1rem;
	}
</style>

<script lang="ts">
	import type { LastSessionData } from '$lib/mock/profile';
	import { convertWeight } from '$lib/mock/profile';

	let { session, units }: {
		session: LastSessionData;
		units: 'lbs' | 'kg';
	} = $props();

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const dow = d.getDay();
		const dayLabel = days[dow === 0 ? 6 : dow - 1];
		return `${dayLabel} ${months[d.getMonth()]} ${d.getDate()}`;
	}

	function formatSet(weight: number, reps: number): string {
		if (weight === 0) return `BW×${reps}`;
		const w = convertWeight(weight, units);
		return `${w} × ${reps}`;
	}

	function isImproved(ex: LastSessionData['exercises'][0]): boolean {
		if (!ex.currentBestSet || !ex.previousBestSet) return false;
		// Improved if current weight or reps went up
		return ex.currentBestSet.weight > ex.previousBestSet.weight ||
			(ex.currentBestSet.weight === ex.previousBestSet.weight &&
				ex.currentBestSet.reps > ex.previousBestSet.reps);
	}
</script>

<a href="/session/{session.date}" class="last-session card">
	<div class="session-header">
		<div class="session-header-left">
			<span class="session-label">{session.dayLabel}</span>
			<span class="session-date">{formatDate(session.date)}</span>
		</div>
		<svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="9 18 15 12 9 6"></polyline>
		</svg>
	</div>

	<div class="exercise-list">
		{#each session.exercises as ex, i (ex.exercisedbId)}
			{#if i > 0}<div class="divider"></div>{/if}
			<div class="exercise-row">
				<div class="exercise-left">
					<span class="exercise-name">{ex.exerciseName}</span>
					{#if ex.currentBestSet}
						<div class="comparison">
							{#if ex.previousBestSet}
								<span class="previous">{formatSet(ex.previousBestSet.weight, ex.previousBestSet.reps)}</span>
								<span class="arrow">→</span>
							{/if}
							<span class="current" class:improved={isImproved(ex)}>{formatSet(ex.currentBestSet.weight, ex.currentBestSet.reps)}</span>
						</div>
					{/if}
				</div>
				{#if ex.isPR}
					<span class="pr-badge">PR</span>
				{/if}
			</div>
		{/each}
	</div>
</a>

<style>
	.last-session {
		display: block;
		text-decoration: none;
		color: inherit;
		padding: 0;
		overflow: hidden;
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 12px;
		transition: border-color 0.15s;
	}

	.last-session:hover {
		border-color: #ccc;
	}

	.session-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #f0f0f0;
	}

	.session-header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.session-label {
		font-size: 0.9375rem;
		font-weight: 700;
		color: #000;
	}

	.session-date {
		font-size: 0.8125rem;
		color: #999;
	}

	.chevron {
		color: #ccc;
		flex-shrink: 0;
	}

	.exercise-list {
		padding: 0;
	}

	.exercise-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 1rem;
		gap: 0.75rem;
	}

	.exercise-left {
		display: flex;
		flex-direction: column;
		gap: 0.1875rem;
		min-width: 0;
	}

	.exercise-name {
		font-size: 0.9375rem;
		font-weight: 500;
		color: #000;
	}

	.pr-badge {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: #000;
		color: #fff;
		padding: 0.1875rem 0.5rem;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.comparison {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
	}

	.previous {
		color: #bbb;
	}

	.arrow {
		color: #ddd;
		font-size: 0.75rem;
	}

	.current {
		color: #666;
		font-weight: 600;
	}

	.current.improved {
		color: #2e7d32;
	}

	.divider {
		height: 1px;
		background: #f0f0f0;
		margin: 0 1rem;
	}
</style>

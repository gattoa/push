<script lang="ts">
	import type { CalendarDay } from '$lib/mock/profile';
	import { convertWeight } from '$lib/mock/profile';

	let { day, units }: {
		day: CalendarDay;
		units: 'lbs' | 'kg';
	} = $props();

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${days[day.dayOfWeek]} ${months[d.getMonth()]} ${d.getDate()}`;
	}

	function formatSet(weight: number | null, reps: number | null): string {
		if (weight === null || weight === 0) {
			return reps !== null ? `BW×${reps}` : '—';
		}
		const w = convertWeight(weight, units);
		return reps !== null ? `${w}×${reps}` : `${w}`;
	}
</script>

<div class="detail card">
	<div class="detail-header">
		<span class="detail-date">{formatDate(day.date)}</span>
		{#if !day.isRestDay && !day.isReviewDay}
			<span class="detail-label">· {day.label}</span>
		{/if}
	</div>

	{#if day.isRestDay}
		<p class="detail-message">Rest Day</p>
	{:else if day.isReviewDay}
		<p class="detail-message">Review Day</p>
	{:else if day.exercises.length === 0}
		<p class="detail-message">No exercises logged</p>
	{:else}
		<div class="exercise-list">
			{#each day.exercises as ex, i (ex.exercisedbId)}
				{#if i > 0}<div class="divider"></div>{/if}
				<div class="exercise-row">
					<div class="exercise-header">
						<a href="/exercise/{ex.exercisedbId}" class="exercise-name">
							{ex.exerciseName}
						</a>
						{#if ex.allCompleted}
							<span class="check">✓</span>
						{/if}
					</div>
					{#if ex.sets.length > 0}
						<div class="sets">
							{#each ex.sets as s, j}
								<span class="set" class:incomplete={!s.completed}>
									{#if j > 0}<span class="set-sep"> </span>{/if}
									{formatSet(s.weight, s.reps)}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.detail {
		padding: 0;
		overflow: hidden;
	}

	.detail-header {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #f0f0f0;
	}

	.detail-date {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #000;
	}

	.detail-label {
		font-size: 0.9375rem;
		color: #666;
	}

	.detail-message {
		padding: 1rem;
		color: #999;
		font-size: 0.875rem;
		margin: 0;
		text-align: center;
	}

	.exercise-list {
		padding: 0;
	}

	.exercise-row {
		padding: 0.625rem 1rem;
	}

	.exercise-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.exercise-name {
		font-size: 0.9375rem;
		font-weight: 500;
		color: #000;
		text-decoration: none;
	}

	.exercise-name:hover {
		text-decoration: underline;
	}

	.check {
		font-size: 0.8125rem;
		color: #000;
		font-weight: 600;
	}

	.sets {
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: #666;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.set.incomplete {
		color: #bbb;
	}

	.set-sep {
		display: none;
	}

	.divider {
		height: 1px;
		background: #f0f0f0;
		margin: 0 1rem;
	}
</style>

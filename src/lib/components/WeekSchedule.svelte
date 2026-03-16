<script lang="ts">
	import type { WeekMomentum } from '$lib/mock/profile';
	import { getTodayIndex } from '$lib/mock/workouts';

	let { momentum }: {
		momentum: WeekMomentum;
	} = $props();

	const todayIndex = getTodayIndex();

	const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	function computeDayIso(dayOfWeek: number): string {
		const d = new Date(momentum.weekStart + 'T00:00:00');
		d.setDate(d.getDate() + dayOfWeek);
		return d.toISOString().split('T')[0];
	}

	function computeDayDate(dayOfWeek: number): string {
		const d = new Date(momentum.weekStart + 'T00:00:00');
		d.setDate(d.getDate() + dayOfWeek);
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${months[d.getMonth()]} ${d.getDate()}`;
	}

	function dayState(day: typeof momentum.dayCompletions[0], index: number): string {
		const hasWorkout = day.exerciseNames.length > 0 && !day.isRestDay;
		if (day.completed && index === todayIndex) return 'completed-today';
		if (day.completed) return 'completed';
		if (index === todayIndex) return 'today';
		if (day.isRestDay || !hasWorkout) return 'rest';
		if (index < todayIndex) return 'missed';
		return 'future';
	}
</script>

<div class="week-schedule">
	{#each momentum.dayCompletions as day, i}
		{@const state = dayState(day, i)}
		{@const iso = computeDayIso(day.dayOfWeek)}
		{@const dateStr = computeDayDate(day.dayOfWeek)}
		<a href="/session/{iso}" class="day-row {state}">
			<div class="day-header">
				<div class="day-label-group">
					<span class="day-name">{DAY_LABELS[i]}</span>
					<span class="day-date">{dateStr}</span>
				</div>
				<div class="day-meta">
					{#if day.completed}
						<svg class="check-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
							<polyline points="3,8 6.5,11.5 13,4.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					{/if}
					<span class="split-label">{day.label}</span>
				</div>
			</div>
			{#if !day.isRestDay && day.exerciseNames.length > 0}
				<div class="exercise-list">
					{#each day.exerciseNames as name}
						<span class="exercise-name">{name}</span>
					{/each}
				</div>
			{/if}
		</a>
	{/each}
</div>

<style>
	.week-schedule {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.day-row {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.75rem 1rem;
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 10px;
		text-decoration: none;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
	}

	.day-row:active {
		transform: scale(0.99);
	}

	.day-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.day-label-group {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.day-name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #000;
	}

	.day-date {
		font-size: 0.75rem;
		color: #999;
		font-weight: 500;
	}

	.day-meta {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.split-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.check-icon {
		color: #000;
	}

	.exercise-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.5rem;
	}

	.exercise-name {
		font-size: 0.8125rem;
		color: #666;
	}

	.exercise-name:not(:last-child)::after {
		content: ' ·';
		color: #ccc;
	}

	/* === Day States === */

	/* Completed */
	.day-row.completed,
	.day-row.completed-today {
		background: #000;
		border-color: #000;
	}

	.day-row.completed .day-name,
	.day-row.completed-today .day-name {
		color: #fff;
	}

	.day-row.completed .day-date,
	.day-row.completed-today .day-date {
		color: rgba(255, 255, 255, 0.5);
	}

	.day-row.completed .split-label,
	.day-row.completed-today .split-label {
		color: rgba(255, 255, 255, 0.5);
	}

	.day-row.completed .check-icon,
	.day-row.completed-today .check-icon {
		color: #fff;
	}

	.day-row.completed .exercise-name,
	.day-row.completed-today .exercise-name {
		color: rgba(255, 255, 255, 0.5);
	}

	.day-row.completed .exercise-name::after,
	.day-row.completed-today .exercise-name::after {
		color: rgba(255, 255, 255, 0.25);
	}

	/* Today (not completed) */
	.day-row.today {
		border-color: #000;
		border-width: 2px;
	}

	.day-row.completed-today {
		border-width: 2px;
	}

	/* Future */
	.day-row.future .day-name {
		color: #999;
	}

	.day-row.future .exercise-name {
		color: #bbb;
	}

	/* Missed */
	.day-row.missed {
		border-style: dashed;
		border-color: #ddd;
	}

	.day-row.missed .day-name {
		color: #ccc;
	}

	.day-row.missed .day-date {
		color: #ddd;
	}

	.day-row.missed .split-label {
		color: #ddd;
	}

	.day-row.missed .exercise-name {
		color: #ccc;
	}

	/* Rest */
	.day-row.rest {
		background: #fafafa;
		border-color: #f0f0f0;
		padding: 0.625rem 1rem;
	}

	.day-row.rest .day-name {
		color: #ccc;
	}

	.day-row.rest .day-date {
		color: #ddd;
	}

	.day-row.rest .split-label {
		color: #ddd;
	}
</style>

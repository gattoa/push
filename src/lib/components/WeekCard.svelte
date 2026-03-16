<script lang="ts">
	import type { WeekMomentum } from '$lib/types';
	import { getTodayIndex } from '$lib/utils/date';

	let { momentum }: {
		momentum: WeekMomentum;
	} = $props();

	const todayIndex = getTodayIndex();

	const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	function computeDayDate(dayOfWeek: number): { date: number; month: string } {
		const d = new Date(momentum.weekStart + 'T00:00:00');
		d.setDate(d.getDate() + dayOfWeek);
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return { date: d.getDate(), month: months[d.getMonth()] };
	}

	function computeDayIso(dayOfWeek: number): string {
		const d = new Date(momentum.weekStart + 'T00:00:00');
		d.setDate(d.getDate() + dayOfWeek);
		return d.toISOString().split('T')[0];
	}

	function dayState(day: typeof momentum.dayCompletions[0], index: number): string {
		const hasWorkout = day.exerciseNames.length > 0 && !day.isRestDay;
		if (day.completed && index === todayIndex) return 'completed-today';
		if (day.completed) return 'completed';
		if (index === todayIndex) return 'today';
		if (day.isRestDay || (!hasWorkout)) return 'rest';
		if (index < todayIndex) return 'missed';
		return 'future';
	}


</script>

<div class="week-card">
	<!-- Streak in header if present -->
	{#if momentum.streak > 0}
		<div class="week-header">
			<span class="streak-badge">{momentum.streak} {momentum.streak === 1 ? 'day' : 'days'} strong</span>
		</div>
	{/if}

	<!-- Calendar-style day tiles -->
	<div class="day-row">
		{#each momentum.dayCompletions as day, i}
			{@const state = dayState(day, i)}
			{@const iso = computeDayIso(day.dayOfWeek)}
			{@const dateInfo = computeDayDate(day.dayOfWeek)}
			<a href="/session/{iso}" class="day-tile {state}">
				<span class="day-name">{DAY_LABELS[i]}</span>
				<div class="tile-body">
					<span class="day-date">{dateInfo.date}</span>
					<!-- Status icon -->
					{#if day.completed}
						<svg class="tile-icon" width="10" height="10" viewBox="0 0 16 16" fill="none">
							<polyline points="3,8 6.5,11.5 13,4.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					{:else if state === 'rest'}
						<svg class="tile-icon" width="12" height="2" viewBox="0 0 12 2">
							<line x1="0" y1="1" x2="12" y2="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						</svg>
					{/if}
					<!-- Label: split name or Rest -->
					{#if day.exerciseNames.length > 0 && !day.isRestDay}
						<span class="split-label">{day.label}</span>
					{:else}
						<span class="split-label muted-label">Rest</span>
					{/if}
				</div>
			</a>
		{/each}
	</div>

</div>

<style>
	.week-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.week-header {
		display: flex;
		align-items: center;
	}

	.streak-badge {
		font-size: 0.75rem;
		font-weight: 600;
		color: #999;
	}

	/* Day row — 7 equal tiles */
	.day-row {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.375rem;
	}

	/* Each tile */
	.day-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		text-decoration: none;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
	}

	.day-tile:active .tile-body {
		transform: scale(0.95);
	}

	.day-name {
		font-size: 0.6875rem;
		font-weight: 600;
		color: #bbb;
	}

	/* The rectangular chiclet */
	.tile-body {
		width: 100%;
		aspect-ratio: 1 / 1.15;
		border: 1px solid #e8e8e8;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.125rem;
		background: #fff;
		transition: transform 0.1s ease;
	}

	.day-date {
		font-size: 0.9375rem;
		font-weight: 700;
		color: #000;
	}

	.split-label {
		font-size: 0.5625rem;
		font-weight: 500;
		color: #999;
		line-height: 1;
	}

	.muted-label {
		color: #ccc;
	}

	.tile-icon {
		color: #000;
	}

	/* === Tile states === */

	/* Completed */
	.day-tile.completed .tile-body,
	.day-tile.completed-today .tile-body {
		background: #000;
		border-color: #000;
	}

	.day-tile.completed .day-date,
	.day-tile.completed-today .day-date {
		color: #fff;
	}

	.day-tile.completed .split-label,
	.day-tile.completed-today .split-label {
		color: rgba(255, 255, 255, 0.6);
	}

	.day-tile.completed .tile-icon,
	.day-tile.completed-today .tile-icon {
		color: #fff;
	}

	/* Today (not done) */
	.day-tile.today .day-name {
		color: #000;
	}

	.day-tile.today .tile-body {
		border-color: #000;
		border-width: 2px;
	}

	/* Completed today — same as completed but with today's day label bold */
	.day-tile.completed-today .day-name {
		color: #000;
	}

	/* Future */
	.day-tile.future .day-date {
		color: #999;
	}

	/* Missed */
	.day-tile.missed .tile-body {
		border-style: dashed;
		border-color: #ddd;
	}

	.day-tile.missed .day-date {
		color: #ccc;
	}

	.day-tile.missed .split-label {
		color: #ccc;
	}

	/* Rest */
	.day-tile.rest .tile-body {
		background: #fafafa;
		border-color: #f0f0f0;
	}

	.day-tile.rest .day-date {
		color: #ccc;
	}

</style>

<script lang="ts">
	import type { CalendarWeek, CalendarDay } from '$lib/mock/profile';

	let { weeks, selectedDay, onSelectDay }: {
		weeks: CalendarWeek[];
		selectedDay: CalendarDay | null;
		onSelectDay: (day: CalendarDay | null) => void;
	} = $props();

	const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

	const currentWeek = $derived(weeks.find(w => w.isCurrent) ?? weeks[weeks.length - 1]);
	const previousWeek = $derived(weeks.length >= 2 ? weeks[weeks.findIndex(w => w.isCurrent) - 1] ?? null : null);

	function indicator(day: CalendarDay): string {
		if (day.isReviewDay) return 'R';
		if (day.isRestDay) return '·';
		if (day.isCompleted) return '●';
		return '○';
	}

	function formatWeekRange(weekStart: string): string {
		const start = new Date(weekStart + 'T00:00:00');
		const end = new Date(start);
		end.setDate(end.getDate() + 6);
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}`;
	}

	function isSelected(day: CalendarDay): boolean {
		return selectedDay !== null && selectedDay.date === day.date;
	}

	function handleDayClick(day: CalendarDay) {
		if (isSelected(day)) {
			onSelectDay(null);
		} else {
			onSelectDay(day);
		}
	}
</script>

<div class="week-progress card">
	<!-- Current Week -->
	<div class="week-section">
		<div class="week-label-row">
			<span class="week-label">This Week</span>
			<span class="week-range">{formatWeekRange(currentWeek.weekStart)}</span>
		</div>
		<div class="day-headers">
			{#each DAY_LABELS as label}
				<span class="day-header">{label}</span>
			{/each}
		</div>
		<div class="day-row">
			{#each currentWeek.days as day (day.date)}
				<button
					class="day-cell"
					class:selected={isSelected(day)}
					class:completed={day.isCompleted}
					class:rest={day.isRestDay}
					class:review={day.isReviewDay}
					onclick={() => handleDayClick(day)}
				>
					<span class="indicator">{indicator(day)}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Previous Week -->
	{#if previousWeek}
		<div class="divider"></div>
		<div class="week-section previous">
			<div class="week-label-row">
				<span class="week-label">Last Week</span>
				<span class="week-range">{formatWeekRange(previousWeek.weekStart)}</span>
			</div>
			<div class="day-row">
				{#each previousWeek.days as day (day.date)}
					<button
						class="day-cell"
						class:selected={isSelected(day)}
						class:completed={day.isCompleted}
						class:rest={day.isRestDay}
						class:review={day.isReviewDay}
						onclick={() => handleDayClick(day)}
					>
						<span class="indicator">{indicator(day)}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.week-progress {
		padding: 0;
		overflow: hidden;
	}

	.week-section {
		padding: 0.75rem 1rem;
	}

	.week-section.previous {
		opacity: 0.6;
	}

	.week-label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.week-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #000;
	}

	.week-range {
		font-size: 0.6875rem;
		color: #999;
	}

	.day-headers {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		margin-bottom: 0.25rem;
	}

	.day-header {
		text-align: center;
		font-size: 0.6875rem;
		font-weight: 600;
		color: #999;
	}

	.day-row {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}

	.day-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 36px;
		background: none;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		padding: 0;
		font-family: inherit;
	}

	.day-cell:hover {
		background: #f8f8f8;
	}

	.day-cell.selected {
		background: #f0f0f0;
	}

	.indicator {
		font-size: 0.875rem;
		color: #ccc;
	}

	.day-cell.completed .indicator {
		color: #000;
	}

	.day-cell.rest .indicator,
	.day-cell.review .indicator {
		font-size: 0.75rem;
		color: #ccc;
	}

	.divider {
		height: 1px;
		background: #f0f0f0;
		margin: 0 1rem;
	}
</style>

<script lang="ts">
	import type { CalendarDay, CalendarWeek } from '$lib/mock/profile';

	const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

	let {
		weeks,
		selectedDay = null,
		onSelectDay
	}: {
		weeks: CalendarWeek[];
		selectedDay: CalendarDay | null;
		onSelectDay: (day: CalendarDay | null) => void;
	} = $props();

	function handleDayClick(day: CalendarDay) {
		if (selectedDay && selectedDay.date === day.date) {
			onSelectDay(null);
		} else {
			onSelectDay(day);
		}
	}

	function isSelected(day: CalendarDay): boolean {
		return selectedDay !== null && selectedDay.date === day.date;
	}
</script>

<div class="calendar card">
	<div class="calendar-header">
		{#each DAY_LABELS as label}
			<span class="day-label">{label}</span>
		{/each}
	</div>

	{#each weeks as week (week.weekStart)}
		<div class="calendar-row" class:current={week.isCurrent}>
			{#each week.days as day (day.date)}
				<button
					class="day-cell"
					class:selected={isSelected(day)}
					onclick={() => handleDayClick(day)}
				>
					{#if day.isRestDay}
						<span class="indicator rest">·</span>
					{:else if day.isCompleted}
						<span class="indicator completed">●</span>
					{:else if day.exercises.length > 0}
						<span class="indicator missed">○</span>
					{:else}
						<span class="indicator rest">·</span>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
</div>

<style>
	.calendar {
		padding: 0.75rem;
	}

	.calendar-header {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		margin-bottom: 0.25rem;
	}

	.day-label {
		text-align: center;
		font-size: 0.6875rem;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.25rem 0;
	}

	.calendar-row {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		border-left: 2px solid transparent;
		margin-left: -0.75rem;
		padding-left: calc(0.75rem - 2px);
	}

	.calendar-row.current {
		border-left-color: #000;
	}

	.day-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		border-radius: 8px;
		transition: background 0.1s;
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
		line-height: 1;
	}

	.indicator.completed {
		color: #000;
	}

	.indicator.missed {
		color: #ccc;
	}

	.indicator.rest {
		color: #ddd;
		font-size: 1.25rem;
	}

</style>

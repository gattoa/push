<script lang="ts">
	import type { PlannedDay } from '$lib/types';

	let { currentDayIndex, days }: {
		currentDayIndex: number;
		days: PlannedDay[];
	} = $props();

	const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

	const trainingDays = $derived(days.filter(d => !d.is_rest_day && !d.is_review_day));
	const pastTrainingDays = $derived(trainingDays.filter(d => d.day_of_week < currentDayIndex));
</script>

<div class="week-summary">
	<span class="summary-text">{pastTrainingDays.length} of {trainingDays.length} training days</span>
	<div class="day-dots">
		{#each days as day}
			{@const isRest = day.is_rest_day || day.is_review_day}
			{@const isPast = day.day_of_week < currentDayIndex}
			{@const isCurrent = day.day_of_week === currentDayIndex}
			<div class="day-dot" class:rest={isRest} class:past={isPast && !isRest} class:current={isCurrent && !isRest} class:future={!isPast && !isCurrent && !isRest}>
				<span class="dot-letter">{DAY_LETTERS[day.day_of_week]}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.week-summary {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 0;
	}

	.summary-text {
		font-size: 0.75rem;
		font-weight: 500;
		color: #999;
	}

	.day-dots {
		display: flex;
		gap: 0.375rem;
	}

	.day-dot {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dot-letter {
		font-size: 0.6875rem;
		font-weight: 600;
	}

	.day-dot.rest {
		background: none;
	}

	.day-dot.rest .dot-letter {
		color: #ddd;
	}

	.day-dot.past {
		background: #000;
	}

	.day-dot.past .dot-letter {
		color: #fff;
	}

	.day-dot.current {
		background: #f0f0f0;
		border: 1.5px solid #000;
	}

	.day-dot.current .dot-letter {
		color: #000;
	}

	.day-dot.future {
		background: #f0f0f0;
	}

	.day-dot.future .dot-letter {
		color: #999;
	}
</style>

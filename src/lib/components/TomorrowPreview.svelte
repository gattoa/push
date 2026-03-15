<script lang="ts">
	import type { PlannedDay, PlannedExercise, PlannedSet } from '$lib/types';

	let { currentDayIndex, days, exercises, plannedSets }: {
		currentDayIndex: number;
		days: PlannedDay[];
		exercises: PlannedExercise[];
		plannedSets: PlannedSet[];
	} = $props();

	const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	// Find the next training day after currentDayIndex (wraps around)
	const nextTrainingDay = $derived(() => {
		for (let offset = 1; offset <= 7; offset++) {
			const idx = (currentDayIndex + offset) % 7;
			const day = days[idx];
			if (day && !day.is_rest_day && !day.is_review_day) return day;
		}
		return null;
	});

	const nextDay = $derived(nextTrainingDay());

	const nextDayExercises = $derived(
		nextDay ? exercises.filter(e => e.planned_day_id === nextDay.id) : []
	);

	const nextDaySets = $derived(
		plannedSets.filter(s => nextDayExercises.some(e => e.id === s.planned_exercise_id))
	);

	const nextDayBodyParts = $derived(
		[...new Set(nextDayExercises.flatMap(e => e.body_parts))]
	);

	const nextDayName = $derived(
		nextDay ? DAY_NAMES[nextDay.day_of_week] : ''
	);
</script>

{#if nextDay}
	<div class="preview-card">
		<span class="preview-label">Up next</span>
		<div class="preview-header">
			<span class="day-name">{nextDayName}</span>
			<span class="day-label">{nextDay.label}</span>
		</div>
		{#if nextDayBodyParts.length > 0}
			<div class="body-parts">
				{#each nextDayBodyParts as part}
					<span class="chip">{part.toLowerCase()}</span>
				{/each}
			</div>
		{/if}
		<span class="preview-meta">{nextDayExercises.length} exercises · {nextDaySets.length} sets</span>
	</div>
{/if}

<style>
	.preview-card {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 14px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.preview-label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #bbb;
	}

	.preview-header {
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
	}

	.day-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: #999;
	}

	.day-label {
		font-size: 1.125rem;
		font-weight: 700;
		color: #000;
	}

	.body-parts {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.chip {
		font-size: 0.625rem;
		font-weight: 600;
		color: #777;
		background: #f2f2f2;
		padding: 0.125rem 0.5rem;
		border-radius: 100px;
	}

	.preview-meta {
		font-size: 0.75rem;
		color: #999;
		font-weight: 500;
	}
</style>

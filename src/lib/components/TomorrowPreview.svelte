<script lang="ts">
	import type { PlannedDay, PlannedExercise, PlannedSet } from '$lib/types';

	let { currentDayIndex, days, exercises, plannedSets }: {
		currentDayIndex: number;
		days: PlannedDay[];
		exercises: PlannedExercise[];
		plannedSets: PlannedSet[];
	} = $props();

	const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
	<div class="next-card">
		<span class="next-when">{nextDayName}</span>
		<span class="next-title">{nextDay.label}</span>
		<span class="next-detail">
			{nextDayExercises.length} exercises · {nextDaySets.length} sets
			{#if nextDayBodyParts.length > 0}
				· {nextDayBodyParts.map(p => p.toLowerCase()).join(', ')}
			{/if}
		</span>
	</div>
{/if}

<style>
	.next-card {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 14px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.next-when {
		font-size: 0.75rem;
		font-weight: 500;
		color: #999;
	}

	.next-title {
		font-size: 1.25rem;
		font-weight: 800;
		color: #000;
		letter-spacing: -0.02em;
	}

	.next-detail {
		font-size: 0.75rem;
		color: #999;
		font-weight: 500;
	}
</style>

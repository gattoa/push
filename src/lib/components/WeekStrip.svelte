<script lang="ts">
	import type { PlannedDay } from '$lib/types';
	import { getDayName, getTodayIndex } from '$lib/mock/workouts';

	let { days, selectedDayIndex = $bindable(0) }: {
		days: PlannedDay[];
		selectedDayIndex: number;
	} = $props();

	const todayIndex = getTodayIndex();
</script>

<nav>
	{#each days as day, i (day.id)}
		<button
			onclick={() => selectedDayIndex = i}
			style={selectedDayIndex === i ? 'font-weight:bold' : ''}
		>
			{getDayName(day.day_of_week)} - {day.label}
			{#if i === todayIndex}(today){/if}
		</button>
	{/each}
</nav>

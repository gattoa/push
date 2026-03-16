<script lang="ts">
	import WeekSchedule from '$lib/components/WeekSchedule.svelte';
	import { computeWeekMomentum } from '$lib/mock/profile';
	import { getTodayIndex } from '$lib/mock/workouts';
	import { mockWeekHistories } from '$lib/mock/profile-history';

	const momentum = $derived(computeWeekMomentum(mockWeekHistories, getTodayIndex()));
</script>

<div class="plan">
	<h1>This Week</h1>
	<WeekSchedule {momentum} />
</div>

<style>
	.plan {
		max-width: 480px;
		margin: 0 auto;
		padding: 0 1rem 6rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0.5rem 0 0;
		text-align: center;
	}
</style>

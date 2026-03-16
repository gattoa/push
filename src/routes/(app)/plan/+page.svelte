<script lang="ts">
	import { onMount } from 'svelte';
	import WeekSchedule from '$lib/components/WeekSchedule.svelte';
	import { computeWeekMomentum } from '$lib/utils/workout-stats';
	import { getTodayIndex } from '$lib/utils/date';
	import { getWeekHistories } from '$lib/services/history';
	import type { WeekHistory, WeekMomentum } from '$lib/types';

	let momentum: WeekMomentum | null = $state(null);

	onMount(() => {
		const histories = getWeekHistories();
		momentum = computeWeekMomentum(histories, getTodayIndex());
	});
</script>

{#if momentum}
<div class="plan">
	<h1>This Week</h1>
	<WeekSchedule {momentum} />
</div>
{:else}
<p style="padding:1rem;color:red;font-size:12px;">loading...</p>
{/if}

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

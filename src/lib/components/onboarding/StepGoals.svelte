<script lang="ts">
	import type { TrainingGoal } from '$lib/types';
	import SelectionCard from './SelectionCard.svelte';

	let { values = $bindable() } = $props<{ values: TrainingGoal[] }>();

	const options: { goal: TrainingGoal; label: string; subtitle: string }[] = [
		{ goal: 'build_muscle', label: 'Build Muscle', subtitle: 'Hypertrophy-focused training' },
		{ goal: 'lose_fat', label: 'Lose Fat', subtitle: 'Higher reps, metabolic work' },
		{ goal: 'get_stronger', label: 'Get Stronger', subtitle: 'Strength and power focus' },
		{ goal: 'general_fitness', label: 'General Fitness', subtitle: 'Balanced programming' }
	];

	function toggle(goal: TrainingGoal) {
		if (values.includes(goal)) {
			values = values.filter((g: TrainingGoal) => g !== goal);
		} else {
			values = [...values, goal];
		}
	}
</script>

<div class="step">
	<h2>What are your goals?</h2>
	<p class="hint">Select one or more</p>
	<div class="options">
		{#each options as opt}
			<SelectionCard
				label={opt.label}
				subtitle={opt.subtitle}
				selected={values.includes(opt.goal)}
				onclick={() => toggle(opt.goal)}
			/>
		{/each}
	</div>
</div>

<style>
	.step {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 700;
		text-align: center;
		margin: 0;
	}

	.hint {
		text-align: center;
		color: #888;
		font-size: 0.875rem;
		margin: -0.5rem 0 0;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
</style>

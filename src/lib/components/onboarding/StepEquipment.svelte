<script lang="ts">
	import type { Equipment } from '$lib/types';
	import SelectionCard from './SelectionCard.svelte';

	let { values = $bindable() } = $props<{ values: Equipment[] }>();

	const options: { value: Equipment; label: string; subtitle: string }[] = [
		{ value: 'bodyweight', label: 'Bodyweight Only', subtitle: 'No equipment' },
		{ value: 'dumbbells', label: 'Dumbbells', subtitle: 'Adjustable or fixed' },
		{ value: 'barbell', label: 'Barbell & Rack', subtitle: 'Bench, squat rack' },
		{ value: 'cable_machine', label: 'Cable Machine', subtitle: 'Pulley system' },
		{ value: 'full_gym', label: 'Full Gym', subtitle: 'All of the above' }
	];

	function toggle(eq: Equipment) {
		if (eq === 'full_gym') {
			// Full gym selects everything
			if (values.includes('full_gym')) {
				values = [];
			} else {
				values = ['bodyweight', 'dumbbells', 'barbell', 'cable_machine', 'full_gym'];
			}
			return;
		}

		// Deselect full_gym when toggling individual items
		if (values.includes(eq)) {
			values = values.filter((v: Equipment) => v !== eq && v !== 'full_gym');
		} else {
			const next = [...values.filter((v: Equipment) => v !== 'full_gym'), eq];
			// Auto-select full_gym if all individual items are selected
			if (['bodyweight', 'dumbbells', 'barbell', 'cable_machine'].every(e => next.includes(e as Equipment))) {
				values = [...next, 'full_gym'];
			} else {
				values = next;
			}
		}
	}
</script>

<div class="step">
	<h2>What equipment do you have?</h2>
	<p class="hint">Select all that apply</p>
	<div class="options">
		{#each options as opt}
			<SelectionCard
				label={opt.label}
				subtitle={opt.subtitle}
				selected={values.includes(opt.value)}
				onclick={() => toggle(opt.value)}
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
		font-size: 0.8125rem;
		color: #999;
		margin: -0.5rem 0 0;
	}

	.options {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
</style>

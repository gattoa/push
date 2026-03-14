<script lang="ts">
	import type { InjuryArea } from '$lib/types';
	import SelectionCard from './SelectionCard.svelte';

	let { values = $bindable() } = $props<{ values: InjuryArea[] }>();

	const injuries: { area: InjuryArea; label: string; subtitle: string }[] = [
		{ area: 'shoulder', label: 'Shoulder', subtitle: 'No overhead pressing' },
		{ area: 'back', label: 'Back', subtitle: 'No loaded spinal flexion' },
		{ area: 'knee', label: 'Knee', subtitle: 'Limited range of motion' }
	];

	let hasNone = $derived(values.length === 0);

	function selectNone() {
		values = [];
	}

	function toggle(area: InjuryArea) {
		if (values.includes(area)) {
			values = values.filter((a: InjuryArea) => a !== area);
		} else {
			values = [...values, area];
		}
	}
</script>

<div class="step">
	<h2>Any injuries or limitations?</h2>
	<div class="options">
		<SelectionCard
			label="None"
			subtitle="No current injuries"
			selected={hasNone}
			onclick={selectNone}
		/>
		{#each injuries as inj}
			<SelectionCard
				label={inj.label}
				subtitle={inj.subtitle}
				selected={values.includes(inj.area)}
				onclick={() => toggle(inj.area)}
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

	.options {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
</style>

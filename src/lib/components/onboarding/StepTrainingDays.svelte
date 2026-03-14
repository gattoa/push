<script lang="ts">
	import SelectionCard from './SelectionCard.svelte';

	let { value = $bindable() } = $props<{ value: number | null }>();

	const options = [
		{ days: 3, subtitle: 'Great for beginners' },
		{ days: 4, subtitle: 'Balanced split' },
		{ days: 5, subtitle: 'Intermediate volume' },
		{ days: 6, subtitle: 'High frequency' }
	];
</script>

<div class="step">
	<h2>How many days per week?</h2>
	<div class="options">
		{#each options as opt}
			<SelectionCard
				label="{opt.days} days"
				subtitle={opt.subtitle}
				selected={value === opt.days}
				onclick={() => (value = opt.days)}
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
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
</style>

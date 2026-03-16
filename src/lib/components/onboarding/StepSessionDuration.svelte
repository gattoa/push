<script lang="ts">
	import type { SessionDuration } from '$lib/types';
	import SelectionCard from './SelectionCard.svelte';

	let { value = $bindable() } = $props<{ value: SessionDuration | null }>();

	const options: { duration: SessionDuration; label: string; subtitle: string }[] = [
		{ duration: 30, label: '30 min', subtitle: 'Quick session' },
		{ duration: 45, label: '45 min', subtitle: 'Focused' },
		{ duration: 60, label: '60 min', subtitle: 'Standard' },
		{ duration: 75, label: '75 min', subtitle: 'Thorough' },
		{ duration: 90, label: '90 min', subtitle: 'Extended' }
	];
</script>

<div class="step">
	<h2>How long per session?</h2>
	<p class="hint">Including warmup and rest between sets</p>
	<div class="options">
		{#each options as opt}
			<SelectionCard
				label={opt.label}
				subtitle={opt.subtitle}
				selected={value === opt.duration}
				onclick={() => (value = opt.duration)}
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

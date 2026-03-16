<script lang="ts">
	import type { ExperienceLevel } from '$lib/types';
	import SelectionCard from './SelectionCard.svelte';

	let { value = $bindable() } = $props<{ value: ExperienceLevel | null }>();

	const options: { level: ExperienceLevel; label: string; subtitle: string }[] = [
		{ level: 'beginner', label: 'Beginner', subtitle: 'Learning the basics and building form' },
		{ level: 'intermediate', label: 'Intermediate', subtitle: 'Confident with compound lifts' },
		{ level: 'advanced', label: 'Advanced', subtitle: 'Strong foundation, ready for heavier loads' }
	];
</script>

<div class="step">
	<h2>What's your experience level?</h2>
	<div class="options">
		{#each options as opt}
			<SelectionCard
				label={opt.label}
				subtitle={opt.subtitle}
				selected={value === opt.level}
				onclick={() => (value = opt.level)}
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
		gap: 0.5rem;
	}
</style>

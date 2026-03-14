<script lang="ts">
	import type { AgeRange, ExperienceLevel } from '$lib/types';
	import SelectionCard from './SelectionCard.svelte';

	let { ageRange = $bindable(), experienceLevel = $bindable() } = $props<{
		ageRange: AgeRange | null;
		experienceLevel: ExperienceLevel | null;
	}>();

	const ageOptions: { value: AgeRange; label: string }[] = [
		{ value: 'under_35', label: '18–34' },
		{ value: '35_50', label: '35–50' },
		{ value: '50_plus', label: '51+' }
	];

	const experienceOptions: { level: ExperienceLevel; label: string; subtitle: string }[] = [
		{ level: 'beginner', label: 'Beginner', subtitle: 'Learning the basics and building form' },
		{ level: 'intermediate', label: 'Intermediate', subtitle: 'Confident with compound lifts' },
		{ level: 'advanced', label: 'Advanced', subtitle: 'Strong foundation, ready for heavier loads' }
	];
</script>

<div class="step">
	<h2>About You</h2>

	<div class="section">
		<p class="label">Experience level</p>
		<div class="experience-options">
			{#each experienceOptions as opt}
				<SelectionCard
					label={opt.label}
					subtitle={opt.subtitle}
					selected={experienceLevel === opt.level}
					onclick={() => (experienceLevel = opt.level)}
				/>
			{/each}
		</div>
	</div>

	<div class="section">
		<p class="label">Age range</p>
		<div class="age-options">
			{#each ageOptions as opt}
				<SelectionCard
					label={opt.label}
					selected={ageRange === opt.value}
					onclick={() => (ageRange = opt.value)}
				/>
			{/each}
		</div>
	</div>
</div>

<style>
	.step {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 700;
		text-align: center;
		margin: 0;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #888;
		margin: 0;
	}

	.age-options {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.experience-options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>

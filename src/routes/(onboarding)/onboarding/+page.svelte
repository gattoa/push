<script lang="ts">
	import { goto } from '$app/navigation';
	import type { OnboardingData } from '$lib/types';
	import { generateMockPlan } from '$lib/mock/plan-generator';
	import ProgressBar from '$lib/components/onboarding/ProgressBar.svelte';
	import StepAboutYou from '$lib/components/onboarding/StepAboutYou.svelte';
	import StepTrainingDays from '$lib/components/onboarding/StepTrainingDays.svelte';
	import StepGoals from '$lib/components/onboarding/StepGoals.svelte';
	import StepInjuries from '$lib/components/onboarding/StepInjuries.svelte';
	import StepReview from '$lib/components/onboarding/StepReview.svelte';

	let currentStep = $state(0);
	let data: OnboardingData = $state({
		ageRange: null,
		experienceLevel: null,
		trainingDays: null,
		goals: [],
		injuries: []
	});

	const TOTAL_STEPS = 4;
	const REVIEW_STEP = TOTAL_STEPS;

	let canContinue = $derived(
		currentStep === 0
			? data.ageRange !== null && data.experienceLevel !== null
			: currentStep === 1
				? data.trainingDays !== null
				: currentStep === 2
					? data.goals.length > 0
					: currentStep === 3
						? true // injuries step is always valid
						: false
	);

	function next() {
		if (currentStep < TOTAL_STEPS - 1) {
			currentStep++;
		} else if (currentStep === TOTAL_STEPS - 1) {
			currentStep = REVIEW_STEP;
		}
	}

	function back() {
		if (currentStep > 0) {
			currentStep--;
		}
	}

	function generate() {
		generateMockPlan(data);
		localStorage.setItem('push_onboarding_complete', 'true');
		goto('/');
	}
</script>

<div class="onboarding">
	<div class="header">
		<h1 class="logo">Push</h1>
		{#if currentStep < REVIEW_STEP}
			<ProgressBar {currentStep} totalSteps={TOTAL_STEPS} />
		{/if}
	</div>

	<div class="content">
		{#key currentStep}
			{#if currentStep === 0}
				<StepAboutYou bind:ageRange={data.ageRange} bind:experienceLevel={data.experienceLevel} />
			{:else if currentStep === 1}
				<StepTrainingDays bind:value={data.trainingDays} />
			{:else if currentStep === 2}
				<StepGoals bind:values={data.goals} />
			{:else if currentStep === 3}
				<StepInjuries bind:values={data.injuries} />
			{:else if currentStep === REVIEW_STEP}
				<StepReview bind:data ongenerate={generate} />
			{/if}
		{/key}
	</div>

	{#if currentStep < REVIEW_STEP}
		<div class="actions">
			{#if currentStep > 0}
				<button class="back-btn" onclick={back}>Back</button>
			{:else}
				<div></div>
			{/if}
			<button class="continue-btn" disabled={!canContinue} onclick={next}>
				Continue
			</button>
		</div>
	{:else}
		<div class="actions">
			<button class="back-btn" onclick={back}>Back</button>
			<div></div>
		</div>
	{/if}
</div>

<style>
	.onboarding {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		max-width: 480px;
		margin: 0 auto;
		padding: 1.5rem;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.content {
		flex: 1;
	}

	.actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1.5rem;
		gap: 1rem;
	}

	.back-btn {
		padding: 0.75rem 1.5rem;
		background: none;
		border: 2px solid #e5e5e5;
		border-radius: 12px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		color: #888;
		font-family: inherit;
	}

	.back-btn:hover {
		border-color: #ccc;
		color: #000;
	}

	.continue-btn {
		padding: 0.75rem 1.5rem;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	.continue-btn:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.continue-btn:not(:disabled):hover {
		background: #222;
	}
</style>

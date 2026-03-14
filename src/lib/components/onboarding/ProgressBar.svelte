<script lang="ts">
	let { currentStep, totalSteps } = $props<{
		currentStep: number;
		totalSteps: number;
	}>();
</script>

<div class="progress">
	{#each Array(totalSteps) as _, i}
		<div class="dot" class:active={i <= currentStep}></div>
	{/each}
</div>

<style>
	.progress {
		display: flex;
		justify-content: center;
		gap: 8px;
		padding: 1rem 0;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #e5e5e5;
		transition: background 0.2s;
	}

	.dot.active {
		background: #000;
	}
</style>

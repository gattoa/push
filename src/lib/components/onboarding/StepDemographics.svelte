<script lang="ts">
	import type { Gender } from '$lib/types';
	import SelectionCard from './SelectionCard.svelte';

	let {
		dateOfBirth = $bindable(),
		gender = $bindable()
	} = $props<{
		dateOfBirth: string | null;
		gender: Gender | null;
	}>();

	const genderOptions: { value: Gender; label: string }[] = [
		{ value: 'male', label: 'Male' },
		{ value: 'female', label: 'Female' },
		{ value: 'prefer_not_to_say', label: 'Prefer not to say' }
	];
</script>

<div class="step">
	<h2>A bit about you</h2>

	<div class="section">
		<p class="label">Date of birth</p>
		<input
			type="date"
			class="dob-input"
			value={dateOfBirth ?? ''}
			onchange={(e) => (dateOfBirth = e.currentTarget.value || null)}
		/>
	</div>

	<div class="section">
		<p class="label">Gender</p>
		<div class="gender-options">
			{#each genderOptions as opt}
				<SelectionCard
					label={opt.label}
					selected={gender === opt.value}
					onclick={() => (gender = opt.value)}
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

	.gender-options {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.dob-input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px solid #e5e5e5;
		border-radius: 12px;
		font-size: 1rem;
		font-family: inherit;
		color: #000;
		background: #fff;
		outline: none;
		box-sizing: border-box;
	}

	.dob-input:focus {
		border-color: #000;
	}
</style>

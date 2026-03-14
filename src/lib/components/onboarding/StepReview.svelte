<script lang="ts">
	import type { OnboardingData, ExperienceLevel, Gender, TrainingGoal, InjuryArea } from '$lib/types';
	import SelectionCard from './SelectionCard.svelte';

	let { data = $bindable(), ongenerate } = $props<{
		data: OnboardingData;
		ongenerate: () => void;
	}>();

	let editing: string | null = $state(null);

	function toggle(section: string) {
		editing = editing === section ? null : section;
	}

	function computeAge(dob: string | null): number | null {
		if (!dob) return null;
		const birth = new Date(dob + 'T00:00:00');
		const today = new Date();
		let age = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
		return age;
	}

	const experienceLabels: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
	const genderLabels: Record<string, string> = { male: 'Male', female: 'Female', prefer_not_to_say: 'Prefer not to say' };
	const goalLabels: Record<string, string> = {
		build_muscle: 'Build Muscle',
		lose_fat: 'Lose Fat',
		get_stronger: 'Get Stronger',
		general_fitness: 'General Fitness'
	};
	const injuryLabels: Record<string, string> = { shoulder: 'Shoulder', back: 'Back', knee: 'Knee' };

	const experienceOptions: { value: ExperienceLevel; label: string }[] = [
		{ value: 'beginner', label: 'Beginner' },
		{ value: 'intermediate', label: 'Intermediate' },
		{ value: 'advanced', label: 'Advanced' }
	];

	const genderOptions: { value: Gender; label: string }[] = [
		{ value: 'male', label: 'Male' },
		{ value: 'female', label: 'Female' },
		{ value: 'prefer_not_to_say', label: 'Prefer not to say' }
	];

	const dayOptions = [3, 4, 5, 6];

	const goalOptions: { value: TrainingGoal; label: string }[] = [
		{ value: 'build_muscle', label: 'Build Muscle' },
		{ value: 'lose_fat', label: 'Lose Fat' },
		{ value: 'get_stronger', label: 'Get Stronger' },
		{ value: 'general_fitness', label: 'General Fitness' }
	];

	const injuryOptions: { value: InjuryArea; label: string }[] = [
		{ value: 'shoulder', label: 'Shoulder' },
		{ value: 'back', label: 'Back' },
		{ value: 'knee', label: 'Knee' }
	];

	function toggleGoal(goal: TrainingGoal) {
		if (data.goals.includes(goal)) {
			data.goals = data.goals.filter((g: TrainingGoal) => g !== goal);
		} else {
			data.goals = [...data.goals, goal];
		}
	}

	function toggleInjury(area: InjuryArea) {
		if (data.injuries.includes(area)) {
			data.injuries = data.injuries.filter((a: InjuryArea) => a !== area);
		} else {
			data.injuries = [...data.injuries, area];
		}
	}
</script>

<div class="step">
	<h2>Ready?</h2>
	<p class="subtitle">Tap any section to make changes</p>

	<div class="cards">
		<!-- About You -->
		<div class="card" class:expanded={editing === 'about'}>
			<button class="card-toggle" onclick={() => toggle('about')}>
				<div class="card-summary">
					<span class="card-label">Experience</span>
					<span class="card-value">{data.experienceLevel ? experienceLabels[data.experienceLevel] : '—'}</span>
					<span class="card-label">Age · Gender</span>
					<span class="card-value">{computeAge(data.dateOfBirth) ?? '—'} · {data.gender ? genderLabels[data.gender] : '—'}</span>
				</div>
				<span class="edit">{editing === 'about' ? 'Done' : 'Edit'}</span>
			</button>
			{#if editing === 'about'}
				<div class="inline-edit">
					<p class="edit-label">Experience level</p>
					<div class="edit-options-row">
						{#each experienceOptions as opt}
							<SelectionCard
								label={opt.label}
								selected={data.experienceLevel === opt.value}
								onclick={() => (data.experienceLevel = opt.value)}
							/>
						{/each}
					</div>
					<p class="edit-label">Date of birth</p>
					<input
						type="date"
						class="dob-input"
						value={data.dateOfBirth ?? ''}
						onchange={(e) => (data.dateOfBirth = e.currentTarget.value || null)}
					/>
					<p class="edit-label">Gender</p>
					<div class="edit-options-row">
						{#each genderOptions as opt}
							<SelectionCard
								label={opt.label}
								selected={data.gender === opt.value}
								onclick={() => (data.gender = opt.value)}
							/>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Training Days -->
		<div class="card" class:expanded={editing === 'days'}>
			<button class="card-toggle card-toggle-inline" onclick={() => toggle('days')}>
				<div class="card-summary-inline">
					<span class="card-label">Training days</span>
					<span class="card-value">{data.trainingDays ?? '—'} days/week</span>
				</div>
				<span class="edit">{editing === 'days' ? 'Done' : 'Edit'}</span>
			</button>
			{#if editing === 'days'}
				<div class="inline-edit">
					<div class="edit-options-row">
						{#each dayOptions as d}
							<SelectionCard
								label="{d} days"
								selected={data.trainingDays === d}
								onclick={() => (data.trainingDays = d)}
							/>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Goals -->
		<div class="card" class:expanded={editing === 'goals'}>
			<button class="card-toggle card-toggle-inline" onclick={() => toggle('goals')}>
				<div class="card-summary-inline">
					<span class="card-label">Goals</span>
					<span class="card-value">{data.goals.map((g: TrainingGoal) => goalLabels[g]).join(', ') || '—'}</span>
				</div>
				<span class="edit">{editing === 'goals' ? 'Done' : 'Edit'}</span>
			</button>
			{#if editing === 'goals'}
				<div class="inline-edit">
					<div class="edit-options-row edit-options-2x2">
						{#each goalOptions as opt}
							<SelectionCard
								label={opt.label}
								selected={data.goals.includes(opt.value)}
								onclick={() => toggleGoal(opt.value)}
							/>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Injuries -->
		<div class="card" class:expanded={editing === 'injuries'}>
			<button class="card-toggle card-toggle-inline" onclick={() => toggle('injuries')}>
				<div class="card-summary-inline">
					<span class="card-label">Injuries</span>
					<span class="card-value">{data.injuries.length > 0 ? data.injuries.map((i: InjuryArea) => injuryLabels[i]).join(', ') : 'None'}</span>
				</div>
				<span class="edit">{editing === 'injuries' ? 'Done' : 'Edit'}</span>
			</button>
			{#if editing === 'injuries'}
				<div class="inline-edit">
					<div class="edit-options-row">
						<SelectionCard
							label="None"
							selected={data.injuries.length === 0}
							onclick={() => (data.injuries = [])}
						/>
						{#each injuryOptions as opt}
							<SelectionCard
								label={opt.label}
								selected={data.injuries.includes(opt.value)}
								onclick={() => toggleInjury(opt.value)}
							/>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<button class="generate-btn" onclick={ongenerate}>Generate My Plan</button>
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

	.subtitle {
		text-align: center;
		color: #888;
		font-size: 0.875rem;
		margin: -0.5rem 0 0;
	}

	.cards {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.card {
		border: 2px solid #e5e5e5;
		border-radius: 12px;
		background: #fff;
		overflow: hidden;
		transition: border-color 0.15s;
	}

	.card:hover {
		border-color: #ccc;
	}

	.card.expanded {
		border-color: #000;
	}

	.card-toggle {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		width: 100%;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
	}

	.card-toggle-inline {
		align-items: center;
	}

	.card-summary {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.card-summary-inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.card-label {
		font-size: 0.8125rem;
		color: #888;
	}

	.card-value {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #000;
	}

	.edit {
		font-size: 0.8125rem;
		color: #888;
		font-weight: 500;
		flex-shrink: 0;
	}

	.inline-edit {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0 0.75rem 0.75rem;
		border-top: 1px solid #e5e5e5;
		padding-top: 0.75rem;
	}

	.edit-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #888;
		margin: 0;
	}

	.edit-options-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
		gap: 0.5rem;
	}

	.edit-options-2x2 {
		grid-template-columns: 1fr 1fr;
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

	.generate-btn {
		width: 100%;
		padding: 1rem;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	.generate-btn:hover {
		background: #222;
	}
</style>

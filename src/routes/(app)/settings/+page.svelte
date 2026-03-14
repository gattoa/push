<script lang="ts">
	import { onMount } from 'svelte';
	import type { OnboardingData, AgeRange, ExperienceLevel, TrainingGoal, InjuryArea } from '$lib/types';

	let data: OnboardingData = $state({
		ageRange: null,
		experienceLevel: null,
		trainingDays: null,
		goals: [],
		injuries: []
	});

	let expandedSection: string | null = $state(null);
	let hasChanges = $state(false);
	let saved = $state(false);

	onMount(() => {
		const raw = localStorage.getItem('push_onboarding_data');
		if (raw) {
			try {
				data = JSON.parse(raw);
			} catch {
				// ignore
			}
		}
	});

	function markChanged() {
		hasChanges = true;
		saved = false;
	}

	function toggle(section: string) {
		expandedSection = expandedSection === section ? null : section;
	}

	function save() {
		localStorage.setItem('push_onboarding_data', JSON.stringify(data));
		hasChanges = false;
		saved = true;
		setTimeout(() => { saved = false; }, 2000);
	}

	// Display labels
	const ageLabels: Record<string, string> = {
		under_35: '18–34',
		'35_50': '35–50',
		'50_plus': '51+'
	};

	const experienceLabels: Record<string, string> = {
		beginner: 'Beginner',
		intermediate: 'Intermediate',
		advanced: 'Advanced'
	};

	const goalLabels: Record<string, string> = {
		build_muscle: 'Build Muscle',
		lose_fat: 'Lose Fat',
		get_stronger: 'Get Stronger',
		general_fitness: 'General Fitness'
	};

	const injuryLabels: Record<string, string> = {
		shoulder: 'Shoulder',
		back: 'Back',
		knee: 'Knee'
	};

	// Derived display values
	let experienceDisplay = $derived(data.experienceLevel ? experienceLabels[data.experienceLevel] : 'Not set');
	let ageDisplay = $derived(data.ageRange ? ageLabels[data.ageRange] : 'Not set');
	let daysDisplay = $derived(data.trainingDays ? `${data.trainingDays} days` : 'Not set');
	let goalsDisplay = $derived(
		data.goals.length > 0
			? data.goals.map((g: TrainingGoal) => goalLabels[g]).join(', ')
			: 'Not set'
	);
	let injuriesDisplay = $derived(
		data.injuries.length > 0
			? data.injuries.map((i: InjuryArea) => injuryLabels[i]).join(', ')
			: 'None'
	);

	// Option sets for expanded editors
	const experienceOptions: { value: ExperienceLevel; label: string }[] = [
		{ value: 'beginner', label: 'Beginner' },
		{ value: 'intermediate', label: 'Intermediate' },
		{ value: 'advanced', label: 'Advanced' }
	];

	const ageOptions: { value: AgeRange; label: string }[] = [
		{ value: 'under_35', label: '18–34' },
		{ value: '35_50', label: '35–50' },
		{ value: '50_plus', label: '51+' }
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
		markChanged();
	}

	function toggleInjury(area: InjuryArea) {
		if (data.injuries.includes(area)) {
			data.injuries = data.injuries.filter((a: InjuryArea) => a !== area);
		} else {
			data.injuries = [...data.injuries, area];
		}
		markChanged();
	}
</script>

<div class="settings">
	<h1>Settings</h1>

	<div class="group">
		<p class="group-label">Training</p>
		<div class="card">
			<!-- Experience Level -->
			<button class="row" onclick={() => toggle('experience')}>
				<span class="row-label">Experience</span>
				<span class="row-value">{experienceDisplay}</span>
				<span class="chevron" class:open={expandedSection === 'experience'}></span>
			</button>
			{#if expandedSection === 'experience'}
				<div class="row-detail">
					<div class="pill-group">
						{#each experienceOptions as opt}
							<button
								class="pill"
								class:active={data.experienceLevel === opt.value}
								onclick={() => { data.experienceLevel = opt.value; markChanged(); }}
							>{opt.label}</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="divider"></div>

			<!-- Training Days -->
			<button class="row" onclick={() => toggle('days')}>
				<span class="row-label">Days per week</span>
				<span class="row-value">{daysDisplay}</span>
				<span class="chevron" class:open={expandedSection === 'days'}></span>
			</button>
			{#if expandedSection === 'days'}
				<div class="row-detail">
					<div class="pill-group">
						{#each dayOptions as d}
							<button
								class="pill"
								class:active={data.trainingDays === d}
								onclick={() => { data.trainingDays = d; markChanged(); }}
							>{d}</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="divider"></div>

			<!-- Goals -->
			<button class="row" onclick={() => toggle('goals')}>
				<span class="row-label">Goals</span>
				<span class="row-value truncate">{goalsDisplay}</span>
				<span class="chevron" class:open={expandedSection === 'goals'}></span>
			</button>
			{#if expandedSection === 'goals'}
				<div class="row-detail">
					<div class="chip-group">
						{#each goalOptions as opt}
							<button
								class="chip"
								class:active={data.goals.includes(opt.value)}
								onclick={() => toggleGoal(opt.value)}
							>{opt.label}</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="group">
		<p class="group-label">About You</p>
		<div class="card">
			<!-- Age Range -->
			<button class="row" onclick={() => toggle('age')}>
				<span class="row-label">Age range</span>
				<span class="row-value">{ageDisplay}</span>
				<span class="chevron" class:open={expandedSection === 'age'}></span>
			</button>
			{#if expandedSection === 'age'}
				<div class="row-detail">
					<div class="pill-group">
						{#each ageOptions as opt}
							<button
								class="pill"
								class:active={data.ageRange === opt.value}
								onclick={() => { data.ageRange = opt.value; markChanged(); }}
							>{opt.label}</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="divider"></div>

			<!-- Injuries -->
			<button class="row" onclick={() => toggle('injuries')}>
				<span class="row-label">Injuries</span>
				<span class="row-value">{injuriesDisplay}</span>
				<span class="chevron" class:open={expandedSection === 'injuries'}></span>
			</button>
			{#if expandedSection === 'injuries'}
				<div class="row-detail">
					<div class="chip-group">
						<button
							class="chip"
							class:active={data.injuries.length === 0}
							onclick={() => { data.injuries = []; markChanged(); }}
						>None</button>
						{#each injuryOptions as opt}
							<button
								class="chip"
								class:active={data.injuries.includes(opt.value)}
								onclick={() => toggleInjury(opt.value)}
							>{opt.label}</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#if hasChanges}
		<button class="save-btn" onclick={save}>Save Changes</button>
	{/if}

	{#if saved}
		<p class="saved-msg">Saved</p>
	{/if}
</div>

<style>
	.settings {
		max-width: 480px;
		margin: 0 auto;
		padding: 0 1rem 6rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0;
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.group-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin: 0;
		padding-left: 0.25rem;
	}

	.card {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 12px;
		overflow: hidden;
	}

	.row {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.875rem 1rem;
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		text-align: left;
		gap: 0.5rem;
	}

	.row:hover {
		background: #fafafa;
	}

	.row-label {
		font-size: 0.9375rem;
		font-weight: 500;
		color: #000;
		flex-shrink: 0;
	}

	.row-value {
		font-size: 0.9375rem;
		color: #888;
		margin-left: auto;
		text-align: right;
	}

	.truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 55%;
	}

	.chevron {
		flex-shrink: 0;
		width: 0.5rem;
		height: 0.5rem;
		border-right: 2px solid #ccc;
		border-bottom: 2px solid #ccc;
		transform: rotate(45deg);
		transition: transform 0.2s;
	}

	.chevron.open {
		transform: rotate(-135deg);
	}

	.divider {
		height: 1px;
		background: #f0f0f0;
		margin: 0 1rem;
	}

	.row-detail {
		padding: 0.25rem 1rem 0.875rem;
	}

	.pill-group {
		display: flex;
		gap: 0.375rem;
	}

	.pill {
		flex: 1;
		padding: 0.5rem 0.25rem;
		border: 1.5px solid #e5e5e5;
		border-radius: 8px;
		background: #fff;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #666;
		cursor: pointer;
		font-family: inherit;
		text-align: center;
		transition: all 0.15s;
	}

	.pill:hover {
		border-color: #ccc;
	}

	.pill.active {
		border-color: #000;
		background: #000;
		color: #fff;
	}

	.chip-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.chip {
		padding: 0.4rem 0.75rem;
		border: 1.5px solid #e5e5e5;
		border-radius: 20px;
		background: #fff;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #666;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}

	.chip:hover {
		border-color: #ccc;
	}

	.chip.active {
		border-color: #000;
		background: #000;
		color: #fff;
	}

	.save-btn {
		padding: 0.875rem;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		width: 100%;
	}

	.save-btn:hover {
		background: #222;
	}

	.saved-msg {
		text-align: center;
		color: #22c55e;
		font-size: 0.875rem;
		font-weight: 600;
		margin: -0.5rem 0 0;
	}
</style>

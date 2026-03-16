<script lang="ts">
	import { onMount } from 'svelte';
	import type {
		OnboardingData, TrainingGoal, InjuryArea, Gender, AppPreferences
	} from '$lib/types';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import AccountSheet from '$lib/components/AccountSheet.svelte';
	import { getWeekHistories } from '$lib/services/history';
	import { computeWeekMomentum } from '$lib/utils/workout-stats';
	import { getTodayIndex } from '$lib/utils/date';
	import WeekCard from '$lib/components/WeekCard.svelte';
	import MuscleCard from '$lib/components/MuscleCard.svelte';

	let accountSheetOpen = $state(false);
	let email = $state('');
	let units: 'lbs' | 'kg' = $state('lbs');
	let momentum: import('$lib/types').WeekMomentum | null = $state(null);

	let data: OnboardingData = $state({
		dateOfBirth: null,
		gender: null,
		experienceLevel: null,
		trainingDays: null,
		sessionDuration: null,
		equipment: [],
		goals: [],
		injuries: []
	});

	let sheetOpen = $state({
		injuries: false,
		experience: false,
		days: false,
		goals: false,
		gender: false
	});

	onMount(() => {
		const histories = getWeekHistories();
		momentum = computeWeekMomentum(histories, getTodayIndex());
		const rawData = localStorage.getItem('push_onboarding_data');
		if (rawData) {
			try {
				const parsed = JSON.parse(rawData);
				// Migrate old ageRange to dateOfBirth if needed
				if (parsed.ageRange && !parsed.dateOfBirth) {
					const midpoints: Record<string, string> = {
						under_35: '1998-01-01',
						'35_50': '1982-01-01',
						'50_plus': '1970-01-01'
					};
					parsed.dateOfBirth = midpoints[parsed.ageRange] ?? null;
					delete parsed.ageRange;
				}
				if (!parsed.gender) parsed.gender = null;
				data = parsed;
				// Persist migrated data
				localStorage.setItem('push_onboarding_data', JSON.stringify(data));
			} catch { /* ignore */ }
		}
		const rawPrefs = localStorage.getItem('push_preferences');
		if (rawPrefs) {
			try {
				const prefs: Partial<AppPreferences> = JSON.parse(rawPrefs);
				if (prefs.units) units = prefs.units;
			} catch { /* ignore */ }
		}
		const rawEmail = localStorage.getItem('push_email');
		if (rawEmail) email = rawEmail;
	});

	function saveData() {
		localStorage.setItem('push_onboarding_data', JSON.stringify(data));
	}

	$effect(() => {
		if (email) localStorage.setItem('push_email', email);
	});

	// streakData not currently used in template but keeping for future use
	const avatarInitial = $derived(email ? email[0].toUpperCase() : 'P');

	// Display labels
	const experienceLabels: Record<string, string> = {
		beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced'
	};
	const goalLabels: Record<string, string> = {
		build_muscle: 'Build Muscle', lose_fat: 'Lose Fat',
		get_stronger: 'Get Stronger', general_fitness: 'General Fitness'
	};
	const injuryLabels: Record<string, string> = {
		shoulder: 'Shoulder', back: 'Back', knee: 'Knee'
	};
	const genderLabels: Record<string, string> = {
		male: 'Male', female: 'Female', prefer_not_to_say: ''
	};

	function computeAge(dob: string | null): number | null {
		if (!dob) return null;
		const birth = new Date(dob + 'T00:00:00');
		const today = new Date();
		let age = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
		return age;
	}

	let ageDisplay = $derived(computeAge(data.dateOfBirth));
	let genderDisplay = $derived(data.gender ? genderLabels[data.gender] : '');
	let experienceDisplay = $derived(data.experienceLevel ? experienceLabels[data.experienceLevel] : 'Not set');
	let daysDisplay = $derived(data.trainingDays ? `${data.trainingDays} days` : 'Not set');

	// Bottom sheet options
	const genderOptions: { value: string | number; label: string }[] = [
		{ value: 'male', label: 'Male' },
		{ value: 'female', label: 'Female' },
		{ value: 'prefer_not_to_say', label: 'Prefer not to say' }
	];
	const experienceOptions: { value: string | number; label: string }[] = [
		{ value: 'beginner', label: 'Beginner' },
		{ value: 'intermediate', label: 'Intermediate' },
		{ value: 'advanced', label: 'Advanced' }
	];
	const daySheetOptions: { value: string | number; label: string }[] = [
		{ value: 3, label: '3 days' },
		{ value: 4, label: '4 days' },
		{ value: 5, label: '5 days' },
		{ value: 6, label: '6 days' }
	];
	const goalSheetOptions: { value: string | number; label: string }[] = [
		{ value: 'build_muscle', label: 'Build Muscle' },
		{ value: 'lose_fat', label: 'Lose Fat' },
		{ value: 'get_stronger', label: 'Get Stronger' },
		{ value: 'general_fitness', label: 'General Fitness' }
	];
	const injurySheetOptions: { value: string | number; label: string }[] = [
		{ value: '__none__', label: 'None' },
		{ value: 'shoulder', label: 'Shoulder' },
		{ value: 'back', label: 'Back' },
		{ value: 'knee', label: 'Knee' }
	];
	let injurySheetValues = $derived(
		data.injuries.length === 0
			? ['__none__'] as (string | number)[]
			: data.injuries as (string | number)[]
	);
</script>

<div class="profile">
	<!-- Header -->
	<div class="profile-header">
		<button class="avatar-btn" onclick={() => accountSheetOpen = true}>
			<div class="avatar">
				<span class="avatar-initial">{avatarInitial}</span>
			</div>
		</button>
		<h1>Push Athlete</h1>
		{#if email}
			<p class="subtitle">{email}</p>
		{/if}
		<div class="context-chips">
			{#if data.experienceLevel}
				<button class="chip chip-subtle" onclick={() => sheetOpen.experience = true}>{experienceDisplay}</button>
			{/if}
			{#if ageDisplay !== null}
				<span class="chip-text">{ageDisplay}</span>
			{/if}
			{#if genderDisplay}
				<button class="chip chip-subtle" onclick={() => sheetOpen.gender = true}>{genderDisplay}</button>
			{/if}
			{#if data.trainingDays}
				<button class="chip chip-subtle" onclick={() => sheetOpen.days = true}>{daysDisplay}</button>
			{/if}
			{#if data.injuries.length > 0}
				{#each data.injuries as inj}
					<button class="chip chip-subtle" onclick={() => sheetOpen.injuries = true}>{injuryLabels[inj]}</button>
				{/each}
			{/if}
		</div>
		{#if data.goals.length > 0}
			<div class="goal-chips">
				{#each data.goals as g}
					<button class="chip chip-goal" onclick={() => sheetOpen.goals = true}>{goalLabels[g]}</button>
				{/each}
			</div>
		{/if}
	</div>

	{#if momentum}
		<!-- This Week — the momentum centerpiece -->
		<WeekCard {momentum} />

		<!-- Muscles trained -->
		<MuscleCard {momentum} />

		<!-- Streak + PRs — breadcrumbs of consistency -->
		{#if momentum.streak > 0 || momentum.weekPRs.length > 0}
			<div class="wins">
				{#if momentum.streak > 0}
					<div class="win-item">
						<span class="win-number">{momentum.streak}</span>
						<span class="win-label">{momentum.streak === 1 ? 'day' : 'days'} strong</span>
					</div>
				{/if}
				{#if momentum.weekPRs.length > 0}
					<div class="win-item">
						<span class="win-number">{momentum.weekPRs.length}</span>
						<span class="win-label">{momentum.weekPRs.length === 1 ? 'PR' : 'PRs'} this week</span>
					</div>
				{/if}
			</div>
		{/if}

		<!-- PR details if any -->
		{#if momentum.weekPRs.length > 0}
			<div class="pr-list">
				{#each momentum.weekPRs as pr (pr.exerciseName)}
					<div class="pr-chip">
						<span class="pr-badge">PR</span>
						<span class="pr-name">{pr.exerciseName}</span>
					</div>
				{/each}
			</div>
		{/if}
	{/if}

</div>

<AccountSheet bind:open={accountSheetOpen} bind:email />

<BottomSheet bind:open={sheetOpen.experience} title="Experience Level" options={experienceOptions} bind:value={data.experienceLevel} onchange={saveData} />
<BottomSheet bind:open={sheetOpen.gender} title="Gender" options={genderOptions} bind:value={data.gender} onchange={saveData} />
<BottomSheet bind:open={sheetOpen.days} title="Days per Week" options={daySheetOptions} bind:value={data.trainingDays} onchange={saveData} />
<BottomSheet bind:open={sheetOpen.goals} title="Goals" options={goalSheetOptions} bind:values={data.goals} multiSelect={true} onchange={saveData} />
<BottomSheet
	bind:open={sheetOpen.injuries}
	title="Injuries or Limitations"
	options={injurySheetOptions}
	values={injurySheetValues}
	multiSelect={true}
	onchange={() => {
		if (injurySheetValues.includes('__none__') && injurySheetValues.length > 1) {
			data.injuries = injurySheetValues.filter(v => v !== '__none__') as InjuryArea[];
		} else if (injurySheetValues.includes('__none__')) {
			data.injuries = [];
		} else {
			data.injuries = injurySheetValues as InjuryArea[];
		}
		saveData();
	}}
/>

<style>
	.profile {
		max-width: 480px;
		margin: 0 auto;
		padding: 0 1rem 6rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	/* Header */
	.profile-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1.5rem 0 0.5rem;
	}

	.avatar-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		margin-bottom: 0.75rem;
	}

	.avatar-btn:hover .avatar {
		transform: scale(1.05);
	}

	.avatar {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.15s ease;
	}

	.avatar-initial {
		font-size: 1.75rem;
		font-weight: 700;
		color: #fff;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0;
	}

	.subtitle {
		font-size: 0.8125rem;
		color: #999;
		margin: 0.25rem 0 0;
	}

	.goal-chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.375rem;
		margin-top: 0.625rem;
	}

	.context-chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.125rem 0.5rem;
		margin-top: 0.375rem;
	}

	.chip {
		border: none;
		cursor: pointer;
		font-family: inherit;
		white-space: nowrap;
		border-radius: 100px;
	}

	.chip-goal {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #000;
		background: #f0f0f0;
		padding: 0.3125rem 0.75rem;
	}

	.chip-goal:hover {
		background: #e5e5e5;
	}

	.chip-subtle {
		font-size: 0.6875rem;
		font-weight: 500;
		color: #999;
		background: none;
		padding: 0.125rem 0;
	}

	.chip-subtle:hover {
		color: #666;
	}

	.chip-text {
		font-size: 0.6875rem;
		font-weight: 500;
		color: #999;
		padding: 0.125rem 0;
	}

	/* Wins */
	.wins {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.win-item {
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
	}

	.win-number {
		font-size: 1.75rem;
		font-weight: 800;
		color: #000;
		line-height: 1;
	}

	.win-label {
		font-size: 0.8125rem;
		color: #999;
		font-weight: 500;
	}

	/* PR chips */
	.pr-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.pr-chip {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 100px;
	}

	.pr-badge {
		font-size: 0.5625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: #000;
		color: #fff;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
	}

	.pr-name {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #000;
	}

</style>

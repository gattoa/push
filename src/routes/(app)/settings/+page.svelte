<script lang="ts">
	import { onMount } from 'svelte';
	import type {
		OnboardingData, AgeRange, ExperienceLevel, TrainingGoal, InjuryArea,
		AppPreferences, WeightUnit, ReviewDay, RestTimerSeconds
	} from '$lib/types';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import SegmentedToggle from '$lib/components/SegmentedToggle.svelte';

	let data: OnboardingData = $state({
		ageRange: null,
		experienceLevel: null,
		trainingDays: null,
		goals: [],
		injuries: []
	});

	let prefs: AppPreferences = $state({
		reviewDay: 6,
		units: 'lbs',
		restTimerDefault: 90
	});

	let sheetOpen = $state({
		age: false,
		injuries: false,
		experience: false,
		days: false,
		goals: false,
		reviewDay: false,
		restTimer: false
	});

	let hasChanges = $state(false);
	let saved = $state(false);

	onMount(() => {
		const rawData = localStorage.getItem('push_onboarding_data');
		if (rawData) {
			try { data = JSON.parse(rawData); } catch { /* ignore */ }
		}
		const rawPrefs = localStorage.getItem('push_preferences');
		if (rawPrefs) {
			try { prefs = { ...prefs, ...JSON.parse(rawPrefs) }; } catch { /* ignore */ }
		}
	});

	function markChanged() {
		hasChanges = true;
		saved = false;
	}

	function save() {
		localStorage.setItem('push_onboarding_data', JSON.stringify(data));
		localStorage.setItem('push_preferences', JSON.stringify(prefs));
		hasChanges = false;
		saved = true;
		setTimeout(() => { saved = false; }, 2000);
	}

	// Display labels
	const ageLabels: Record<string, string> = {
		under_35: '18–34', '35_50': '35–50', '50_plus': '51+'
	};
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
	const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
	let reviewDayDisplay = $derived(dayNames[prefs.reviewDay] ?? 'Sun');
	let restTimerDisplay = $derived(
		prefs.restTimerDefault >= 120
			? `${prefs.restTimerDefault / 60} min`
			: `${prefs.restTimerDefault}s`
	);

	// Option sets for bottom sheets
	const ageOptions: { value: string | number; label: string }[] = [
		{ value: 'under_35', label: '18–34' },
		{ value: '35_50', label: '35–50' },
		{ value: '50_plus', label: '51+' }
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
	const reviewDaySheetOptions: { value: string | number; label: string }[] = [
		{ value: 0, label: 'Monday' }, { value: 1, label: 'Tuesday' },
		{ value: 2, label: 'Wednesday' }, { value: 3, label: 'Thursday' },
		{ value: 4, label: 'Friday' }, { value: 5, label: 'Saturday' },
		{ value: 6, label: 'Sunday' }
	];
	const restTimerSheetOptions: { value: string | number; label: string }[] = [
		{ value: 60, label: '60 seconds' },
		{ value: 90, label: '90 seconds' },
		{ value: 120, label: '2 minutes' },
		{ value: 180, label: '3 minutes' }
	];
	const unitOptions: { value: string; label: string }[] = [
		{ value: 'lbs', label: 'lbs' },
		{ value: 'kg', label: 'kg' }
	];

	// Injury values proxy (maps between InjuryArea[] and the sheet's string[])
	let injurySheetValues = $derived(
		data.injuries.length === 0
			? ['__none__'] as (string | number)[]
			: data.injuries as (string | number)[]
	);

	function handleInjuryChange() {
		// After the sheet toggles values, sync back
		// Check in a tick so the binding has propagated
	}

	function syncInjuries(newValues: (string | number)[]) {
		if (newValues.includes('__none__')) {
			data.injuries = [];
		} else {
			data.injuries = newValues as InjuryArea[];
		}
		markChanged();
	}
</script>

<div class="settings">
	<h1>Settings</h1>

	<!-- Email placeholder -->
	<div class="card">
		<div class="row static">
			<span class="row-label">Email</span>
			<span class="row-value muted">Not signed in</span>
		</div>
	</div>

	<!-- About You -->
	<div class="group">
		<p class="group-label">About You</p>
		<div class="card">
			<button class="row" onclick={() => sheetOpen.age = true}>
				<span class="row-label">Age range</span>
				<span class="row-value">{ageDisplay}</span>
			</button>

			<div class="divider"></div>

			<button class="row" onclick={() => sheetOpen.injuries = true}>
				<span class="row-label">Injuries</span>
				<span class="row-value">{injuriesDisplay}</span>
			</button>
		</div>
	</div>

	<!-- Training -->
	<div class="group">
		<p class="group-label">Training</p>
		<div class="card">
			<button class="row" onclick={() => sheetOpen.experience = true}>
				<span class="row-label">Experience</span>
				<span class="row-value">{experienceDisplay}</span>
			</button>

			<div class="divider"></div>

			<button class="row" onclick={() => sheetOpen.days = true}>
				<span class="row-label">Days per week</span>
				<span class="row-value">{daysDisplay}</span>
			</button>

			<div class="divider"></div>

			<button class="row" onclick={() => sheetOpen.goals = true}>
				<span class="row-label">Goals</span>
				<span class="row-value truncate">{goalsDisplay}</span>
			</button>
		</div>
	</div>

	<!-- Preferences -->
	<div class="group">
		<p class="group-label">Preferences</p>
		<div class="card">
			<button class="row" onclick={() => sheetOpen.reviewDay = true}>
				<span class="row-label">Review day</span>
				<span class="row-value">{reviewDayDisplay}</span>
			</button>

			<div class="divider"></div>

			<div class="row static">
				<span class="row-label">Units</span>
				<SegmentedToggle
					options={unitOptions}
					bind:value={prefs.units}
					onchange={markChanged}
				/>
			</div>

			<div class="divider"></div>

			<button class="row" onclick={() => sheetOpen.restTimer = true}>
				<span class="row-label">Rest timer</span>
				<span class="row-value">{restTimerDisplay}</span>
			</button>
		</div>
	</div>

	{#if hasChanges}
		<button class="save-btn" onclick={save}>Save Changes</button>
	{/if}

	{#if saved}
		<p class="saved-msg">Saved</p>
	{/if}

	<!-- Log out placeholder -->
	<button class="logout-btn" disabled>Log out</button>
</div>

<!-- Bottom Sheets -->
<BottomSheet
	bind:open={sheetOpen.age}
	title="Age Range"
	options={ageOptions}
	bind:value={data.ageRange}
	onchange={markChanged}
/>

<BottomSheet
	bind:open={sheetOpen.experience}
	title="Experience Level"
	options={experienceOptions}
	bind:value={data.experienceLevel}
	onchange={markChanged}
/>

<BottomSheet
	bind:open={sheetOpen.days}
	title="Days per Week"
	options={daySheetOptions}
	bind:value={data.trainingDays}
	onchange={markChanged}
/>

<BottomSheet
	bind:open={sheetOpen.goals}
	title="Goals"
	options={goalSheetOptions}
	bind:values={data.goals}
	multiSelect={true}
	onchange={markChanged}
/>

<BottomSheet
	bind:open={sheetOpen.injuries}
	title="Injuries or Limitations"
	options={injurySheetOptions}
	values={injurySheetValues}
	multiSelect={true}
	onchange={() => {
		// After toggle, check if __none__ was selected
		if (injurySheetValues.includes('__none__') && injurySheetValues.length > 1) {
			// User selected a real injury, remove __none__
			data.injuries = injurySheetValues.filter(v => v !== '__none__') as InjuryArea[];
		} else if (injurySheetValues.includes('__none__')) {
			data.injuries = [];
		} else {
			data.injuries = injurySheetValues as InjuryArea[];
		}
		markChanged();
	}}
/>

<BottomSheet
	bind:open={sheetOpen.reviewDay}
	title="Review Day"
	options={reviewDaySheetOptions}
	bind:value={prefs.reviewDay}
	onchange={markChanged}
/>

<BottomSheet
	bind:open={sheetOpen.restTimer}
	title="Rest Timer"
	options={restTimerSheetOptions}
	bind:value={prefs.restTimerDefault}
	onchange={markChanged}
/>

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

	.row.static {
		cursor: default;
	}

	.row.static:hover {
		background: none;
	}

	.row-label {
		font-size: 0.9375rem;
		font-weight: 500;
		color: #000;
		flex-shrink: 0;
	}

	.row-value {
		font-size: 0.9375rem;
		color: #666;
		margin-left: auto;
		text-align: right;
	}

	.row-value.muted {
		color: #bbb;
	}

	.truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 55%;
	}

	.divider {
		height: 1px;
		background: #f0f0f0;
		margin: 0 1rem;
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

	.logout-btn {
		padding: 0.875rem;
		background: none;
		color: #e55;
		border: 1px solid #e8e8e8;
		border-radius: 12px;
		font-size: 0.9375rem;
		font-weight: 600;
		font-family: inherit;
		width: 100%;
		cursor: not-allowed;
		opacity: 0.4;
	}
</style>

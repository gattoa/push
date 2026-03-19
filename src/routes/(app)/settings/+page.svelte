<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/api/supabase';
	import { clearSessionData } from '$lib/utils/storage';
	import { getUserId } from '$lib/utils/auth';
	import { fetchSettings, saveSettings, hasPlanAffectingChanges } from '$lib/services/settings-sync';
	import { generatePlan } from '$lib/services/plan-generator';
	import { saveGeneratedPlan } from '$lib/services/workout';
	import { reloadWorkoutStore } from '$lib/stores/workout.svelte';
	import type {
		OnboardingData, ExperienceLevel, TrainingGoal, InjuryArea, Equipment,
		Gender, AppPreferences, WeightUnit, ReviewDay, RestTimerSeconds
	} from '$lib/types';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import SegmentedToggle from '$lib/components/SegmentedToggle.svelte';

	const session = $derived($page.data.session);
	const userEmail = $derived(session?.user?.email ?? 'Not signed in');

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

	let prefs: AppPreferences = $state({
		reviewDay: 6,
		units: 'lbs',
		restTimerDefault: 90
	});

	let sheetOpen = $state({
		gender: false,
		injuries: false,
		experience: false,
		days: false,
		sessionDuration: false,
		equipment: false,
		goals: false,
		reviewDay: false,
		restTimer: false
	});

	let hasChanges = $state(false);
	let saved = $state(false);
	let regenerating = $state(false);
	let showRegenPrompt = $state(false);
	let originalData: OnboardingData | null = $state(null);

	onMount(async () => {
		try {
			const userId = await getUserId();
			const settings = await fetchSettings(userId);
			data = settings.onboardingData;
			prefs = settings.preferences;
		} catch {
			// Fall back to localStorage (fetchSettings handles this internally)
			const rawData = localStorage.getItem('push_onboarding_data');
			if (rawData) {
				try { data = JSON.parse(rawData); } catch { /* ignore */ }
			}
			const rawPrefs = localStorage.getItem('push_preferences');
			if (rawPrefs) {
				try { prefs = { ...prefs, ...JSON.parse(rawPrefs) }; } catch { /* ignore */ }
			}
		}
		originalData = structuredClone(data);
	});

	function markChanged() {
		hasChanges = true;
		saved = false;
	}

	async function save() {
		// Check if plan-affecting fields changed
		const planChanged = originalData && hasPlanAffectingChanges(originalData, data);

		// Save to localStorage + Supabase
		try {
			const userId = await getUserId();
			await saveSettings(userId, data, prefs);
		} catch (e) {
			// localStorage was already written by saveSettings
			console.warn('[Push] Supabase settings save failed:', e instanceof Error ? e.message : e);
		}

		hasChanges = false;
		saved = true;
		originalData = structuredClone(data);
		setTimeout(() => { saved = false; }, 2000);

		if (planChanged) {
			showRegenPrompt = true;
		}
	}

	async function regeneratePlan() {
		showRegenPrompt = false;
		regenerating = true;
		try {
			const plan = await generatePlan(data);
			await saveGeneratedPlan(plan);
			await reloadWorkoutStore();
		} catch (e) {
			console.error('[Push] Plan regeneration failed:', e);
		}
		regenerating = false;
	}

	// Display labels
	const genderLabels: Record<string, string> = {
		male: 'Male', female: 'Female', prefer_not_to_say: 'Prefer not to say'
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
	let genderDisplay = $derived(data.gender ? genderLabels[data.gender] : 'Not set');
	let dobDisplay = $derived(
		data.dateOfBirth
			? new Date(data.dateOfBirth + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
			: 'Not set'
	);
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

	const equipmentLabels: Record<string, string> = {
		bodyweight: 'Bodyweight', dumbbells: 'Dumbbells', barbell: 'Barbell & Rack',
		cable_machine: 'Cable Machine', full_gym: 'Full Gym'
	};
	let sessionDurationDisplay = $derived(
		data.sessionDuration ? `${data.sessionDuration} min` : 'Not set'
	);
	let equipmentDisplay = $derived(
		data.equipment.length > 0
			? data.equipment.includes('full_gym')
				? 'Full Gym'
				: data.equipment.map((e: Equipment) => equipmentLabels[e]).join(', ')
			: 'Not set'
	);

	// Option sets for bottom sheets
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
	const sessionDurationSheetOptions: { value: string | number; label: string }[] = [
		{ value: 30, label: '30 min' },
		{ value: 45, label: '45 min' },
		{ value: 60, label: '60 min' },
		{ value: 75, label: '75 min' },
		{ value: 90, label: '90 min' }
	];
	const equipmentSheetOptions: { value: string | number; label: string }[] = [
		{ value: 'bodyweight', label: 'Bodyweight Only' },
		{ value: 'dumbbells', label: 'Dumbbells' },
		{ value: 'barbell', label: 'Barbell & Rack' },
		{ value: 'cable_machine', label: 'Cable Machine' },
		{ value: 'full_gym', label: 'Full Gym' }
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
	<div class="settings-header">
		<button class="back-btn" aria-label="Back" onclick={() => history.back()}>
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
				<path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
		<h1>Settings</h1>
		<div class="header-spacer"></div>
	</div>

	<!-- Account -->
	<div class="card">
		<div class="row static">
			<span class="row-label">Email</span>
			<span class="row-value">{userEmail}</span>
		</div>
	</div>

	<!-- About You -->
	<div class="group">
		<p class="group-label">About You</p>
		<div class="card">
			<label class="row static">
				<span class="row-label">Date of birth</span>
				<input
					type="date"
					class="date-input"
					value={data.dateOfBirth ?? ''}
					onchange={(e) => { data.dateOfBirth = e.currentTarget.value || null; markChanged(); }}
				/>
			</label>

			<div class="divider"></div>

			<button class="row" onclick={() => sheetOpen.gender = true}>
				<span class="row-label">Gender</span>
				<span class="row-value">{genderDisplay}</span>
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

			<button class="row" onclick={() => sheetOpen.sessionDuration = true}>
				<span class="row-label">Session duration</span>
				<span class="row-value">{sessionDurationDisplay}</span>
			</button>

			<div class="divider"></div>

			<button class="row" onclick={() => sheetOpen.equipment = true}>
				<span class="row-label">Equipment</span>
				<span class="row-value truncate">{equipmentDisplay}</span>
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

	{#if saved && !showRegenPrompt}
		<p class="saved-msg">Saved</p>
	{/if}

	{#if showRegenPrompt}
		<div class="regen-prompt">
			<p class="regen-text">Your training settings changed. Generate a new plan?</p>
			<div class="regen-actions">
				<button class="regen-skip" onclick={() => showRegenPrompt = false}>Keep Current</button>
				<button class="regen-btn" onclick={regeneratePlan}>New Plan</button>
			</div>
		</div>
	{/if}

	{#if regenerating}
		<p class="regen-msg">Generating new plan...</p>
	{/if}

	<!-- Log out -->
	<button class="logout-btn" onclick={async () => { clearSessionData(); await supabase.auth.signOut(); goto('/login'); }}>Log out</button>
</div>

<!-- Bottom Sheets -->
<BottomSheet
	bind:open={sheetOpen.gender}
	title="Gender"
	options={genderOptions}
	bind:value={data.gender}
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

<BottomSheet
	bind:open={sheetOpen.sessionDuration}
	title="Session Duration"
	options={sessionDurationSheetOptions}
	bind:value={data.sessionDuration}
	onchange={markChanged}
/>

<BottomSheet
	bind:open={sheetOpen.equipment}
	title="Equipment"
	options={equipmentSheetOptions}
	bind:values={data.equipment}
	multiSelect={true}
	onchange={() => {
		// Handle full_gym logic
		if (data.equipment.includes('full_gym')) {
			data.equipment = ['bodyweight', 'dumbbells', 'barbell', 'cable_machine', 'full_gym'];
		} else if (['bodyweight', 'dumbbells', 'barbell', 'cable_machine'].every(e => data.equipment.includes(e as Equipment))) {
			data.equipment = [...data.equipment, 'full_gym'];
		}
		markChanged();
	}}
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

	.settings-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.settings-header h1 {
		flex: 1;
		text-align: center;
	}

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: none;
		border: none;
		cursor: pointer;
		color: #000;
		padding: 0;
		border-radius: 8px;
	}

	.back-btn:hover {
		background: #f0f0f0;
	}

	.header-spacer {
		width: 36px;
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

	.date-input {
		font-size: 0.9375rem;
		color: #666;
		background: none;
		border: none;
		font-family: inherit;
		text-align: right;
		margin-left: auto;
		cursor: pointer;
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

	.regen-prompt {
		background: #f8f8f8;
		border: 1px solid #e8e8e8;
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.regen-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: #333;
		margin: 0;
		text-align: center;
	}

	.regen-actions {
		display: flex;
		gap: 0.5rem;
	}

	.regen-skip {
		flex: 1;
		padding: 0.625rem;
		background: none;
		border: 1px solid #e8e8e8;
		border-radius: 10px;
		font-size: 0.875rem;
		font-weight: 600;
		color: #666;
		cursor: pointer;
		font-family: inherit;
	}

	.regen-btn {
		flex: 1;
		padding: 0.625rem;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 10px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	.regen-msg {
		text-align: center;
		color: #999;
		font-size: 0.875rem;
		font-weight: 500;
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
		cursor: pointer;
	}

	.logout-btn:hover {
		background: #fef2f2;
	}
</style>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { OnboardingData, TrainingGoal, AppPreferences } from '$lib/types';
	import { getWeekHistories } from '$lib/services/history';
	import { computeWeekMomentum } from '$lib/utils/workout-stats';
	import { getTodayIndex } from '$lib/utils/date';
	import WeekCard from '$lib/components/WeekCard.svelte';
	import MuscleCard from '$lib/components/MuscleCard.svelte';

	let momentum: import('$lib/types').WeekMomentum | null = $state(null);
	const session = $derived($page.data.session);
	const userEmail = $derived(session?.user?.email ?? '');
	const userName = $derived(session?.user?.user_metadata?.full_name ?? 'Push Athlete');
	const avatarUrl = $derived(session?.user?.user_metadata?.avatar_url ?? '');

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

	onMount(() => {
		const histories = getWeekHistories();
		momentum = computeWeekMomentum(histories, getTodayIndex());
		const rawData = localStorage.getItem('push_onboarding_data');
		if (rawData) {
			try {
				const parsed = JSON.parse(rawData);
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
				localStorage.setItem('push_onboarding_data', JSON.stringify(data));
			} catch { /* ignore */ }
		}
	});

	const avatarInitial = $derived(userEmail ? userEmail[0].toUpperCase() : 'P');

	const experienceLabels: Record<string, string> = {
		beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced'
	};
	const goalLabels: Record<string, string> = {
		build_muscle: 'Build Muscle', lose_fat: 'Lose Fat',
		get_stronger: 'Get Stronger', general_fitness: 'General Fitness'
	};

	let experienceDisplay = $derived(data.experienceLevel ? experienceLabels[data.experienceLevel] : '');
</script>

<div class="profile">
	<!-- Header -->
	<div class="profile-header">
		<button class="avatar-btn" onclick={() => goto('/settings')}>
			{#if avatarUrl}
				<img class="avatar-img" src={avatarUrl} alt="" />
			{:else}
				<div class="avatar">
					<span class="avatar-initial">{avatarInitial}</span>
				</div>
			{/if}
		</button>
		<h1>{userName}</h1>
		{#if userEmail}
			<p class="subtitle">{userEmail}</p>
		{/if}
		{#if experienceDisplay || data.goals.length > 0}
			<div class="identity-chips">
				{#if experienceDisplay}
					<span class="chip">{experienceDisplay}</span>
				{/if}
				{#each data.goals as g}
					<span class="chip">{goalLabels[g]}</span>
				{/each}
			</div>
		{/if}
	</div>

	{#if momentum}
		<WeekCard {momentum} />

		<MuscleCard {momentum} />

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

	.avatar-img {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		object-fit: cover;
		transition: transform 0.15s ease;
	}

	.avatar-btn:hover .avatar-img {
		transform: scale(1.05);
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

	.identity-chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.375rem;
		margin-top: 0.625rem;
	}

	.chip {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #000;
		background: #f0f0f0;
		padding: 0.3125rem 0.75rem;
		border-radius: 100px;
		white-space: nowrap;
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

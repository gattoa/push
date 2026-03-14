<script lang="ts">
	import { onMount } from 'svelte';
	import type { OnboardingData, AppPreferences } from '$lib/types';
	import SegmentedToggle from '$lib/components/SegmentedToggle.svelte';
	import PhotoUpload from '$lib/components/PhotoUpload.svelte';
	import PhotoViewer from '$lib/components/PhotoViewer.svelte';
	import { getAllPhotos, type ProgressPhoto } from '$lib/stores/photos';
	import { mockWeekHistories } from '$lib/mock/profile-history';
	import CalendarGrid from '$lib/components/CalendarGrid.svelte';
	import DayDetailPanel from '$lib/components/DayDetailPanel.svelte';
	import {
		computeWeekStats,
		computeStreak,
		computePersonalRecords,
		computeLifetimeStats,
		computeCalendarWeeks,
		formatVolume,
		convertWeight,
		type CalendarDay
	} from '$lib/mock/profile';

	let activeView = $state('recent');
	let onboardingData: OnboardingData | null = $state(null);
	let units: 'lbs' | 'kg' = $state('lbs');
	let photos: ProgressPhoto[] = $state([]);
	let viewerOpen = $state(false);
	let viewerPhotoId = $state('');
	let viewerDate = $state('');
	let selectedDay = $state<CalendarDay | null>(null);

	const viewOptions = [
		{ value: 'recent', label: 'Recent' },
		{ value: 'alltime', label: 'All Time' }
	];

	onMount(() => {
		const rawData = localStorage.getItem('push_onboarding_data');
		if (rawData) {
			try { onboardingData = JSON.parse(rawData); } catch { /* ignore */ }
		}
		const rawPrefs = localStorage.getItem('push_preferences');
		if (rawPrefs) {
			try {
				const prefs: Partial<AppPreferences> = JSON.parse(rawPrefs);
				if (prefs.units) units = prefs.units;
			} catch { /* ignore */ }
		}
		loadPhotos();
	});

	async function loadPhotos() {
		try {
			photos = await getAllPhotos();
		} catch { /* IndexedDB not available in SSR */ }
	}

	// Computed stats
	const currentWeek = mockWeekHistories[mockWeekHistories.length - 1];
	const currentWeekStats = $derived(computeWeekStats(currentWeek));
	const streak = $derived(computeStreak(mockWeekHistories));
	const lifetimeStats = $derived(computeLifetimeStats(mockWeekHistories));
	const personalRecords = $derived(computePersonalRecords(mockWeekHistories));
	const calendarWeeks = $derived(computeCalendarWeeks(mockWeekHistories));

	const experienceLabels: Record<string, string> = {
		beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced'
	};
	let experienceLabel = $derived.by(() => {
		const level = onboardingData?.experienceLevel;
		return level ? experienceLabels[level] : null;
	});

	function openViewer(photo: ProgressPhoto) {
		viewerPhotoId = photo.id;
		viewerDate = photo.date;
		viewerOpen = true;
	}

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${months[d.getMonth()]} ${d.getDate()}`;
	}

	function w(lbs: number): string {
		return `${convertWeight(lbs, units).toLocaleString()} ${units}`;
	}
</script>

<div class="profile">
	<!-- Header -->
	<div class="profile-header">
		<h1>Push Athlete</h1>
		<p class="subtitle">
			{#if experienceLabel}{experienceLabel} · {/if}Member since Feb 2026
		</p>
	</div>

	<SegmentedToggle options={viewOptions} bind:value={activeView} />

	{#if activeView === 'recent'}
		<!-- Stats Bar -->
		<div class="card stats-bar">
			<div class="stat">
				<span class="stat-value">{streak.current}</span>
				<span class="stat-label">Streak</span>
			</div>
			<div class="stat-divider"></div>
			<div class="stat">
				<span class="stat-value">{currentWeekStats.workoutsCompleted}/{currentWeekStats.workoutsTotal}</span>
				<span class="stat-label">This Week</span>
			</div>
			<div class="stat-divider"></div>
			<div class="stat">
				<span class="stat-value">{formatVolume(convertWeight(currentWeekStats.volume, units))}</span>
				<span class="stat-label">{units}</span>
			</div>
		</div>

		<!-- Progress Photos -->
		<div class="group">
			<div class="group-header">
				<p class="group-label">Progress Photos</p>
				<PhotoUpload onupload={loadPhotos} />
			</div>
			{#if photos.length > 0}
				<div class="photo-strip">
					{#each photos.slice(0, 8) as photo (photo.id)}
						<button class="photo-thumb" onclick={() => openViewer(photo)}>
							<img src={photo.thumbnailUrl} alt="Progress {photo.date}" />
							<span class="photo-date">{formatDate(photo.date)}</span>
						</button>
					{/each}
				</div>
			{:else}
				<div class="card empty-state">
					<p>Take your first progress photo to start tracking your transformation.</p>
				</div>
			{/if}
		</div>

		<!-- Activity Calendar -->
		<div class="group">
			<p class="group-label">Activity</p>
			<CalendarGrid
				weeks={calendarWeeks}
				{selectedDay}
				onSelectDay={(day) => { selectedDay = day; }}
			/>
			{#if selectedDay}
				<DayDetailPanel day={selectedDay} {units} />
			{/if}
		</div>

	{:else}
		<!-- Lifetime Stats -->
		<div class="group">
			<p class="group-label">Lifetime Stats</p>
			<div class="card">
				<div class="row static">
					<span class="row-label">Workouts</span>
					<span class="row-value">{lifetimeStats.totalWorkouts}</span>
				</div>
				<div class="divider"></div>
				<div class="row static">
					<span class="row-label">Volume Lifted</span>
					<span class="row-value">{w(lifetimeStats.totalVolume)}</span>
				</div>
				<div class="divider"></div>
				<div class="row static">
					<span class="row-label">Longest Streak</span>
					<span class="row-value">{lifetimeStats.longestStreak} days</span>
				</div>
				<div class="divider"></div>
				<div class="row static">
					<span class="row-label">Weeks Active</span>
					<span class="row-value">{lifetimeStats.weeksActive}</span>
				</div>
			</div>
		</div>

		<!-- Personal Records -->
		<div class="group">
			<p class="group-label">Personal Records</p>
			{#if personalRecords.length > 0}
				<div class="card">
					{#each personalRecords as pr, i (pr.exerciseName)}
						{#if i > 0}<div class="divider"></div>{/if}
						<div class="row static pr-row">
							<div class="pr-info">
								<span class="row-label">{pr.exerciseName}</span>
								<span class="pr-detail">{w(pr.weight)} × {pr.reps}</span>
							</div>
							<span class="row-value pr-value">{w(pr.estimated1RM)}</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="card empty-state">
					<p>Complete your first workout to start tracking personal records.</p>
				</div>
			{/if}
		</div>

		<!-- All Progress Photos -->
		<div class="group">
			<div class="group-header">
				<p class="group-label">Progress Photos</p>
				<PhotoUpload onupload={loadPhotos} />
			</div>
			{#if photos.length > 0}
				<div class="photo-grid">
					{#each photos as photo (photo.id)}
						<button class="photo-grid-item" onclick={() => openViewer(photo)}>
							<img src={photo.thumbnailUrl} alt="Progress {photo.date}" />
							<span class="photo-date">{formatDate(photo.date)}</span>
						</button>
					{/each}
				</div>
			{:else}
				<div class="card empty-state">
					<p>Take your first progress photo to start tracking your transformation.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<PhotoViewer photoId={viewerPhotoId} date={viewerDate} bind:open={viewerOpen} />

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
		text-align: center;
		padding: 1rem 0 0.25rem;
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

	/* Groups (reused from settings) */
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

	.group-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	/* Cards (reused from settings) */
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
		gap: 0.5rem;
	}

	.row.static {
		cursor: default;
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

	.divider {
		height: 1px;
		background: #f0f0f0;
		margin: 0 1rem;
	}

	/* Stats Bar */
	.stats-bar {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		padding: 1.25rem 0.5rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 800;
		color: #000;
	}

	.stat-label {
		font-size: 0.6875rem;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 600;
	}

	.stat-divider {
		width: 1px;
		height: 2.5rem;
		background: #f0f0f0;
	}

	/* Photo Strip (Recent View) */
	.photo-strip {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding: 0.25rem 0;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.photo-strip::-webkit-scrollbar {
		display: none;
	}

	.photo-thumb {
		flex-shrink: 0;
		width: 80px;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.photo-thumb img {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid #e8e8e8;
	}

	.photo-date {
		font-size: 0.6875rem;
		color: #999;
		text-align: center;
	}

	/* Photo Grid (All Time View) */
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.photo-grid-item {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.photo-grid-item img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid #e8e8e8;
	}

	/* Empty State */
	.empty-state {
		padding: 1.5rem 1rem;
		text-align: center;
	}

	.empty-state p {
		color: #999;
		font-size: 0.875rem;
		margin: 0;
	}

	/* Personal Records */
	.pr-row {
		flex-direction: row;
		align-items: center;
	}

	.pr-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.pr-detail {
		font-size: 0.75rem;
		color: #999;
	}

	.pr-value {
		font-weight: 700;
		color: #000;
	}
</style>

<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { AppPreferences } from '$lib/types';
	import { mockWeekHistories } from '$lib/mock/profile-history';
	import {
		computeCalendarWeeks,
		convertWeight,
		type CalendarDay
	} from '$lib/mock/profile';

	let units: 'lbs' | 'kg' = $state('lbs');

	onMount(() => {
		const rawPrefs = localStorage.getItem('push_preferences');
		if (rawPrefs) {
			try {
				const prefs: Partial<AppPreferences> = JSON.parse(rawPrefs);
				if (prefs.units) units = prefs.units;
			} catch { /* ignore */ }
		}
	});

	const calendarWeeks = $derived(computeCalendarWeeks(mockWeekHistories));
	const dateParam = $derived($page.params.date ?? '');

	const dayData = $derived.by(() => {
		for (const week of calendarWeeks) {
			for (const day of week.days) {
				if (day.date === dateParam) return day;
			}
		}
		return null;
	});

	// Compute session stats
	const sessionStats = $derived.by(() => {
		if (!dayData || dayData.exercises.length === 0) return null;
		let totalSets = 0;
		let completedSets = 0;
		let volume = 0;

		for (const ex of dayData.exercises) {
			for (const s of ex.sets) {
				totalSets++;
				if (s.completed) {
					completedSets++;
					if (s.weight !== null && s.reps !== null) {
						volume += s.weight * s.reps;
					}
				}
			}
		}

		return {
			exerciseCount: dayData.exercises.length,
			completedSets,
			totalSets,
			volume: convertWeight(volume, units)
		};
	});

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		const dow = d.getDay();
		const dayLabel = days[dow === 0 ? 6 : dow - 1];
		return `${dayLabel}, ${months[d.getMonth()]} ${d.getDate()}`;
	}

	function formatSet(weight: number | null, reps: number | null): string {
		if (weight === null || weight === 0) {
			return reps !== null ? `BW×${reps}` : '—';
		}
		const w = convertWeight(weight, units);
		return reps !== null ? `${w}×${reps}` : `${w}`;
	}

	function formatVolume(v: number): string {
		if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`;
		return v.toLocaleString();
	}
</script>

<div class="session-page">
	{#if dayData}
		<div class="session-header">
			<p class="session-date">{formatDate(dateParam)}</p>
			{#if !dayData.isRestDay && !dayData.isReviewDay}
				<h1>{dayData.label}</h1>
			{:else}
				<h1>{dayData.isRestDay ? 'Rest Day' : 'Review Day'}</h1>
			{/if}
		</div>

		{#if sessionStats}
			<div class="card stats-bar">
				<div class="stat">
					<span class="stat-value">{sessionStats.exerciseCount}</span>
					<span class="stat-label">Exercises</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat">
					<span class="stat-value">{sessionStats.completedSets}/{sessionStats.totalSets}</span>
					<span class="stat-label">Sets</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat">
					<span class="stat-value">{formatVolume(sessionStats.volume)}</span>
					<span class="stat-label">Volume <span class="stat-unit">{units}</span></span>
				</div>
			</div>
		{/if}

		{#if dayData.exercises.length > 0}
			<div class="group">
				<p class="group-label">Exercises</p>
				<div class="card">
					{#each dayData.exercises as ex, i (ex.exercisedbId)}
						{#if i > 0}<div class="divider"></div>{/if}
						<div class="exercise-row">
							<div class="exercise-header">
								<a href="/exercise/{ex.exercisedbId}" class="exercise-name">
									{ex.exerciseName}
								</a>
								{#if ex.allCompleted}
									<span class="check">✓</span>
								{/if}
							</div>
							{#if ex.sets.length > 0}
								<div class="sets">
									{#each ex.sets as s}
										<span class="set" class:incomplete={!s.completed}>
											{formatSet(s.weight, s.reps)}
										</span>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else if dayData.isRestDay}
			<div class="card empty-state">
				<p>Rest day — no exercises scheduled.</p>
			</div>
		{:else if dayData.isReviewDay}
			<div class="card empty-state">
				<p>Review day — time to reflect on the week.</p>
			</div>
		{/if}

	{:else}
		<div class="session-header">
			<h1>Session Not Found</h1>
			<p class="session-date">No data for {dateParam}</p>
		</div>
	{/if}
</div>

<style>
	.session-page {
		max-width: 480px;
		margin: 0 auto;
		padding: 0 1rem 6rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.session-header {
		text-align: center;
		padding: 0.5rem 0 0.25rem;
	}

	.session-date {
		font-size: 0.875rem;
		color: #999;
		margin: 0;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0;
	}

	/* Groups */
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

	/* Cards */
	.card {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 12px;
		overflow: hidden;
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

	.stat-unit {
		font-size: 0.6875rem;
		font-weight: 500;
		color: #bbb;
		text-transform: lowercase;
	}

	.stat-divider {
		width: 1px;
		height: 2.5rem;
		background: #f0f0f0;
	}

	/* Exercise rows */
	.exercise-row {
		padding: 0.625rem 1rem;
	}

	.exercise-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.exercise-name {
		font-size: 0.9375rem;
		font-weight: 500;
		color: #000;
		text-decoration: none;
	}

	.exercise-name:hover {
		text-decoration: underline;
	}

	.check {
		font-size: 0.8125rem;
		color: #000;
		font-weight: 600;
	}

	.sets {
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: #666;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.set.incomplete {
		color: #bbb;
	}

	.divider {
		height: 1px;
		background: #f0f0f0;
		margin: 0 1rem;
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
</style>

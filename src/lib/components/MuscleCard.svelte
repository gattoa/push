<script lang="ts">
	import type { WeekMomentum, BodyPartExerciseDetail, BodyPartScheduledDetail } from '$lib/types';
	import BottomSheet from '$lib/components/BottomSheet.svelte';

	let { momentum }: {
		momentum: WeekMomentum;
	} = $props();

	const BODY_ZONES = [
		{ id: 'shoulders', label: 'Shoulders', bodyParts: ['SHOULDERS'] },
		{ id: 'torso', label: 'Chest & Back', bodyParts: ['CHEST', 'BACK'] },
		{ id: 'arms', label: 'Arms', bodyParts: ['UPPER ARMS', 'TRICEPS', 'FOREARMS'] },
		{ id: 'core', label: 'Core', bodyParts: ['WAIST', 'HIPS'] },
		{ id: 'upperLegs', label: 'Upper Legs', bodyParts: ['QUADRICEPS', 'THIGHS'] },
		{ id: 'calves', label: 'Calves', bodyParts: ['CALVES'] },
	];

	type BodyZone = typeof BODY_ZONES[number];

	let selectedZone: BodyZone | null = $state(null);
	let detailSheetOpen = $state(false);

	function zoneExerciseCount(zone: BodyZone): number {
		const seen = new Set<string>();
		for (const bp of zone.bodyParts) {
			for (const ex of (momentum.bodyPartExercises.get(bp) ?? [])) {
				seen.add(ex.exercisedbId);
			}
		}
		return seen.size;
	}

	function zoneScheduledCount(zone: BodyZone): number {
		const seen = new Set<string>();
		for (const bp of zone.bodyParts) {
			for (const ex of (momentum.bodyPartsScheduled.get(bp) ?? [])) {
				seen.add(ex.exercisedbId);
			}
		}
		return seen.size;
	}

	function zoneState(zone: BodyZone): 'none' | 'scheduled' | 'hit' {
		if (zoneExerciseCount(zone) > 0) return 'hit';
		if (zoneScheduledCount(zone) > 0) return 'scheduled';
		return 'none';
	}

	function openZone(zone: BodyZone) {
		selectedZone = zone;
		detailSheetOpen = true;
	}

	let selectedHitExercises = $derived.by(() => {
		if (!selectedZone) return [];
		const all: BodyPartExerciseDetail[] = [];
		const seen = new Set<string>();
		for (const bp of selectedZone.bodyParts) {
			for (const ex of (momentum.bodyPartExercises.get(bp) ?? [])) {
				if (!seen.has(ex.exercisedbId)) {
					seen.add(ex.exercisedbId);
					all.push(ex);
				}
			}
		}
		return all;
	});

	let selectedScheduledExercises = $derived.by(() => {
		if (!selectedZone) return [];
		const all: BodyPartScheduledDetail[] = [];
		const seen = new Set<string>();
		for (const bp of selectedZone.bodyParts) {
			for (const ex of (momentum.bodyPartsScheduled.get(bp) ?? [])) {
				if (!seen.has(ex.exercisedbId)) {
					seen.add(ex.exercisedbId);
					all.push(ex);
				}
			}
		}
		return all;
	});

</script>

<div class="muscle-card">
	<div class="card-header">
		<p class="card-label">Muscles Trained</p>
	</div>

	<div class="zone-stack">
		{#each BODY_ZONES as zone}
			{@const state = zoneState(zone)}
			{@const count = zoneExerciseCount(zone)}
			{@const scheduled = zoneScheduledCount(zone)}
			{@const total = count + scheduled}
			<button
				class="zone-row {state}"
				onclick={() => openZone(zone)}
			>
				<span class="zone-label">{zone.label}</span>
				<div class="zone-bar-track">
					{#if count > 0}
						<div
							class="zone-bar-fill"
							style="width: {Math.min(count / 4 * 100, 100)}%"
						></div>
					{:else if state === 'scheduled'}
						<div class="zone-bar-scheduled"></div>
					{/if}
				</div>
				{#if count > 0}
					<span class="zone-count">{count}</span>
				{:else if scheduled > 0}
					<span class="zone-count scheduled">{scheduled}</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if momentum.unmappedExercises.length > 0}
		<p class="unmapped-note">{momentum.unmappedExercises.length} exercise{momentum.unmappedExercises.length === 1 ? '' : 's'} not mapped to body parts</p>
	{/if}
</div>

<BottomSheet bind:open={detailSheetOpen} title={selectedZone?.label ?? ''}>
	{#snippet children()}
		<div class="detail-content">
			{#if selectedHitExercises.length > 0}
				<p class="detail-section-label">This Week — {selectedHitExercises.length} exercise{selectedHitExercises.length === 1 ? '' : 's'}</p>
				{#each selectedHitExercises as ex}
					<a href="/exercise/{ex.exercisedbId}" class="detail-row">
						<span class="detail-name">{ex.exerciseName}</span>
						<span class="detail-sets">{ex.sets} sets</span>
					</a>
				{/each}
			{/if}

			{#if selectedScheduledExercises.length > 0}
				<p class="detail-section-label">Coming Up</p>
				{#each selectedScheduledExercises as ex}
					<a href="/exercise/{ex.exercisedbId}" class="detail-row">
						<span class="detail-name">{ex.exerciseName}</span>
						<span class="detail-day">{ex.dayLabel}</span>
					</a>
				{/each}
			{/if}

			{#if selectedHitExercises.length === 0 && selectedScheduledExercises.length === 0}
				<p class="detail-empty">No exercises for this area this week</p>
			{/if}
		</div>
	{/snippet}
</BottomSheet>

<style>
	.muscle-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.card-header {
		padding: 0 0.25rem;
	}

	.card-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin: 0;
	}

	/* Zone stack */
	.zone-stack {
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-radius: 12px;
		overflow: hidden;
	}

	.zone-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		min-height: 48px;
		background: #fafafa;
		border: none;
		cursor: pointer;
		font-family: inherit;
		-webkit-tap-highlight-color: transparent;
		transition: background 0.15s ease;
	}

	.zone-row:active {
		background: #f0f0f0;
	}

	.zone-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #999;
		width: 5.5rem;
		flex-shrink: 0;
		text-align: left;
	}

	.zone-row.hit .zone-label {
		color: #333;
	}

	/* Bar track */
	.zone-bar-track {
		flex: 1;
		height: 6px;
		background: #eee;
		border-radius: 3px;
		overflow: hidden;
	}

	.zone-bar-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.4s ease;
	}

	.zone-bar-fill {
		background: #1a1a1a;
	}

	.zone-bar-scheduled {
		width: 100%;
		height: 100%;
		background: repeating-linear-gradient(
			90deg,
			#ddd 0px,
			#ddd 4px,
			transparent 4px,
			transparent 8px
		);
		border-radius: 3px;
	}

	/* Exercise count */
	.zone-count {
		font-size: 0.75rem;
		font-weight: 600;
		color: #000;
		width: 1.5rem;
		text-align: right;
		flex-shrink: 0;
	}

	.zone-count.scheduled {
		color: #bbb;
	}

	/* Unmapped */
	.unmapped-note {
		font-size: 0.6875rem;
		color: #bbb;
		margin: 0;
		text-align: center;
	}

	/* Detail sheet */
	.detail-content {
		padding: 0 0 0.5rem;
	}

	.detail-section-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin: 0;
		padding: 0.75rem 1.25rem 0.25rem;
	}

	.detail-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.25rem;
		text-decoration: none;
		color: inherit;
		border-bottom: 1px solid #f0f0f0;
	}

	.detail-row:hover {
		background: #fafafa;
	}

	.detail-name {
		font-size: 0.9375rem;
		font-weight: 500;
		color: #000;
	}

	.detail-sets {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #999;
	}

	.detail-day {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #bbb;
	}

	.detail-empty {
		font-size: 0.875rem;
		color: #999;
		text-align: center;
		padding: 1.5rem 1.25rem;
		margin: 0;
	}
</style>

<script lang="ts">
	import type { WeekMomentum, BodyPartExerciseDetail, BodyPartScheduledDetail } from '$lib/mock/profile';
	import { BODY_REGIONS, getBodyRegion } from '$lib/mock/profile';
	import BottomSheet from '$lib/components/BottomSheet.svelte';

	let { momentum }: {
		momentum: WeekMomentum;
	} = $props();

	let selectedBodyPart: string | null = $state(null);
	let detailSheetOpen = $state(false);

	// Collect all unique body parts from the plan, grouped by region
	const groupedBodyParts = $derived(() => {
		const all = new Set<string>();
		// From hit
		for (const bp of momentum.bodyPartsHit.keys()) all.add(bp);
		// From scheduled
		for (const bp of momentum.bodyPartsScheduled.keys()) all.add(bp);
		// From day completions
		for (const day of momentum.dayCompletions) {
			for (const bp of day.bodyParts) all.add(bp);
		}

		const groups: { region: string; parts: string[] }[] = [];
		for (const [region, regionParts] of Object.entries(BODY_REGIONS)) {
			const matching = regionParts.filter(bp => all.has(bp));
			if (matching.length > 0) {
				groups.push({ region, parts: matching });
			}
		}
		// Handle any body parts not in known regions
		const knownParts = new Set(Object.values(BODY_REGIONS).flat());
		const unknown = [...all].filter(bp => !knownParts.has(bp));
		if (unknown.length > 0) {
			groups.push({ region: 'Other', parts: unknown });
		}
		return groups;
	});

	function bodyPartState(bodyPart: string): 'none' | 'hit' | 'heavy' | 'scheduled' {
		const sets = momentum.bodyPartsHit.get(bodyPart) ?? 0;
		if (sets >= 6) return 'heavy';
		if (sets > 0) return 'hit';
		if (momentum.bodyPartsScheduled.has(bodyPart)) return 'scheduled';
		return 'none';
	}

	function formatBodyPartLabel(bp: string): string {
		return bp.charAt(0) + bp.slice(1).toLowerCase();
	}

	function openDetail(bodyPart: string) {
		selectedBodyPart = bodyPart;
		detailSheetOpen = true;
	}

	let selectedHitExercises = $derived(
		selectedBodyPart ? (momentum.bodyPartExercises.get(selectedBodyPart) ?? []) : []
	);

	let selectedScheduledExercises = $derived(
		selectedBodyPart ? (momentum.bodyPartsScheduled.get(selectedBodyPart) ?? []) : []
	);
</script>

<div class="muscle-card">
	<div class="card-header">
		<p class="card-label">Muscles Trained</p>
		<span class="coverage-count">{momentum.bodyPartsHitCount}/{momentum.totalBodyParts}</span>
	</div>

	{#each groupedBodyParts() as group}
		<div class="body-region">
			{#if groupedBodyParts().length > 1}
				<span class="region-label">{group.region}</span>
			{/if}
			<div class="pill-row">
				{#each group.parts as bp}
					{@const state = bodyPartState(bp)}
					{@const sets = momentum.bodyPartsHit.get(bp) ?? 0}
					<button
						class="body-pill {state}"
						onclick={() => openDetail(bp)}
					>
						<span class="pill-name">{formatBodyPartLabel(bp)}</span>
						{#if state === 'hit' || state === 'heavy'}
							<span class="pill-sets">{sets} sets</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/each}

	{#if momentum.unmappedExercises.length > 0}
		<p class="unmapped-note">{momentum.unmappedExercises.length} exercise{momentum.unmappedExercises.length === 1 ? '' : 's'} not tracked</p>
	{/if}
</div>

<BottomSheet bind:open={detailSheetOpen} title={selectedBodyPart ? formatBodyPartLabel(selectedBodyPart) : ''}>
	{#snippet children()}
		<div class="detail-content">
			{#if selectedHitExercises.length > 0}
				<p class="detail-section-label">This Week</p>
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
				<p class="detail-empty">No exercises for this muscle this week</p>
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
		display: flex;
		justify-content: space-between;
		align-items: center;
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

	.coverage-count {
		font-size: 0.75rem;
		font-weight: 700;
		color: #000;
	}

	/* Body regions */
	.body-region {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.region-label {
		font-size: 0.6875rem;
		font-weight: 500;
		color: #bbb;
		padding-left: 0.25rem;
	}

	.pill-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	/* Pills */
	.body-pill {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		min-height: 44px;
		border-radius: 100px;
		border: 1px solid #e8e8e8;
		background: #fff;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.body-pill:active {
		transform: scale(0.96);
	}

	.body-pill.hit {
		background: #f5f5f5;
		border-color: #ccc;
	}

	.body-pill.heavy {
		background: #000;
		border-color: #000;
	}

	.body-pill.scheduled {
		border-style: dashed;
		border-color: #ccc;
	}

	.pill-name {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #bbb;
	}

	.body-pill.hit .pill-name {
		color: #333;
	}

	.body-pill.heavy .pill-name {
		color: #fff;
	}

	.body-pill.scheduled .pill-name {
		color: #999;
	}

	.pill-sets {
		font-size: 0.6875rem;
		font-weight: 600;
		color: #999;
	}

	.body-pill.heavy .pill-sets {
		color: rgba(255, 255, 255, 0.7);
	}

	/* Unmapped note */
	.unmapped-note {
		font-size: 0.6875rem;
		color: #bbb;
		margin: 0;
		padding-left: 0.25rem;
	}

	/* Detail sheet content */
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

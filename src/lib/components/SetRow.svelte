<script lang="ts">
	import type { PlannedSet, SetLog } from '$lib/types';
	import { getPreferences } from '$lib/stores/preferences';
	import { toggleSet, updateSet, updateDropLog } from '$lib/stores/workout.svelte';

	let { plannedSet, setLog }: {
		plannedSet: PlannedSet;
		setLog: SetLog;
	} = $props();

	const units = getPreferences().units;
	let isDrop = $derived(plannedSet.set_type === 'drop');
	let completed = $derived(setLog.completed);
	let weight = $derived(setLog.actual_weight ?? plannedSet.target_weight ?? 0);
	let reps = $derived(setLog.actual_reps ?? plannedSet.target_reps);

	let weightChanged = $derived(
		setLog.actual_weight !== null && setLog.actual_weight !== plannedSet.target_weight
	);
	let repsChanged = $derived(
		setLog.actual_reps !== null && setLog.actual_reps !== plannedSet.target_reps
	);

	function toggle() { toggleSet(setLog.id); }

	function onWeightChange(e: Event) {
		updateSet(setLog.id, { actual_weight: Number((e.target as HTMLInputElement).value) });
	}
	function onRepsChange(e: Event) {
		updateSet(setLog.id, { actual_reps: Number((e.target as HTMLInputElement).value) });
	}
	function onDropWeightChange(index: number, e: Event) {
		updateDropLog(setLog.id, index, { actual_weight: Number((e.target as HTMLInputElement).value) });
	}
	function onDropRepsChange(index: number, e: Event) {
		updateDropLog(setLog.id, index, { actual_reps: Number((e.target as HTMLInputElement).value) });
	}
	function wl(w: number | null): string { return w === null ? 'BW' : `${w}`; }
</script>

<div class="row" class:completed class:warmup={plannedSet.set_type === 'warmup'}>
	<span class="set-num">{plannedSet.set_number}</span>
	{#if plannedSet.set_type === 'warmup'}<span class="tag">warm</span>{/if}

	<div class="values">
		{#if plannedSet.target_weight === null}
			<span class="bw">BW</span>
		{:else}
			<input type="number" value={weight} onchange={onWeightChange} min="0"
				class="val" class:changed={weightChanged} />
		{/if}
		<span class="x">&times;</span>
		<input type="number" value={reps} onchange={onRepsChange} min="0"
			class="val reps-val" class:changed={repsChanged} />
		{#if weightChanged || repsChanged}
			<span class="was">{wl(plannedSet.target_weight)}&times;{plannedSet.target_reps}</span>
		{/if}
	</div>

	<button class="tog" class:done={completed} onclick={toggle}>
		{#if completed}<span class="ck">&#10003;</span>{/if}
	</button>
</div>

{#if isDrop && plannedSet.drops}
	{#each plannedSet.drops as drop, i}
		{@const dw = setLog.drop_logs?.[i]?.actual_weight ?? drop.target_weight ?? 0}
		{@const dr = setLog.drop_logs?.[i]?.actual_reps ?? drop.target_reps}
		<div class="row drop" class:completed>
			<span class="tag">drop</span>
			<div class="values">
				{#if drop.target_weight === null}
					<span class="bw">BW</span>
				{:else}
					<input type="number" value={dw} onchange={(e) => onDropWeightChange(i, e)} min="0" class="val sm" />
				{/if}
				<span class="x">&times;</span>
				<input type="number" value={dr} onchange={(e) => onDropRepsChange(i, e)} min="0" class="val reps-val sm" />
			</div>
			<span class="tog-spacer"></span>
		</div>
	{/each}
{/if}

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0;
		border-bottom: 1px solid #f0f0f0;
		transition: opacity 0.15s;
	}
	.row:last-child { border-bottom: none; }
	.row.completed { opacity: 0.4; }
	.row.drop { padding-left: 0; }
	.row.warmup { background: #fafafa; }

	.set-num {
		font-size: 0.875rem;
		font-weight: 700;
		color: #000;
		min-width: 0.875rem;
	}
	.tag {
		font-size: 0.5625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: #aaa;
		min-width: 0.875rem;
	}

	.values {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.val {
		width: 42px;
		padding: 0.1875rem 0;
		border: none;
		border-bottom: 1.5px solid transparent;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 600;
		color: #000;
		text-align: center;
		background: none;
		appearance: textfield;
		-moz-appearance: textfield;
	}
	.val::-webkit-inner-spin-button,
	.val::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.val:focus {
		outline: none;
		border-bottom-color: #000;
	}
	.val.changed {
		color: #0066cc;
	}
	.val.sm {
		width: 36px;
		font-size: 0.8125rem;
	}
	.reps-val { width: 32px; }
	.reps-val.sm { width: 28px; }

	.bw {
		font-size: 0.875rem;
		font-weight: 600;
		color: #999;
		width: 42px;
		text-align: center;
	}

	.x {
		font-size: 0.6875rem;
		color: #ccc;
		font-weight: 500;
	}

	.was {
		font-size: 0.5625rem;
		color: #bbb;
		font-weight: 500;
		white-space: nowrap;
		margin-left: 0.125rem;
	}

	.tog {
		margin-left: auto;
		width: 26px;
		height: 26px;
		min-width: 26px;
		border-radius: 50%;
		border: 1.5px solid #ddd;
		background: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition: all 0.15s;
	}
	.tog:active { transform: scale(0.9); }
	.tog.done {
		background: #000;
		border-color: #000;
		color: #fff;
	}
	.ck { font-size: 0.625rem; font-weight: 700; }

	.tog-spacer {
		margin-left: auto;
		width: 26px;
		min-width: 26px;
	}
</style>

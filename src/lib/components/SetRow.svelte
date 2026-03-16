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

	function toggle() {
		toggleSet(setLog.id);
	}

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

	function weightLabel(w: number | null): string {
		return w === null ? 'BW' : `${w}`;
	}
</script>

<div class="set-card" class:completed>
	<div class="set-header">
		<div class="set-id">
			<span class="set-number">Set {plannedSet.set_number}</span>
			{#if isDrop}
				<span class="set-type">drop</span>
			{:else if plannedSet.set_type === 'warmup'}
				<span class="set-type">warmup</span>
			{/if}
		</div>
		<button class="toggle-btn" class:done={completed} onclick={toggle}>
			{#if completed}
				<span class="check-icon">&#10003;</span>
			{:else}
				<span class="circle-icon"></span>
			{/if}
		</button>
	</div>

	<div class="set-target">
		Target: {weightLabel(plannedSet.target_weight)}{plannedSet.target_weight !== null ? ` ${units}` : ''} &times; {plannedSet.target_reps}
	</div>

	<div class="set-actual">
		<label class="input-group">
			<input
				type="number"
				value={weight}
				onchange={onWeightChange}
				min="0"
				disabled={plannedSet.target_weight === null}
				class="num-input weight-input"
			/>
			<span class="input-label">{plannedSet.target_weight === null ? 'BW' : units}</span>
		</label>
		<span class="times">&times;</span>
		<label class="input-group">
			<input
				type="number"
				value={reps}
				onchange={onRepsChange}
				min="0"
				class="num-input reps-input"
			/>
			<span class="input-label">reps</span>
		</label>
	</div>

	{#if isDrop && plannedSet.drops}
		<div class="drops">
			{#each plannedSet.drops as drop, i}
				<div class="drop-row">
					<span class="drop-arrow">&#8595;</span>
					<div class="drop-target">
						{weightLabel(drop.target_weight)}{drop.target_weight !== null ? ` ${units}` : ''} &times; {drop.target_reps}
					</div>
					<div class="drop-actual">
						<label class="input-group">
							<input
								type="number"
								value={setLog.drop_logs?.[i]?.actual_weight ?? drop.target_weight ?? 0}
								onchange={(e) => onDropWeightChange(i, e)}
								min="0"
								disabled={drop.target_weight === null}
								class="num-input weight-input sm"
							/>
							<span class="input-label">{drop.target_weight === null ? 'BW' : units}</span>
						</label>
						<span class="times">&times;</span>
						<label class="input-group">
							<input
								type="number"
								value={setLog.drop_logs?.[i]?.actual_reps ?? drop.target_reps}
								onchange={(e) => onDropRepsChange(i, e)}
								min="0"
								class="num-input reps-input sm"
							/>
							<span class="input-label">reps</span>
						</label>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.set-card {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 12px;
		padding: 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		transition: opacity 0.2s ease;
	}

	.set-card.completed {
		opacity: 0.5;
	}

	.set-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.set-id {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.set-number {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #000;
	}

	.set-type {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #999;
		background: #f2f2f2;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
	}

	.toggle-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: inherit;
		transition: all 0.15s;
		background: #f2f2f2;
		color: #999;
	}

	.toggle-btn:active {
		transform: scale(0.9);
	}

	.toggle-btn.done {
		background: #000;
		color: #fff;
	}

	.check-icon {
		font-size: 0.8125rem;
		font-weight: 700;
	}

	.circle-icon {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid #ccc;
	}

	.set-target {
		font-size: 0.6875rem;
		color: #999;
		font-weight: 500;
	}

	.set-actual {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 0.125rem;
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.num-input {
		width: 56px;
		padding: 0.375rem 0.5rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #000;
		text-align: center;
		background: #fafafa;
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.num-input::-webkit-inner-spin-button,
	.num-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.num-input:focus {
		outline: none;
		border-color: #000;
		background: #fff;
	}

	.num-input:disabled {
		background: #f5f5f5;
		color: #999;
	}

	.num-input.sm {
		width: 48px;
		font-size: 0.8125rem;
		padding: 0.25rem 0.375rem;
	}

	.reps-input {
		width: 44px;
	}

	.reps-input.sm {
		width: 40px;
	}

	.input-label {
		font-size: 0.6875rem;
		color: #999;
		font-weight: 500;
	}

	.times {
		font-size: 0.75rem;
		color: #ccc;
		font-weight: 600;
	}

	.drops {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin-top: 0.25rem;
		padding-top: 0.375rem;
		border-top: 1px dashed #e8e8e8;
	}

	.drop-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.drop-arrow {
		font-size: 0.75rem;
		color: #ccc;
		font-weight: 700;
	}

	.drop-target {
		font-size: 0.625rem;
		color: #bbb;
		font-weight: 500;
		min-width: 60px;
	}

	.drop-actual {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
</style>

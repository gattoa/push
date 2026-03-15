<script lang="ts">
	import type { PlannedSet, SetLog } from '$lib/types';
	import { getPreferences } from '$lib/stores/preferences';

	let { plannedSet, setLog, onComplete }: {
		plannedSet: PlannedSet;
		setLog: SetLog;
		onComplete?: () => void;
	} = $props();

	const units = getPreferences().units;

	function toggle() {
		setLog.completed = !setLog.completed;
		if (setLog.completed) {
			setLog.actual_reps = plannedSet.target_reps;
			setLog.actual_weight = plannedSet.target_weight;
			if (plannedSet.drops && setLog.drop_logs) {
				for (let i = 0; i < plannedSet.drops.length; i++) {
					setLog.drop_logs[i] = {
						actual_reps: plannedSet.drops[i].target_reps,
						actual_weight: plannedSet.drops[i].target_weight
					};
				}
			}
			onComplete?.();
		} else {
			setLog.actual_reps = null;
			setLog.actual_weight = null;
			if (setLog.drop_logs) {
				for (let i = 0; i < setLog.drop_logs.length; i++) {
					setLog.drop_logs[i] = { actual_reps: null, actual_weight: null };
				}
			}
		}
	}

	function weightLabel(w: number | null): string {
		return w === null ? 'BW' : `${w}`;
	}

	// Build all stacks: first stack from the set itself, then each drop
	const stacks = $derived(() => {
		const result = [{ reps: plannedSet.target_reps, weight: plannedSet.target_weight }];
		if (plannedSet.drops) {
			for (const drop of plannedSet.drops) {
				result.push({ reps: drop.target_reps, weight: drop.target_weight });
			}
		}
		return result;
	});
</script>

<button
	class="drop-container"
	class:completed={setLog.completed}
	onclick={toggle}
	aria-label={setLog.completed ? `Undo drop set ${plannedSet.set_number}` : `Complete drop set ${plannedSet.set_number}`}
>
	<span class="drop-label">drop</span>
	<div class="drop-stacks">
		{#each stacks() as stack, i}
			{#if i > 0}
				<span class="arrow">→</span>
			{/if}
			<div class="stack">
				<span class="reps">
					{#if setLog.completed && i === 0}<span class="check">✓</span>{/if}{stack.reps}
				</span>
				<span class="weight">{weightLabel(stack.weight)}</span>
			</div>
		{/each}
	</div>
</button>

<style>
	.drop-container {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.375rem 0.625rem;
		background: #f8f8f8;
		border: 1px solid #e0e0e0;
		border-radius: 10px;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
		min-height: 44px;
	}

	.drop-container:active {
		transform: scale(0.96);
	}

	.drop-container.completed {
		opacity: 0.4;
	}

	.drop-label {
		font-size: 0.5625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #999;
		line-height: 1;
	}

	.drop-stacks {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.stack {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
		min-width: 32px;
	}

	.reps {
		font-size: 1.0625rem;
		font-weight: 700;
		color: #000;
		line-height: 1.2;
	}

	.drop-container.completed .reps {
		text-decoration: line-through;
	}

	.check {
		font-size: 0.75rem;
		margin-right: 0.125rem;
	}

	.weight {
		font-size: 0.6875rem;
		font-weight: 500;
		color: #999;
		line-height: 1.2;
	}

	.arrow {
		font-size: 0.75rem;
		color: #bbb;
		font-weight: 600;
		padding-bottom: 0.5rem; /* vertically center between stacks */
	}
</style>

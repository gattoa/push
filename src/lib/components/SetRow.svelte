<script lang="ts">
	import type { PlannedSet, SetLog } from '$lib/types';
	import { getPreferences } from '$lib/stores/preferences';

	let { plannedSet, setLog }: {
		plannedSet: PlannedSet;
		setLog: SetLog;
	} = $props();

	const units = getPreferences().units;

	let completed = $derived(setLog.completed);
	let weight = $derived(setLog.actual_weight ?? plannedSet.target_weight ?? 0);
	let reps = $derived(setLog.actual_reps ?? plannedSet.target_reps);

	function toggle() {
		setLog.completed = !setLog.completed;
		if (setLog.completed) {
			setLog.actual_weight = weight;
			setLog.actual_reps = reps;
		}
	}

	function updateWeight(e: Event) {
		setLog.actual_weight = Number((e.target as HTMLInputElement).value);
	}

	function updateReps(e: Event) {
		setLog.actual_reps = Number((e.target as HTMLInputElement).value);
	}
</script>

<div>
	<label>
		<input type="checkbox" checked={completed} onchange={toggle} />
		Set {plannedSet.set_number}:
	</label>
	<label>
		<input type="number" value={weight} onchange={updateWeight} min="0" style="width:60px" />
		{plannedSet.target_weight === null ? '(bw)' : units}
	</label>
	x
	<label>
		<input type="number" value={reps} onchange={updateReps} min="0" style="width:50px" />
		reps
	</label>
</div>

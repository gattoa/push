<script lang="ts">
	import type { PlannedSet, SetLog } from '$lib/types';
	import { getPreferences } from '$lib/stores/preferences';

	let { plannedSet, setLog }: {
		plannedSet: PlannedSet;
		setLog: SetLog;
	} = $props();

	const units = getPreferences().units;

	function toggle() {
		setLog.completed = !setLog.completed;
		if (setLog.completed) {
			setLog.actual_reps = plannedSet.target_reps;
			setLog.actual_weight = plannedSet.target_weight;
		}
	}
</script>

<label>
	<input type="checkbox" checked={setLog.completed} onchange={toggle} />
	{plannedSet.target_weight === null ? 'BW' : `${plannedSet.target_weight} ${units}`} x {plannedSet.target_reps}
</label>

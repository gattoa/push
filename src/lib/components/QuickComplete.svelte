<script lang="ts">
	import type { PlannedSet, SetLog } from '$lib/types';

	let { plannedSets, setLogs }: {
		plannedSets: PlannedSet[];
		setLogs: SetLog[];
	} = $props();

	let allDone = $derived(setLogs.every(s => s.completed));

	function quickComplete() {
		for (const log of setLogs) {
			const planned = plannedSets.find(ps => ps.id === log.planned_set_id);
			if (planned) {
				log.completed = true;
				log.actual_reps = planned.target_reps;
				log.actual_weight = planned.target_weight;
			}
		}
	}
</script>

<button onclick={quickComplete} disabled={allDone}>
	{allDone ? 'Completed' : 'Quick Complete'}
</button>

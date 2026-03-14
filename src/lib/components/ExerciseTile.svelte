<script lang="ts">
	import type { PlannedExercise, PlannedSet, SetLog } from '$lib/types';
	import SetCheckbox from './SetCheckbox.svelte';

	let { exercise, plannedSets, setLogs }: {
		exercise: PlannedExercise;
		plannedSets: PlannedSet[];
		setLogs: SetLog[];
	} = $props();
</script>

<div>
	<div><a href="/exercise/{exercise.exercisedb_id}">{exercise.exercise_name}</a></div>
	{#each plannedSets as ps (ps.id)}
		{@const log = setLogs.find(s => s.planned_set_id === ps.id)}
		{#if log}
			<div><SetCheckbox plannedSet={ps} setLog={log} /></div>
		{/if}
	{/each}
</div>

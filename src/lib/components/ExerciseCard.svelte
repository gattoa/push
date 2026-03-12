<script lang="ts">
	export let exercise: { id: string; name: string; muscle_group?: string };
</script>

<div>
	<a href="/exercise/{exercise.id}">
		<h3>{exercise.name}</h3>
		{#if exercise.muscle_group}<p>{exercise.muscle_group}</p>{/if}
	</a>
</div>

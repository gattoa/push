<script lang="ts">
	import { onMount } from 'svelte';

	type ApiStatus = 'checking' | 'connected' | 'error' | 'not-checked';

	let supabaseStatus: ApiStatus = 'not-checked';
	let anthropicStatus: ApiStatus = 'not-checked';
	let exercisedbStatus: ApiStatus = 'not-checked';

	let supabaseError = '';
	let anthropicError = '';
	let exercisedbError = '';

	onMount(() => {
		checkAllApis();
	});

	async function checkAllApis() {
		await Promise.all([checkSupabase(), checkAnthropic(), checkExerciseDB()]);
	}

	async function checkSupabase() {
		supabaseStatus = 'checking';
		try {
			const response = await fetch('/api/test-supabase');
			const data = await response.json();
			if (data.success) {
				supabaseStatus = 'connected';
				supabaseError = '';
			} else {
				supabaseStatus = 'error';
				supabaseError = data.error || 'Unknown error';
			}
		} catch (e: any) {
			supabaseStatus = 'error';
			supabaseError = e.message;
		}
	}

	async function checkAnthropic() {
		anthropicStatus = 'checking';
		try {
			const response = await fetch('/api/test-anthropic', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: 'Test connection' })
			});
			const data = await response.json();
			if (data.success) {
				anthropicStatus = 'connected';
				anthropicError = '';
			} else {
				anthropicStatus = 'error';
				anthropicError = data.error || 'Unknown error';
			}
		} catch (e: any) {
			anthropicStatus = 'error';
			anthropicError = e.message;
		}
	}

	async function checkExerciseDB() {
		exercisedbStatus = 'checking';
		try {
			const response = await fetch('/api/exercisedb-search?q=push+up');
			const data = await response.json();
			if (data.success) {
				exercisedbStatus = 'connected';
				exercisedbError = '';
			} else {
				exercisedbStatus = 'error';
				exercisedbError = data.error || 'Unknown error';
			}
		} catch (e: any) {
			exercisedbStatus = 'error';
			exercisedbError = e.message;
		}
	}

	function getStatusSymbol(status: ApiStatus): string {
		switch (status) {
			case 'checking':
				return '⟳';
			case 'connected':
				return '✓';
			case 'error':
				return '✗';
			default:
				return '○';
		}
	}

	function getStatusColor(status: ApiStatus): string {
		switch (status) {
			case 'checking':
				return '#999';
			case 'connected':
				return '#0a0';
			case 'error':
				return '#d00';
			default:
				return '#666';
		}
	}
</script>

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background: #f9f9f9;">
	<h4 style="margin: 0 0 10px 0; font-size: 14px;">API Status</h4>
	<div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px;">
		<div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
			<span style="font-weight: bold; font-size: 16px; width: 20px; text-align: center; color: {getStatusColor(supabaseStatus)}">
				{getStatusSymbol(supabaseStatus)}
			</span>
			<span style="flex: 1;">Supabase</span>
			{#if supabaseStatus === 'error' && supabaseError}
				<span style="color: #d00; cursor: help;" title={supabaseError}>⚠</span>
			{/if}
		</div>
		<div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
			<span style="font-weight: bold; font-size: 16px; width: 20px; text-align: center; color: {getStatusColor(anthropicStatus)}">
				{getStatusSymbol(anthropicStatus)}
			</span>
			<span style="flex: 1;">Claude</span>
			{#if anthropicStatus === 'error' && anthropicError}
				<span style="color: #d00; cursor: help;" title={anthropicError}>⚠</span>
			{/if}
		</div>
		<div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
			<span style="font-weight: bold; font-size: 16px; width: 20px; text-align: center; color: {getStatusColor(exercisedbStatus)}">
				{getStatusSymbol(exercisedbStatus)}
			</span>
			<span style="flex: 1;">ExerciseDB</span>
			{#if exercisedbStatus === 'error' && exercisedbError}
				<span style="color: #d00; cursor: help;" title={exercisedbError}>⚠</span>
			{/if}
		</div>
	</div>
	<button style="padding: 5px 10px; font-size: 12px; cursor: pointer;" on:click={checkAllApis}>Recheck All</button>
</div>

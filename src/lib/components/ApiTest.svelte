<script lang="ts">
	let supabaseStatus = 'Not tested';
	let anthropicStatus = 'Not tested';
	let exercisedbStatus = 'Not tested';

	async function testSupabase() {
		try {
			const response = await fetch('/api/test-supabase');
			const data = await response.json();
			supabaseStatus = data.success ? 'Connected ✓' : 'Failed: ' + data.error;
		} catch (e: any) {
			supabaseStatus = 'Failed: ' + e.message;
		}
	}

	async function testAnthropic() {
		try {
			const response = await fetch('/api/test-anthropic', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: 'Test connection' })
			});
			const data = await response.json();
			anthropicStatus = data.success ? 'Connected ✓' : 'Failed: ' + data.error;
		} catch (e: any) {
			anthropicStatus = 'Failed: ' + e.message;
		}
	}

	async function testExerciseDB() {
		try {
			const response = await fetch('/api/exercisedb-search?q=push+up');
			const data = await response.json();
			exercisedbStatus = data.success ? 'Connected ✓' : 'Failed: ' + data.error;
		} catch (e: any) {
			exercisedbStatus = 'Failed: ' + e.message;
		}
	}
</script>

<div>
	<h3>API Tests</h3>
	<div><button on:click={testSupabase}>Test Supabase</button> {supabaseStatus}</div>
	<div><button on:click={testAnthropic}>Test Claude</button> {anthropicStatus}</div>
	<div><button on:click={testExerciseDB}>Test ExerciseDB</button> {exercisedbStatus}</div>
</div>

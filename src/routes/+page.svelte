<script lang="ts">
	import ApiStatusIndicator from '$lib/components/ApiStatusIndicator.svelte';
	import ApiTest from '$lib/components/ApiTest.svelte';
</script>

<h1>Push Workout Tracker</h1>

<ApiStatusIndicator />
<ApiTest />

<h2>Sample Exercises</h2>
<ul>
	<li><a href="/exercise/exr_41n2hxnFMotsXTj3">Bench Press</a></li>
	<li><a href="/exercise/exr_41n2hs6camM22yBG">Seated Shoulder Press</a></li>
	<li><a href="/exercise/exr_41n2hMRXm49mM62z">Arnold Press</a></li>
</ul>

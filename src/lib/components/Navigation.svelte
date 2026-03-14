<script lang="ts">
	import { page } from '$app/stores';
	$: currentPath = $page.url.pathname;
</script>

<nav>
	<a href="/settings" aria-current={currentPath === '/settings' ? 'page' : undefined}>Settings</a>
	<a href="/" aria-current={currentPath === '/' ? 'page' : undefined}>Today</a>
	<a href="/profile" aria-current={currentPath === '/profile' ? 'page' : undefined}>Profile</a>
</nav>

<script lang="ts">
	import { page } from '$app/stores';
	$: currentPath = $page.url.pathname;
</script>

<nav>
	<a href="/" aria-current={currentPath === '/' ? 'page' : undefined}>Home</a>
	<a href="/profile" aria-current={currentPath === '/profile' ? 'page' : undefined}>Profile</a>
	<a href="/settings" aria-current={currentPath === '/settings' ? 'page' : undefined}>Settings</a>
</nav>

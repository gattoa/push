<script lang="ts">
	import { page } from '$app/stores';
	$: currentPath = $page.url.pathname;
</script>

<nav>
	<a href="/settings" aria-current={currentPath === '/settings' ? 'page' : undefined}>Settings</a>
	<a href="/" aria-current={currentPath === '/' ? 'page' : undefined}>Today</a>
	<a href="/profile" class="avatar-link" aria-current={currentPath === '/profile' ? 'page' : undefined}>
		<span class="nav-avatar">P</span>
	</a>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		padding: 0.75rem 0;
		background: #fff;
		border-bottom: 1px solid #e5e5e5;
		z-index: 100;
	}

	a {
		flex: 1;
		text-align: center;
		text-decoration: none;
		color: #888;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem 0;
	}

	a[aria-current='page'] {
		color: #000;
		font-weight: 700;
	}

	.avatar-link {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: #e8e8e8;
		color: #999;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 700;
	}

	a[aria-current='page'] .nav-avatar {
		background: #000;
		color: #fff;
	}
</style>

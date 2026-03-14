<script lang="ts">
	import { page } from '$app/stores';
	$: currentPath = $page.url.pathname;


</script>

<nav>
	<!-- Settings (left) -->
	<a href="/settings" class="nav-icon" aria-current={currentPath === '/settings' ? 'page' : undefined} aria-label="Settings">
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="3"></circle>
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
		</svg>
	</a>

	<!-- Today (center) -->
	<a href="/" class="nav-date" aria-current={currentPath === '/' ? 'page' : undefined}>
		Today
	</a>

	<!-- Profile (right) -->
	<a href="/profile" class="nav-icon" aria-current={currentPath === '/profile' ? 'page' : undefined} aria-label="Profile">
		<span class="nav-avatar">P</span>
	</a>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		max-width: 480px;
		margin: 0 auto;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		padding: 0.75rem 1.25rem;
		background: #fff;
		border-bottom: 1px solid #e5e5e5;
		z-index: 100;
	}

	a {
		text-decoration: none;
		color: #999;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	a[aria-current='page'] {
		color: #000;
	}

	.nav-icon {
		width: 40px;
		height: 40px;
	}

	.nav-icon svg {
		color: inherit;
	}

	/* Date (center) */
	.nav-date {
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: 0.01em;
	}

	/* Avatar */
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

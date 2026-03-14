<script lang="ts">
	import { page } from '$app/stores';
	$: currentPath = $page.url.pathname;


</script>

<nav>
	<!-- History (left) -->
	<a href="/history" class="nav-icon" aria-current={currentPath === '/history' ? 'page' : undefined} aria-label="History">
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="10"></circle>
			<polyline points="12 6 12 12 16 14"></polyline>
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

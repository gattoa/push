<script lang="ts">
	let { error = false, onretry }: {
		error?: boolean;
		onretry?: () => void;
	} = $props();
</script>

<div class="plan-loading">
	{#if error}
		<h1 class="title">Something went wrong</h1>
		<p class="subtitle">We couldn't build your plan. Check your connection and try again.</p>
		{#if onretry}
			<button class="retry-btn" onclick={onretry}>Try Again</button>
		{/if}
	{:else}
		<h1 class="title pulse">Building your plan...</h1>
		<div class="skeletons">
			<div class="skeleton-card">
				<div class="skeleton-line wide"></div>
				<div class="skeleton-line narrow"></div>
				<div class="skeleton-sets">
					<div class="skeleton-pill"></div>
					<div class="skeleton-pill"></div>
					<div class="skeleton-pill"></div>
				</div>
			</div>
			<div class="skeleton-card">
				<div class="skeleton-line wide"></div>
				<div class="skeleton-line narrow"></div>
				<div class="skeleton-sets">
					<div class="skeleton-pill"></div>
					<div class="skeleton-pill"></div>
					<div class="skeleton-pill"></div>
				</div>
			</div>
			<div class="skeleton-card">
				<div class="skeleton-line wide"></div>
				<div class="skeleton-line narrow"></div>
				<div class="skeleton-sets">
					<div class="skeleton-pill"></div>
					<div class="skeleton-pill"></div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.plan-loading {
		max-width: 480px;
		margin: 0 auto;
		padding: 3rem 1rem 6rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0;
		text-align: center;
		letter-spacing: -0.02em;
	}

	.title.pulse {
		animation: pulse 2s ease-in-out infinite;
	}

	.subtitle {
		font-size: 0.875rem;
		color: #999;
		text-align: center;
		margin: -0.5rem 0 0;
		line-height: 1.5;
	}

	.retry-btn {
		padding: 0.875rem 2rem;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	.retry-btn:hover {
		background: #222;
	}

	.skeletons {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.skeleton-card {
		background: #fafafa;
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-line {
		height: 14px;
		border-radius: 7px;
		background: #eee;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-line.wide {
		width: 60%;
	}

	.skeleton-line.narrow {
		width: 35%;
	}

	.skeleton-sets {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.skeleton-pill {
		height: 32px;
		width: 64px;
		border-radius: 8px;
		background: #eee;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-card:nth-child(2) .skeleton-line,
	.skeleton-card:nth-child(2) .skeleton-pill {
		animation-delay: 0.15s;
	}

	.skeleton-card:nth-child(3) .skeleton-line,
	.skeleton-card:nth-child(3) .skeleton-pill {
		animation-delay: 0.3s;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	@keyframes shimmer {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 0.3; }
	}
</style>

<script lang="ts">
	import { getPhotoBlob } from '$lib/stores/photos';

	let {
		photoId,
		date,
		open = $bindable(false)
	}: {
		photoId: string;
		date: string;
		open: boolean;
	} = $props();

	let blobUrl = $state<string | null>(null);
	let loading = $state(false);

	$effect(() => {
		if (open && photoId) {
			loading = true;
			getPhotoBlob(photoId).then(blob => {
				if (blob) {
					blobUrl = URL.createObjectURL(blob);
				}
				loading = false;
			});
		} else {
			if (blobUrl) {
				URL.revokeObjectURL(blobUrl);
				blobUrl = null;
			}
		}
	});

	function close() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	function formatDate(iso: string): string {
		const d = new Date(iso + 'T00:00:00');
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="overlay" onclick={close}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="viewer" onclick={(e) => e.stopPropagation()}>
			<button class="close-btn" onclick={close}>✕</button>
			{#if loading}
				<div class="loading">Loading...</div>
			{:else if blobUrl}
				<img src={blobUrl} alt="Progress photo from {date}" />
			{/if}
			<p class="date-caption">{formatDate(date)}</p>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.9);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.viewer {
		position: relative;
		max-width: 100%;
		max-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.viewer img {
		max-width: 100%;
		max-height: calc(100vh - 6rem);
		object-fit: contain;
		border-radius: 8px;
	}

	.close-btn {
		position: absolute;
		top: -2.5rem;
		right: 0;
		background: none;
		border: none;
		color: #fff;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		line-height: 1;
	}

	.date-caption {
		color: #999;
		font-size: 0.875rem;
		margin: 0;
	}

	.loading {
		color: #999;
		font-size: 0.875rem;
		padding: 4rem;
	}
</style>

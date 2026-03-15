<script lang="ts">
	import PhotoUpload from './PhotoUpload.svelte';
	import type { ProgressPhoto } from '$lib/stores/photos';
	import { addCheckInPhoto, completeCheckIn } from '$lib/stores/checkin';
	import { today as copy } from '$lib/copy';

	let { weekPlanId, ondismiss }: {
		weekPlanId: string;
		ondismiss: () => void;
	} = $props();

	let uploadedPhotos = $state<ProgressPhoto[]>([]);

	function handlePhotoUploaded(photo: ProgressPhoto) {
		uploadedPhotos.push(photo);
		addCheckInPhoto(weekPlanId, photo.id);
	}

	function handleDone() {
		completeCheckIn(weekPlanId);
		ondismiss();
	}
</script>

<div class="checkin-card">
	<div class="checkin-header">
		<span class="checkin-title">{copy.checkIn.title}</span>
		<span class="checkin-subtitle">{copy.checkIn.subtitle}</span>
	</div>

	{#if uploadedPhotos.length > 0}
		<div class="photo-strip">
			{#each uploadedPhotos as photo (photo.id)}
				<img src={photo.thumbnailUrl} alt="Progress" class="photo-thumb" />
			{/each}
		</div>
	{/if}

	<div class="checkin-actions">
		<PhotoUpload onupload={handlePhotoUploaded} />
		{#if uploadedPhotos.length > 0}
			<button class="done-btn" onclick={handleDone}>Done</button>
		{/if}
	</div>
</div>

<style>
	.checkin-card {
		background: #fff;
		border: 1px solid #e8e8e8;
		border-radius: 14px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.checkin-header {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.checkin-title {
		font-size: 0.9375rem;
		font-weight: 700;
		color: #000;
	}

	.checkin-subtitle {
		font-size: 0.75rem;
		color: #999;
		font-weight: 500;
	}

	.photo-strip {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.photo-thumb {
		width: 64px;
		height: 64px;
		object-fit: cover;
		border-radius: 8px;
		flex-shrink: 0;
	}

	.checkin-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.done-btn {
		padding: 0.5rem 1rem;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}
</style>

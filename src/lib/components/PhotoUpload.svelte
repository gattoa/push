<script lang="ts">
	import { savePhoto, type ProgressPhoto } from '$lib/stores/photos';

	let { onupload }: {
		onupload?: (photo: ProgressPhoto) => void;
	} = $props();

	let fileInput: HTMLInputElement;
	let uploading = $state(false);

	async function handleFiles() {
		const files = fileInput?.files;
		if (!files || files.length === 0) return;

		uploading = true;
		try {
			const photo = await savePhoto(files[0]);
			onupload?.(photo);
		} catch (e) {
			console.error('Photo upload failed:', e);
		} finally {
			uploading = false;
			if (fileInput) fileInput.value = '';
		}
	}
</script>

<button class="upload-btn" onclick={() => fileInput?.click()} disabled={uploading}>
	{uploading ? 'Saving...' : '+ Add'}
</button>
<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	capture="environment"
	onchange={handleFiles}
	hidden
/>

<style>
	.upload-btn {
		padding: 0.5rem 1rem;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.upload-btn:hover {
		background: #222;
	}

	.upload-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

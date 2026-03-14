<script lang="ts">
	let { label, subtitle = '', selected = false, onclick } = $props<{
		label: string;
		subtitle?: string;
		selected: boolean;
		onclick: () => void;
	}>();
</script>

<button class="card" class:selected onclick={onclick}>
	<span class="label">{label}</span>
	{#if subtitle}
		<span class="subtitle">{subtitle}</span>
	{/if}
</button>

<style>
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		width: 100%;
		padding: 1rem;
		border: 2px solid #e5e5e5;
		border-radius: 12px;
		background: #fff;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		font-family: inherit;
	}

	.card:hover {
		border-color: #ccc;
	}

	.card.selected {
		border-color: #000;
		background: #f9f9f9;
	}

	.label {
		font-size: 1rem;
		font-weight: 600;
		color: #000;
	}

	.subtitle {
		font-size: 0.8125rem;
		color: #888;
	}
</style>

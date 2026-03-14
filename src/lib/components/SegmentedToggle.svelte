<script lang="ts">
	let {
		options,
		value = $bindable(),
		onchange
	}: {
		options: { value: string; label: string }[];
		value: string;
		onchange?: () => void;
	} = $props();
</script>

<div class="segmented">
	{#each options as opt}
		<button
			class="segment"
			class:active={value === opt.value}
			onclick={() => { value = opt.value; onchange?.(); }}
		>
			{opt.label}
		</button>
	{/each}
</div>

<style>
	.segmented {
		display: flex;
		background: #f0f0f0;
		border-radius: 8px;
		padding: 2px;
		gap: 2px;
	}

	.segment {
		flex: 1;
		min-height: 36px;
		padding: 0.375rem 0.75rem;
		border: none;
		border-radius: 6px;
		background: transparent;
		font-size: 0.875rem;
		font-weight: 600;
		color: #666;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}

	.segment.active {
		background: #fff;
		color: #000;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
</style>

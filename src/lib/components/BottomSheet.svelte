<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(),
		title,
		options = [],
		value = $bindable(null),
		values = $bindable([]),
		multiSelect = false,
		onchange,
		children
	}: {
		open: boolean;
		title: string;
		options?: { value: string | number; label: string }[];
		value?: string | number | null;
		values?: (string | number)[];
		multiSelect?: boolean;
		onchange?: () => void;
		children?: Snippet;
	} = $props();

	let sheetEl: HTMLDivElement | undefined = $state();
	let dragStartY = 0;
	let dragDelta = $state(0);
	let dragging = false;

	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});

	function close() {
		open = false;
	}

	function selectSingle(val: string | number) {
		value = val;
		onchange?.();
		close();
	}

	function toggleMulti(val: string | number) {
		if (values.includes(val)) {
			values = values.filter((v) => v !== val);
		} else {
			values = [...values, val];
		}
		onchange?.();
	}

	function isSelected(val: string | number): boolean {
		if (multiSelect) {
			return values.includes(val);
		}
		return value === val;
	}

	function handleTouchStart(e: TouchEvent) {
		dragStartY = e.touches[0].clientY;
		dragDelta = 0;
		dragging = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!dragging) return;
		const delta = e.touches[0].clientY - dragStartY;
		dragDelta = Math.max(0, delta);
	}

	function handleTouchEnd() {
		if (dragDelta > 80) {
			close();
		}
		dragDelta = 0;
		dragging = false;
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={close} onkeydown={(e) => e.key === 'Escape' && close()}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="sheet"
			role="dialog"
			tabindex="-1"
			bind:this={sheetEl}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.key === 'Escape' && close()}
			ontouchstart={handleTouchStart}
			ontouchmove={handleTouchMove}
			ontouchend={handleTouchEnd}
			style={dragDelta > 0 ? `transform: translateY(${dragDelta}px)` : ''}
		>
			<div class="handle"></div>
			<h3 class="sheet-title">{title}</h3>
			{#if children}
				{@render children()}
			{:else}
				<ul class="option-list">
					{#each options as opt}
						<li>
							<button
								class="option-row"
								class:selected={isSelected(opt.value)}
								onclick={() => multiSelect ? toggleMulti(opt.value) : selectSingle(opt.value)}
							>
								<span class="option-label">{opt.label}</span>
								{#if isSelected(opt.value)}
									<svg class="checkmark" width="20" height="20" viewBox="0 0 20 20" fill="none">
										<polyline points="4,10 8,14 16,6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
				{#if multiSelect}
					<div class="done-wrapper">
						<button class="done-btn" onclick={close}>Done</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 200;
		animation: fadeIn 0.2s ease;
	}

	.sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		max-height: 70vh;
		background: #fff;
		border-radius: 16px 16px 0 0;
		padding: 0.5rem 0;
		padding-bottom: env(safe-area-inset-bottom, 0);
		animation: slideUp 0.25s ease-out;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.handle {
		width: 36px;
		height: 4px;
		background: #ddd;
		border-radius: 2px;
		margin: 0.25rem auto 0.75rem;
	}

	.sheet-title {
		font-size: 1.125rem;
		font-weight: 700;
		text-align: center;
		margin: 0 0 0.5rem;
		color: #000;
	}

	.option-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.option-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		min-height: 52px;
		padding: 0.875rem 1.25rem;
		font-size: 1rem;
		font-weight: 500;
		color: #000;
		background: none;
		border: none;
		border-bottom: 1px solid #f0f0f0;
		cursor: pointer;
		font-family: inherit;
		text-align: left;
	}

	.option-row:hover {
		background: #fafafa;
	}

	.option-row.selected {
		font-weight: 600;
	}

	.option-label {
		flex: 1;
	}

	.checkmark {
		flex-shrink: 0;
		color: #000;
	}

	.done-wrapper {
		padding: 0.75rem 1.25rem;
		padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
	}

	.done-btn {
		width: 100%;
		padding: 0.875rem;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	.done-btn:hover {
		background: #222;
	}

	@keyframes slideUp {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>

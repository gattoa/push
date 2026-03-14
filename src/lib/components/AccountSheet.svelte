<script lang="ts">
	let {
		open = $bindable(),
		email = $bindable('')
	}: {
		open: boolean;
		email: string;
	} = $props();

	let sheetEl: HTMLDivElement | undefined = $state();
	let dragStartY = 0;
	let dragDelta = $state(0);
	let dragging = false;
	let editingEmail = $state(false);
	let emailInput = $state('');

	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
			emailInput = email;
			editingEmail = false;
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

	function startEditing() {
		editingEmail = true;
	}

	function saveEmail() {
		email = emailInput.trim();
		editingEmail = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') saveEmail();
		if (e.key === 'Escape') {
			editingEmail = false;
			emailInput = email;
		}
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
			<h3 class="sheet-title">Account</h3>

			<div class="account-section">
				{#if editingEmail}
					<div class="email-edit">
						<input
							type="email"
							class="email-input"
							bind:value={emailInput}
							onkeydown={handleKeydown}
							placeholder="your@email.com"
						/>
						<button class="save-btn" onclick={saveEmail}>Save</button>
					</div>
				{:else}
					<button class="option-row" onclick={startEditing}>
						<span class="option-label">Email</span>
						<span class="option-value">{email || 'Not set'}</span>
					</button>
				{/if}

				<div class="divider"></div>

				<button class="option-row logout" disabled>
					<span class="option-label">Log out</span>
				</button>
			</div>
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
		background: #fff;
		border-radius: 16px 16px 0 0;
		padding: 0.5rem 0;
		padding-bottom: env(safe-area-inset-bottom, 0);
		animation: slideUp 0.25s ease-out;
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

	.account-section {
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
		border-bottom: none;
		cursor: pointer;
		font-family: inherit;
		text-align: left;
	}

	.option-row:hover {
		background: #fafafa;
	}

	.option-value {
		color: #666;
		font-size: 0.9375rem;
	}

	.option-row.logout {
		color: #e55;
		cursor: not-allowed;
		opacity: 0.4;
	}

	.divider {
		height: 1px;
		background: #f0f0f0;
		margin: 0 1.25rem;
	}

	.email-edit {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
	}

	.email-input {
		flex: 1;
		padding: 0.625rem 0.75rem;
		border: 1px solid #e8e8e8;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-family: inherit;
		outline: none;
	}

	.email-input:focus {
		border-color: #000;
	}

	.save-btn {
		padding: 0.625rem 1rem;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
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

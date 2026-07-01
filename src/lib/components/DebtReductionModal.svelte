<script lang="ts">
    import { store, formatNumber, formatMoney } from '$lib/game/store.svelte';
    import { TECH_DEBT, PROJECTS } from '$lib/game/constants';
    import { calculateDebtReductionCosts } from '$lib/game/economy';
    
    // Reduction amount in debt level units (not percentage)
    let reductionAmount = $state(TECH_DEBT.MIN_REDUCTION) as number; // Start with 1% (50 level units for MAX_LEVEL=5000)
    let paymentType = $state<'loc' | 'cash'>('loc');
    
    // Calculate costs based on new formula: debt / 2 LoC
    const cheapestProject = PROJECTS.standard[0]; // Todo App
    const reductionCosts = $derived(calculateDebtReductionCosts(reductionAmount, cheapestProject));
    const locCost = $derived(reductionCosts.loc);
    const cashCost = $derived(reductionCosts.cash);
    
    const newDebt = $derived(Math.max(0, store.gameState.techDebt - reductionAmount));
    
    function handleReduce() {
        if (store.reduceDebt(reductionAmount, paymentType)) {
            store.showDebtModal = false;
        }
    }
    
    function handleClose() {
        store.showDebtModal = false;
    }
    
    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            handleClose();
        }
    }
    
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            handleClose();
        }
    }
    
    // Quick select buttons - use debt level units
    function selectAmount(amount: number) {
        reductionAmount = amount;
    }
    
    // Format debt level as percentage (MAX_LEVEL=5000, caps at 50%)
    function formatDebtLevel(debt: number): string {
        return (debt / 100).toFixed(2) + '%';
    }
    
    // Quick select options (in debt level units, MAX_LEVEL=5000)
    const quickSelectOptions = $derived([
        { value: 50, label: '1%' },    // 50 level = 1%
        { value: 250, label: '5%' },   // 250 level = 5%
        { value: 500, label: '10%' },  // 500 level = 10%
        { value: store.gameState.techDebt, label: 'MAX' }
    ]);
</script>

{#if store.showDebtModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Reduce Tech Debt">
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">┌─ REDUCE TECH DEBT ───────┐</div>
            <div class="modal-body">
                <p class="current-debt">Current Debt: <span class="debt-value">{store.debtPercentageDisplay}</span></p>
                <p class="new-debt">After Reduction: <span class="debt-value new">{formatDebtLevel(newDebt)}</span></p>
                
                <div class="amount-section">
                    <span class="amount-label" id="amount-label">Reduction Amount:</span>
                    <div class="amount-display" aria-labelledby="amount-label">{formatDebtLevel(reductionAmount)}</div>
                    
                    <div class="quick-select">
                        {#each quickSelectOptions as option}
                            <button 
                                onclick={() => selectAmount(option.value)} 
                                class:selected={reductionAmount === option.value}
                            >
                                {option.label}
                            </button>
                        {/each}
                    </div>
                    
                    <input 
                        type="range" 
                        min={TECH_DEBT.MIN_REDUCTION} 
                        max={store.gameState.techDebt} 
                        step={TECH_DEBT.MIN_REDUCTION}
                        bind:value={reductionAmount}
                        class="amount-slider"
                    />
                </div>
                
                <div class="payment-section">
                    <span class="payment-label" id="payment-label">Payment Method:</span>
                    <div class="payment-options" role="radiogroup" aria-labelledby="payment-label">
                        <button 
                            class="payment-btn" 
                            class:selected={paymentType === 'loc'}
                            onclick={() => paymentType = 'loc'}
                        >
                            <span class="payment-icon">📝</span>
                            <span class="payment-info">
                                <span class="payment-type">LoC</span>
                                <span class="payment-cost">{formatNumber(locCost)} LoC</span>
                            </span>
                        </button>
                        <button 
                            class="payment-btn" 
                            class:selected={paymentType === 'cash'}
                            onclick={() => paymentType = 'cash'}
                        >
                            <span class="payment-icon">💰</span>
                            <span class="payment-info">
                                <span class="payment-type">Cash</span>
                                <span class="payment-cost">${formatNumber(cashCost)}</span>
                            </span>
                        </button>
                    </div>
                </div>
                
                <p class="info-text">
                    LoC cost: debt ÷ 2 | Cash cost based on Todo App value ({formatMoney(cheapestProject.reward)} for {cheapestProject.locCost} LoC)
                </p>
            </div>
            <div class="modal-footer">
                <button class="action-btn cancel" onclick={handleClose}>CANCEL</button>
                <button class="action-btn confirm" onclick={handleReduce}>
                    REDUCE DEBT
                </button>
            </div>
            <div class="modal-corner">└─────────────────────────┘</div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }
    
    .modal-content {
        background-color: var(--panel-bg, #0f0f0f);
        border: 1px solid var(--border-color, #00ff00);
        min-width: 360px;
        max-width: 420px;
    }
    
    .modal-header {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--border-color, #00ff00);
    }
    
    .modal-body {
        padding: 16px;
    }
    
    .modal-footer {
        display: flex;
        gap: 12px;
        padding: 12px 16px;
        border-top: 1px solid var(--border-color, #00ff00);
        justify-content: flex-end;
    }
    
    .modal-corner {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        padding: 4px 12px 8px;
        text-align: right;
    }
    
    .current-debt, .new-debt {
        margin: 0 0 8px;
        font-size: 13px;
        color: var(--text-secondary, #00cc00);
    }
    
    .debt-value {
        color: var(--text-amber, #ffb000);
        font-weight: bold;
    }
    
    .debt-value.new {
        color: var(--text-primary, #00ff00);
    }
    
    .amount-section {
        margin: 16px 0;
    }
    
    .amount-label, .payment-label {
        display: block;
        font-size: 11px;
        color: var(--text-dim, #008800);
        margin-bottom: 6px;
        text-transform: uppercase;
    }
    
    .amount-display {
        font-size: 24px;
        color: var(--text-primary, #00ff00);
        text-align: center;
        margin-bottom: 8px;
    }
    
    .quick-select {
        display: flex;
        gap: 6px;
        margin-bottom: 8px;
    }
    
    .quick-select button {
        flex: 1;
        padding: 4px 8px;
        background-color: var(--button-bg, #1a1a1a);
        border: 1px solid var(--border-color, #00ff00);
        color: var(--text-secondary, #00cc00);
        font-size: 11px;
        cursor: pointer;
        transition: all 0.15s ease;
    }
    
    .quick-select button:hover {
        background-color: var(--button-hover, #2a2a2a);
    }
    
    .quick-select button.selected {
        background-color: var(--button-active, #3a3a3a);
        color: var(--text-primary, #00ff00);
        box-shadow: 0 0 6px rgba(0, 255, 0, 0.4);
    }
    
    .amount-slider {
        width: 100%;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--border-color, #00ff00);
        outline: none;
        cursor: pointer;
    }
    
    .amount-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: var(--text-primary, #00ff00);
        cursor: pointer;
    }
    
    .payment-options {
        display: flex;
        gap: 12px;
    }
    
    .payment-btn {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background-color: var(--button-bg, #1a1a1a);
        border: 1px solid var(--border-color, #00ff00);
        color: var(--text-secondary, #00cc00);
        cursor: pointer;
        transition: all 0.15s ease;
        text-align: left;
    }
    
    .payment-btn:hover {
        background-color: var(--button-hover, #2a2a2a);
    }
    
    .payment-btn.selected {
        background-color: var(--button-active, #3a3a3a);
        color: var(--text-primary, #00ff00);
        box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
    }
    
    .payment-icon {
        font-size: 20px;
    }
    
    .payment-info {
        display: flex;
        flex-direction: column;
    }
    
    .payment-type {
        font-size: 12px;
        font-weight: bold;
    }
    
    .payment-cost {
        font-size: 11px;
        color: var(--text-amber, #ffb000);
    }
    
    .info-text {
        font-size: 10px;
        color: var(--text-dim, #008800);
        margin: 12px 0 0;
        text-align: center;
    }
    
    .action-btn {
        padding: 8px 20px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .action-btn.cancel {
        background-color: var(--button-bg, #1a1a1a);
        color: var(--text-secondary, #00cc00);
        border: 1px solid var(--border-color, #00ff00);
    }
    
    .action-btn.confirm {
        background-color: var(--text-primary, #00ff00);
        color: var(--panel-bg, #0f0f0f);
        border: 1px solid var(--text-primary, #00ff00);
    }
    
    .action-btn:hover {
        opacity: 0.9;
    }
</style>

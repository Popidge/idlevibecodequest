<script lang="ts">
    import {
        store,
        formatNumber,
        formatMoney
    } from '$lib/game/store.svelte';
    import { TECH_DEBT } from '$lib/game/constants';
    import ProgressBar from './ProgressBar.svelte';

    function openDebtModal() {
        store.showDebtModal = true;
    }
    
    function formatProgressLabel(): string {
        if (!store.cheapestUpgrade) return '';
        const upgrade = store.cheapestUpgrade;
        const typeName = upgrade.type === 'vibeCode' ? 'Vibe Code' : 'Delegation';
        return `${typeName} L${upgrade.level}`;
    }
</script>

<div class="panel stats-panel">
    <div class="panel-header">┌─ STATS ──────────────────┐</div>
    <div class="panel-content stats-content">
        <div class="stat-row">
            <span class="stat-label">Money:</span>
            <span class="stat-value">${formatMoney(store.gameState.resources.money)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">LoC:</span>
            <span class="stat-value">{formatNumber(store.gameState.resources.loc)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Cred:</span>
            <span class="stat-value">{formatNumber(store.gameState.resources.cred)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Clicks:</span>
            <span class="stat-value">{formatNumber(store.gameState.totalClicks)}</span>
        </div>
        <div class="stat-divider">┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄</div>
        
        <!-- Phase 1: Tech Debt Display (Reworked v0.5) -->
        <div class="stat-row tech-debt-row" class:warning={store.isDebtWarning} class:danger={store.isDebtDanger}>
            <span class="stat-label">Tech Debt:</span>
            <div class="debt-container">
                <span class="debt-value">{store.debtPercentageDisplay}</span>
                {#if store.gameState.techDebt > 0}
                    <span class="debt-multiplier" title="Income multiplier">
                        ×{(store.effectiveDebtPenaltyFactor * 100).toFixed(0)}%
                    </span>
                {/if}
            </div>
        </div>
        {#if store.isDebtWarning}
            <div class="clear-btn-container">
                <button class="clear-btn" class:danger={store.isDebtDanger} onclick={openDebtModal}>CLEAR</button>
            </div>
        {/if}
        
        <div class="stat-divider">┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄</div>
        <div class="stat-row">
            <span class="stat-label">Power:</span>
            <span class="stat-value">{formatNumber(store.effectiveClickPower)} LoC/click</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Delegation:</span>
            <span class="stat-value">{formatNumber(store.effectivePassiveLocRate)} LoC/sec</span>
        </div>
        {#if store.effectiveLocMultiplier > 1}
            <div class="stat-row multiplier-row">
                <span class="stat-label">LoC Multiplier:</span>
                <span class="stat-value multiplier">×{store.effectiveLocMultiplier.toFixed(2)}</span>
            </div>
        {/if}
        {#if store.effectiveCashMultiplier > 1}
            <div class="stat-row multiplier-row">
                <span class="stat-label">Cash Multiplier:</span>
                <span class="stat-value multiplier">×{store.effectiveCashMultiplier.toFixed(2)}</span>
            </div>
        {/if}
        {#if store.effectiveCredMultiplier > 1}
            <div class="stat-row multiplier-row">
                <span class="stat-label">Cred Multiplier:</span>
                <span class="stat-value multiplier">×{store.effectiveCredMultiplier.toFixed(2)}</span>
            </div>
        {/if}
        <div class="stat-row">
            <span class="stat-label">Passive:</span>
            <span class="stat-value" class:penalized={store.gameState.techDebt > 0}>
                ${formatMoney(store.effectivePassiveIncome)}/sec
                {#if store.gameState.techDebt > 0}
                    <span class="original-value">(${formatMoney(store.basePassiveIncome)})</span>
                {/if}
            </span>
        </div>
        
        <!-- Phase 2: Progress bar for next upgrade -->
        {#if store.cheapestUpgrade}
            <div class="progress-section">
                <div class="progress-label">Next Upgrade:</div>
                <ProgressBar
                    current={store.gameState.resources.money}
                    max={store.cheapestUpgrade.cost}
                    label={formatProgressLabel()}
                />
            </div>
        {/if}

        <!-- Prestige Points Summary -->
        <div class="prestige-summary">
            <div class="prestige-summary-label">TOTAL PRESTIGE POINTS</div>
            <div class="prestige-summary-value">
                <span class="star">⭐</span>
                <span class="points">{store.totalPrestigePoints}</span>
                <span class="details">
                    ({store.gameState.prestige?.totalPrestiges ?? 0} prestiges)
                </span>
            </div>
        </div>
    </div>
    <div class="panel-footer">└──────────────────────────┘</div>
</div>

<style>
    .panel {
        background-color: var(--panel-bg, #0f0f0f);
        display: flex;
        flex-direction: column;
    }

    .stats-panel {
        grid-column: 1;
        grid-row: 2 / 4;
    }

    .panel-header {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        white-space: pre;
        padding: 4px 0;
        flex-shrink: 0;
    }

    .panel-content {
        flex: 1;
        overflow: auto;
        padding: 10px;
        border-left: 1px solid var(--border-color, #00ff00);
        border-right: 1px solid var(--border-color, #00ff00);
    }

    .panel-footer {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        white-space: pre;
        padding: 4px 0;
        flex-shrink: 0;
    }

    .stats-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: nowrap;
    }
    
    .multiplier-row {
        padding-left: 8px;
    }
    
    .multiplier {
        color: var(--text-primary, #00ff00);
    }

    .stat-label {
        color: var(--text-secondary, #00cc00);
        font-size: 12px;
    }

    .stat-value {
        color: var(--text-amber, #ffb000);
        font-size: 13px;
        font-weight: bold;
    }
    
    .stat-value.penalized {
        color: var(--text-primary, #00ff00);
    }
    
    .original-value {
        color: var(--text-dim, #008800);
        font-size: 11px;
        text-decoration: line-through;
        margin-left: 4px;
        font-weight: normal;
    }

    .stat-divider {
        color: var(--text-dim, #008800);
        font-size: 10px;
        text-align: center;
        padding: 4px 0;
    }
    
    /* Phase 1: Tech Debt Styling */
    .tech-debt-row {
        padding: 4px 0;
    }
    
    .tech-debt-row.danger {
        animation: pulse 0.5s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    .tech-debt-row.warning .debt-value {
        color: var(--text-amber, #ffb000);
    }
    
    .tech-debt-row.danger .debt-value {
        color: #ff4444;
    }
    
    .debt-value {
        font-size: 14px;
        font-weight: bold;
        color: var(--text-primary, #00ff00);
    }
    
    .debt-container {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: nowrap;
        max-width: 120px;
    }
    
    .debt-multiplier {
        font-size: 9px;
        color: var(--text-dim, #008800);
        font-weight: normal;
        white-space: nowrap;
    }
    
    .clear-btn-container {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 4px;
    }
    
    .clear-btn {
        background-color: var(--button-bg, #1a1a1a);
        color: var(--text-amber, #ffb000);
        border: 1px solid var(--text-amber, #ffb000);
        padding: 4px 12px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.15s ease;
        text-transform: uppercase;
        animation: blink 1s infinite;
    }
    
    .clear-btn.danger {
        color: #ff4444;
        border-color: #ff4444;
        animation: pulse 0.5s infinite;
    }
    
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.5; }
    }
    
    .clear-btn:hover {
        background-color: var(--text-amber, #ffb000);
        color: var(--panel-bg, #0f0f0f);
        animation: none;
    }
    
    /* Phase 2: Progress bar section */
    .progress-section {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed var(--text-dim, #008800);
    }

    .progress-label {
        color: var(--text-dim, #008800);
        font-size: 10px;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Prestige Points Summary */
    .prestige-summary {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 2px solid var(--text-amber, #ffb000);
    }

    .prestige-summary-label {
        color: var(--text-amber, #ffb000);
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
        text-align: center;
    }

    .prestige-summary-value {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }

    .prestige-summary-value .star {
        color: var(--text-amber, #ffb000);
        font-size: 18px;
    }

    .prestige-summary-value .points {
        color: var(--text-amber, #ffb000);
        font-size: 16px;
        font-weight: bold;
    }

    .prestige-summary-value .details {
        color: var(--text-dim, #008800);
        font-size: 10px;
    }
</style>

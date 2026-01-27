<script lang="ts">
    import { store, formatNumber } from '$lib/game/store.svelte';
</script>

<div class="mobile-stats-bar">
    <div class="stat-item">
        <span class="stat-label">LoC</span>
        <span class="stat-value">{formatNumber(store.gameState.resources.loc)}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
        <span class="stat-label">+LoC/s</span>
        <span class="stat-value">{formatNumber(store.effectivePassiveLocRate)}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item warning-{store.isDebtWarning ? 'true' : 'false'} danger-{store.isDebtDanger ? 'true' : 'false'}">
        <span class="stat-label">Debt</span>
        <span class="stat-value debt-value">{store.debtPercentageDisplay}</span>
    </div>
</div>

<style>
    .mobile-stats-bar {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 8px 16px;
        background-color: var(--panel-bg, #0f0f0f);
        border-bottom: 1px solid var(--border-color, #00ff00);
        gap: 8px;
        flex-shrink: 0;
    }
    
    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        flex: 1;
    }
    
    .stat-label {
        font-size: 10px;
        color: var(--text-dim, #008800);
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .stat-value {
        font-size: 14px;
        font-weight: bold;
        color: var(--text-primary, #00ff00);
    }
    
    .stat-divider {
        width: 1px;
        height: 24px;
        background-color: var(--border-color, #00ff00);
        opacity: 0.3;
    }
    
    .stat-item[class*="warning-true"] .debt-value {
        color: var(--text-amber, #ffb000);
    }
    
    .stat-item[class*="danger-true"] .debt-value {
        color: #ff4444;
        animation: pulse 0.5s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
</style>
<script lang="ts">
    import { 
        gameState, 
        clickPower, 
        autoClickRate, 
        passiveIncome,
        formatNumber 
    } from '$lib/game/store';
</script>

<div class="panel stats-panel">
    <div class="panel-header">┌─ STATS ───────────────┐</div>
    <div class="panel-content stats-content">
        <div class="stat-row">
            <span class="stat-label">Money:</span>
            <span class="stat-value">${formatNumber(gameState.resources.money)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">LoC:</span>
            <span class="stat-value">{formatNumber(gameState.resources.loc)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Cred:</span>
            <span class="stat-value">{formatNumber(gameState.resources.cred)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Clicks:</span>
            <span class="stat-value">{formatNumber(gameState.totalClicks)}</span>
        </div>
        <div class="stat-divider">┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄</div>
        <div class="stat-row">
            <span class="stat-label">Power:</span>
            <span class="stat-value">{formatNumber(clickPower)} LoC/click</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Auto:</span>
            <span class="stat-value">{formatNumber(autoClickRate)}/sec</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Passive:</span>
            <span class="stat-value">${formatNumber(passiveIncome)}/sec</span>
        </div>
    </div>
    <div class="panel-footer">└─────────────────────────┘</div>
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

    .stat-label {
        color: var(--text-secondary, #00cc00);
        font-size: 12px;
    }

    .stat-value {
        color: var(--text-amber, #ffb000);
        font-size: 13px;
        font-weight: bold;
    }

    .stat-divider {
        color: var(--text-dim, #008800);
        font-size: 10px;
        text-align: center;
        padding: 4px 0;
    }
</style>

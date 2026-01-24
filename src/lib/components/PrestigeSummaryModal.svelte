<script lang="ts">
    import { store, formatNumber, formatMoney } from '$lib/game/store.svelte';
    
    function handleConfirm() {
        store.selectPrestigePath('buyout');
    }
    
    function handleClose() {
        store.closePrestigeConfirmation();
    }
    
    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            handleClose();
        }
    }
    
    function formatDuration(ms: number): string {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }
</script>

{#if store.showPrestigeSummaryModal}
    {@const summary = store.prestigeSummary}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Prestige Summary">
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">┌─ PRESTIGE AVAILABLE! ───────┐</div>
            <div class="modal-body">
                <div class="celebration">✨ ⭐ ✨</div>
                <p class="congrats">You've reached the pinnacle of this run!</p>
                
                <div class="summary-section">
                    <h3>Previous Run Stats:</h3>
                    <div class="stat-row">
                        <span class="stat-label">Duration:</span>
                        <span class="stat-value">{summary.runDuration}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Cash Earned:</span>
                        <span class="stat-value">${formatMoney(summary.cashEarned)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Projects Shipped:</span>
                        <span class="stat-value">{summary.projectsShipped}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Upgrades Owned:</span>
                        <span class="stat-value">{summary.upgradesOwned}</span>
                    </div>
                </div>
                
                <div class="points-section">
                    <div class="points-display">
                        <span class="points-icon">⭐</span>
                        <span class="points-value">+{summary.pointsEarned}</span>
                        <span class="points-label">Prestige Points</span>
                    </div>
                    <p class="points-note">Points are based on total cash earned: floor(log10(cash + 1))</p>
                </div>
                
                <div class="warning-section">
                    <p class="warning-text">⚠️ Prestiging will reset ALL progress except prestige bonuses!</p>
                    <p class="warning-subtext">You'll keep your prestige points and path bonuses</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn cancel" onclick={handleClose}>CANCEL</button>
                <button class="action-btn confirm" onclick={handleConfirm}>
                    CHOOSE PATH
                </button>
            </div>
            <div class="modal-corner">└─────────────────────────────┘</div>
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
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .modal-content {
        background-color: var(--panel-bg, #0f0f0f);
        border: 2px solid var(--text-amber, #ffb000);
        min-width: 400px;
        max-width: 480px;
        box-shadow: 0 0 30px rgba(255, 176, 0, 0.3);
    }
    
    .modal-header {
        color: var(--text-amber, #ffb000);
        font-size: 12px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--text-amber, #ffb000);
        text-align: center;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .celebration {
        text-align: center;
        font-size: 24px;
        margin-bottom: 8px;
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .congrats {
        text-align: center;
        color: var(--text-primary, #00ff00);
        font-size: 14px;
        margin: 0 0 16px;
    }
    
    .summary-section {
        background-color: var(--button-bg, #1a1a1a);
        border: 1px solid var(--border-color, #00ff00);
        padding: 12px;
        margin-bottom: 16px;
    }
    
    .summary-section h3 {
        color: var(--text-secondary, #00cc00);
        font-size: 11px;
        margin: 0 0 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .stat-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
    }
    
    .stat-label {
        color: var(--text-dim, #008800);
        font-size: 12px;
    }
    
    .stat-value {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        font-weight: bold;
    }
    
    .points-section {
        text-align: center;
        margin-bottom: 16px;
    }
    
    .points-display {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, rgba(255, 176, 0, 0.2), rgba(255, 215, 0, 0.1));
        border: 2px solid var(--text-amber, #ffb000);
        padding: 12px 24px;
        border-radius: 4px;
    }
    
    .points-icon {
        font-size: 28px;
    }
    
    .points-value {
        color: var(--text-amber, #ffb000);
        font-size: 32px;
        font-weight: bold;
    }
    
    .points-label {
        color: var(--text-primary, #00ff00);
        font-size: 14px;
    }
    
    .points-note {
        color: var(--text-dim, #008800);
        font-size: 10px;
        margin: 8px 0 0;
        font-style: italic;
    }
    
    .warning-section {
        background-color: rgba(255, 0, 0, 0.1);
        border: 1px solid rgba(255, 0, 0, 0.3);
        padding: 10px;
        text-align: center;
    }
    
    .warning-text {
        color: #ff6b6b;
        font-size: 12px;
        margin: 0 0 4px;
    }
    
    .warning-subtext {
        color: var(--text-dim, #008800);
        font-size: 10px;
        margin: 0;
    }
    
    .modal-footer {
        display: flex;
        gap: 12px;
        padding: 12px 16px;
        border-top: 1px solid var(--text-amber, #ffb000);
        justify-content: center;
    }
    
    .modal-corner {
        color: var(--text-amber, #ffb000);
        font-size: 12px;
        padding: 4px 12px 8px;
        text-align: right;
    }
    
    .action-btn {
        padding: 10px 24px;
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
        background-color: var(--text-amber, #ffb000);
        color: var(--panel-bg, #0f0f0f);
        border: 1px solid var(--text-amber, #ffb000);
    }
    
    .action-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }
</style>

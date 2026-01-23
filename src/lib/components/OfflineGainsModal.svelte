<script lang="ts">
    import { store, formatNumber } from '$lib/game/store.svelte';
    
    // Auto-dismiss after 5 seconds
    $effect(() => {
        if (store.showOfflineModal) {
            const timer = setTimeout(() => {
                store.dismissOfflineModal();
            }, 5000);
            return () => clearTimeout(timer);
        }
    });
    
    function handleDismiss() {
        store.dismissOfflineModal();
    }
    
    function formatHours(hours: number): string {
        if (hours < 1) {
            return Math.floor(hours * 60) + ' min';
        }
        return hours.toFixed(1) + ' hrs';
    }
</script>

{#if store.showOfflineModal && store.offlineGains}
    {@const gains = store.offlineGains}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="offline-modal" onclick={handleDismiss} role="alert" aria-live="polite">
        <div class="offline-content" onclick={(e) => e.stopPropagation()}>
            <div class="offline-header">┌─ WELCOME BACK! ───────────┐</div>
            <div class="offline-body">
                <p class="offline-message">You were away for <span class="time">{formatHours(gains.hoursOffline)}</span></p>
                <p class="offline-title">Maintenance Mode Active:</p>
                <div class="gains-row">
                    <span class="gain-icon">📝</span>
                    <span class="gain-value">+{formatNumber(gains.loc)} LoC</span>
                    <span class="gain-rate">(10% rate)</span>
                </div>
                <div class="gains-row">
                    <span class="gain-icon">💰</span>
                    <span class="gain-value">+${formatNumber(gains.cash)}</span>
                    <span class="gain-rate">(10% rate)</span>
                </div>
                <p class="offline-note">Tech debt did not increase while offline</p>
            </div>
            <div class="offline-footer">└─────────────────────────────┘</div>
        </div>
    </div>
{/if}

<style>
    .offline-modal {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 100;
        cursor: pointer;
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .offline-content {
        background-color: var(--panel-bg, #0f0f0f);
        border: 1px solid var(--border-color, #00ff00);
        min-width: 280px;
        box-shadow: 0 4px 20px rgba(0, 255, 0, 0.2);
    }
    
    .offline-header {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--border-color, #00ff00);
    }
    
    .offline-body {
        padding: 12px 16px;
    }
    
    .offline-footer {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        padding: 4px 12px 8px;
        text-align: right;
    }
    
    .offline-message {
        margin: 0 0 8px;
        font-size: 13px;
        color: var(--text-secondary, #00cc00);
    }
    
    .time {
        color: var(--text-amber, #ffb000);
        font-weight: bold;
    }
    
    .offline-title {
        margin: 0 0 8px;
        font-size: 11px;
        color: var(--text-dim, #008800);
        text-transform: uppercase;
    }
    
    .gains-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 6px 0;
        font-size: 13px;
    }
    
    .gain-icon {
        font-size: 16px;
    }
    
    .gain-value {
        color: var(--text-primary, #00ff00);
        font-weight: bold;
    }
    
    .gain-rate {
        color: var(--text-dim, #008800);
        font-size: 11px;
    }
    
    .offline-note {
        margin: 12px 0 0;
        font-size: 11px;
        color: var(--text-dim, #008800);
        font-style: italic;
    }
</style>

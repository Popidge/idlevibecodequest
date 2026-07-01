<script lang="ts">
    import { store, formatMoney, formatNumber } from '$lib/game/store.svelte';
    import { isDebugMode } from '$lib/env';
    
    let { onToggleTuning }: { onToggleTuning?: () => void } = $props();
    
    function handleDebugResources() {
        store.grantDebugResources();
    }
    
    function handleTuning() {
        onToggleTuning?.();
    }
</script>

<div class="mobile-header">
    <div class="header-left">
        <span class="logo">IVCQ</span>
    </div>
    
    <div class="header-center">
        <div class="primary-stat">
            <span class="stat-value money">{formatMoney(store.gameState.resources.money)}</span>
        </div>
        <div class="secondary-stats">
            <span class="stat-badge">⭐ {store.totalPrestigePoints}</span>
        </div>
    </div>
    
    <div class="header-right">
        {#if store.randomEventState.active}
            <button
                class="header-btn event-btn"
                onclick={() => store.engageRandomEvent()}
                title="Random event active"
                aria-label="Play random event, {store.randomEventState.timer} seconds remaining"
            >
                ⚡ <span>{store.randomEventState.timer}s</span>
            </button>
        {/if}
        {#if isDebugMode()}
            <button class="header-btn debug-btn" onclick={handleDebugResources} title="Debug Resources">
                🐛
            </button>
            <button class="header-btn tuning-btn" onclick={handleTuning} title="Tuning">
                ⚙️
            </button>
        {/if}
    </div>
</div>

<style>
    .mobile-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background-color: var(--panel-bg, #0f0f0f);
        border-bottom: 1px solid var(--border-color, #00ff00);
        gap: 12px;
        flex-shrink: 0;
    }
    
    .header-left {
        flex-shrink: 0;
    }
    
    .logo {
        font-size: 18px;
        font-weight: bold;
        color: var(--text-primary, #00ff00);
        letter-spacing: 2px;
    }
    
    .header-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        gap: 4px;
    }
    
    .primary-stat {
        font-size: 20px;
        font-weight: bold;
    }
    
    .money {
        color: var(--text-amber, #ffb000);
    }
    
    .secondary-stats {
        display: flex;
        gap: 8px;
    }
    
    .stat-badge {
        font-size: 12px;
        color: var(--text-amber, #ffb000);
        background-color: rgba(255, 176, 0, 0.1);
        padding: 2px 8px;
        border-radius: 4px;
        border: 1px solid var(--text-amber, #ffb000);
    }
    
    .header-right {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
    }
    
    .header-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--button-bg, #1a1a1a);
        border: 1px solid var(--border-color, #00ff00);
        border-radius: 4px;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .event-btn {
        width: auto;
        padding: 0 10px;
        gap: 4px;
        border-color: var(--text-magenta, #ff00ff);
        color: var(--text-magenta, #ff00ff);
        animation: eventPulse 0.8s ease-in-out infinite;
    }

    .event-btn span {
        font-size: 11px;
        font-family: 'Courier New', monospace;
    }

    @keyframes eventPulse {
        50% { box-shadow: 0 0 12px rgba(255, 0, 255, 0.8); }
    }

    @media (prefers-reduced-motion: reduce) {
        .event-btn {
            animation: none;
        }
    }
    
    .header-btn:hover {
        background-color: var(--button-hover, #2a2a2a);
    }
    
    .debug-btn {
        border-color: var(--text-amber, #ffb000);
    }
    
    .tuning-btn {
        border-color: var(--text-cyan, #00ccff);
    }
</style>

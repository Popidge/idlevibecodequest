<script lang="ts">
    import { store } from '$lib/game/store.svelte';

    // Get notifications sorted by most recent first, capped at 3 to prevent UI shift
    let notifications = $derived([...store.notificationQueue].reverse().slice(0, 3));
</script>

<div class="notification-bar">
    <!-- Left side: Notifications -->
    <div class="notification-container">
        {#if notifications.length === 0}
            <div class="notification-placeholder">
                <!-- Empty state - no notifications shown -->
            </div>
        {:else}
            <div class="notification-stack">
                {#each notifications as notification (notification.id)}
                    <div class="notification-item {notification.type} {notification.category}">
                        {notification.message}
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Right side: Control buttons (side-by-side) -->
    <div class="notification-controls">
        <!-- v0.5: Random Event Active Button -->
        {#if store.randomEventState.active}
            <div class="control-item">
                <button
                    class="control-btn event-btn"
                    onclick={() => store.engageRandomEvent()}
                    title="Random Event Active!"
                >
                    [ EVENT! ]
                </button>
                <div class="control-timer event-timer">{store.randomEventState.timer}s</div>
            </div>
        {/if}

        <div class="control-item">
            <button
                class="control-btn tech-tree-btn"
                onclick={() => store.openTechTree()}
                title="Open Tech Tree"
            >
                [ TECH TREE ]
            </button>
            {#if store.totalPrestigePoints > 0}
                <div class="control-points">⭐ {store.totalPrestigePoints}</div>
            {/if}
        </div>

        {#if store.isPrestigeAvailable}
            <div class="control-item">
                <button
                    class="control-btn prestige-btn"
                    onclick={() => store.openPrestigeConfirmation()}
                    title="Prestige Available!"
                >
                    [ PRESTIGE! ]
                </button>
                <div class="control-points">+{store.prestigePointsToEarn} pts</div>
            </div>
        {/if}
    </div>
</div>

<style>
    .notification-bar {
        grid-column: 2;
        grid-row: 1;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        padding: 8px 10px;
        min-height: 80px;
        border-left: none;
        border-right: none;
    }

    .notification-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
    }

    .notification-placeholder {
        width: 100%;
        min-height: 60px;
    }

    .notification-stack {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        max-width: 280px;
    }

    .notification-controls {
        display: flex;
        flex-direction: row;
        gap: 12px;
        align-items: flex-start;
        flex-shrink: 0;
        margin-left: auto;
        padding-left: 40px;
    }

    .control-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }

    .control-btn {
        background-color: var(--panel-bg, #0f0f0f);
        color: var(--text-primary, #00ff00);
        border: 1px solid var(--border-color, #00ff00);
        padding: 6px 12px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 3px;
        white-space: nowrap;
    }

    .control-btn:hover {
        background-color: var(--button-hover, #2a2a2a);
        box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
    }

    .control-points {
        font-size: 12px;
        padding: 10px 0;
        font-weight: bold;
        white-space: nowrap;
    }

    .tech-tree-btn {
        border-color: var(--text-cyan, #00ccff);
        color: var(--text-cyan, #00ccff);
    }

    .tech-tree-btn:hover {
        background-color: var(--text-cyan, #00ccff);
        color: var(--panel-bg, #0f0f0f);
    }

    .tech-tree-points {
        color: var(--text-cyan, #00ccff);
    }

    .prestige-btn {
        border-color: var(--text-amber, #ffb000);
        color: var(--text-amber, #ffb000);
        animation: prestigePulse 1s ease-in-out infinite;
    }

    .prestige-btn:hover {
        background-color: var(--text-amber, #ffb000);
        color: var(--panel-bg, #0f0f0f);
    }

    .prestige-points {
        color: var(--text-amber, #ffb000);
    }

    /* v0.5: Random Event Button */
    .event-btn {
        border-color: var(--text-magenta, #ff00ff);
        color: var(--text-magenta, #ff00ff);
        animation: eventPulse 0.5s ease-in-out infinite;
    }

    .event-btn:hover {
        background-color: var(--text-magenta, #ff00ff);
        color: var(--panel-bg, #0f0f0f);
    }

    .event-timer {
        color: var(--text-magenta, #ff00ff);
        animation: timerPulse 1s ease-in-out infinite;
    }

    @keyframes eventPulse {
        0%, 100% { box-shadow: 0 0 4px rgba(255, 0, 255, 0.5); }
        50% { box-shadow: 0 0 12px rgba(255, 0, 255, 0.8); }
    }

    @keyframes timerPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    @keyframes prestigePulse {
        0%, 100% { box-shadow: 0 0 4px rgba(255, 176, 0, 0.5); }
        50% { box-shadow: 0 0 12px rgba(255, 176, 0, 0.8); }
    }

    .notification-item {
        padding: 6px 10px;
        border-radius: 3px;
        font-size: 10px;
        animation: slideIn 0.2s ease-out;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }

    .notification-item.success {
        color: var(--text-primary, #00ff00);
        background: rgba(0, 40, 0, 0.3);
        border: 1px solid rgba(0, 255, 0, 0.3);
    }

    .notification-item.warning {
        color: var(--text-amber, #ffb000);
        background: rgba(40, 30, 0, 0.3);
        border: 1px solid rgba(255, 176, 0, 0.3);
    }

    .notification-item.info {
        color: var(--text-cyan, #00ccff);
        background: rgba(0, 30, 40, 0.3);
        border: 1px solid rgba(0, 204, 255, 0.3);
    }

    /* Category indicators */
    .notification-item.footer::before {
        content: '[SYS] ';
        opacity: 0.7;
    }

    .notification-item.title::before {
        content: '[INFO] ';
        opacity: 0.7;
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
</style>

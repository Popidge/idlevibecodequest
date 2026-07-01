<script lang="ts">
    import { store, formatMoney } from '$lib/game/store.svelte';
    import type { EventReward, DecisionEvent } from '$lib/game/event-types';
    import EventContainer from './events/EventContainer.svelte';

    // Track whether we're showing the interactive game
    let showGame = $state(false);

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget && !showGame) {
            store.closeRandomEventModal();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            if (showGame) {
                handleGameAbandon();
            } else {
                store.closeRandomEventModal();
            }
        }
    }

    function handleEngage() {
        const event = store.activeRandomEvent;
        if (!event) return;

        // Check if this is a legacy decision event
        if (event.mechanic === 'decision' && (event as DecisionEvent).config.isLegacy) {
            // Legacy event - just grant rewards immediately
            store.completeRandomEvent();
        } else {
            // Interactive event - show the game
            showGame = true;
        }
    }

    function handleGameComplete() {
        showGame = false;
        // Event completion is handled by EventContainer calling store.completeRandomEvent
    }

    function handleGameAbandon() {
        showGame = false;
        store.abandonRandomEvent();
    }

    function formatReward(reward: EventReward): string {
        switch (reward.type) {
            case 'cash':
                return `$${reward.baseAmount.toLocaleString()}`;
            case 'loc':
                return `${reward.baseAmount.toLocaleString()} LoC`;
            case 'cred':
                return `${reward.baseAmount} Cred`;
            case 'cashMultiplier':
            case 'locMultiplier':
            case 'credMultiplier':
                return `${(reward.baseAmount * 100).toFixed(0)}% ${reward.type.replace('Multiplier', '')} boost`;
            case 'locPerClick':
                return `+${reward.baseAmount} LoC/click`;
            case 'passiveLocRate':
                return `+${reward.baseAmount} LoC/sec`;
            case 'delegationMultiplier':
                return `${(reward.baseAmount * 100).toFixed(0)}% delegation boost`;
            default:
                return `${reward.baseAmount}`;
        }
    }

    function isTemporaryBuff(reward: EventReward): boolean {
        return ['cashMultiplier', 'locMultiplier', 'credMultiplier', 'locPerClick', 'passiveLocRate', 'delegationMultiplier'].includes(reward.type);
    }

    function isLegacyEvent(): boolean {
        const event = store.activeRandomEvent;
        if (!event) return false;
        return event.mechanic === 'decision' && (event as DecisionEvent).config.isLegacy;
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if store.showRandomEventModal && store.activeRandomEvent}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Random Event">
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            {#if showGame}
                <!-- Interactive Game Mode -->
                <EventContainer
                    eventConfig={store.activeRandomEvent}
                    onComplete={handleGameComplete}
                    onAbandon={handleGameAbandon}
                />
            {:else}
                <!-- Preview/Confirmation Mode -->
                <div class="modal-header">┌─ RANDOM EVENT ───────────┐</div>
                <div class="modal-body">
                    <div class="event-icon">⚡</div>
                    <h2 class="event-name">{store.activeRandomEvent.name}</h2>
                    <p class="event-description">{store.activeRandomEvent.description}</p>
                    
                    <!-- Show mechanic badge for interactive events -->
                    {#if !isLegacyEvent()}
                        <div class="mechanic-badge">
                            🎮 {store.activeRandomEvent.mechanic} mini-game
                        </div>
                    {/if}
                    
                    <div class="event-reward">
                        <span class="reward-label">Rewards:</span>
                        <div class="rewards-list">
                            {#each store.activeRandomEvent.rewards as reward}
                                <div class="reward-item" class:temporary={isTemporaryBuff(reward)}>
                                    <span class="reward-value">{formatReward(reward)}</span>
                                    {#if isTemporaryBuff(reward)}
                                        <span class="buff-duration">⏱️ {Math.floor((reward.duration || 300) / 60)}m</span>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="action-btn cancel" onclick={() => store.closeRandomEventModal()}>
                        CLOSE
                    </button>
                    <button class="action-btn confirm" onclick={handleEngage}>
                        {isLegacyEvent() ? 'CLAIM' : 'PLAY'}
                    </button>
                </div>
                <div class="modal-corner">└─────────────────────────┘</div>
            {/if}
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
        border: 1px solid var(--border-color, #ffb000);
        min-width: 360px;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .modal-header {
        color: var(--text-amber, #ffb000);
        font-size: 12px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--border-color, #ffb000);
    }

    .modal-body {
        padding: 20px;
        text-align: center;
    }

    .modal-footer {
        display: flex;
        gap: 12px;
        padding: 12px 16px;
        border-top: 1px solid var(--border-color, #ffb000);
        justify-content: flex-end;
    }

    .modal-corner {
        color: var(--text-amber, #ffb000);
        font-size: 12px;
        padding: 4px 12px 8px;
        text-align: right;
    }

    .event-icon {
        font-size: 48px;
        margin-bottom: 12px;
    }

    .event-name {
        color: var(--text-amber, #ffb000);
        font-size: 18px;
        margin: 0 0 12px;
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .event-description {
        color: var(--text-secondary, #00cc00);
        font-size: 14px;
        margin: 0 0 20px;
        line-height: 1.5;
    }

    .mechanic-badge {
        display: inline-block;
        padding: 6px 12px;
        background-color: rgba(0, 204, 255, 0.2);
        border: 1px solid var(--text-cyan, #00ccff);
        border-radius: 4px;
        color: var(--text-cyan, #00ccff);
        font-size: 12px;
        text-transform: uppercase;
        margin-bottom: 20px;
    }

    .event-reward {
        background-color: rgba(255, 176, 0, 0.1);
        border: 1px solid var(--text-amber, #ffb000);
        padding: 12px 20px;
        border-radius: 4px;
    }

    .rewards-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
    }

    .reward-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 6px 12px;
        background-color: rgba(0, 255, 0, 0.1);
        border: 1px solid var(--border-color, #00ff00);
        border-radius: 4px;
    }

    .reward-item.temporary {
        background-color: rgba(0, 204, 255, 0.1);
        border-color: var(--text-cyan, #00ccff);
    }

    .buff-duration {
        color: var(--text-cyan, #00ccff);
        font-size: 11px;
    }

    .reward-label {
        color: var(--text-dim, #008800);
        font-size: 12px;
        text-transform: uppercase;
    }

    .reward-value {
        color: var(--text-primary, #00ff00);
        font-size: 16px;
        font-weight: bold;
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
        background-color: var(--text-amber, #ffb000);
        color: var(--panel-bg, #0f0f0f);
        border: 1px solid var(--text-amber, #ffb000);
    }

    .action-btn:hover {
        opacity: 0.9;
    }
</style>

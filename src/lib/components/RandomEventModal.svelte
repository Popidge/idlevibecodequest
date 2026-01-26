<script lang="ts">
    import { store, formatMoney } from '$lib/game/store.svelte';

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            store.closeRandomEventModal();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            store.closeRandomEventModal();
        }
    }

    function handleEngage() {
        store.completeRandomEvent();
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if store.showRandomEventModal && store.activeRandomEvent}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Random Event">
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">┌─ RANDOM EVENT ───────────┐</div>
            <div class="modal-body">
                <div class="event-icon">⚡</div>
                <h2 class="event-name">{store.activeRandomEvent.name}</h2>
                <p class="event-description">{store.activeRandomEvent.description}</p>
                <div class="event-reward">
                    <span class="reward-label">Reward:</span>
                    <span class="reward-value">{formatMoney(store.activeRandomEvent.reward)}</span>
                    <span class="reward-note">(Flat amount - unaffected by multipliers)</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn cancel" onclick={() => store.closeRandomEventModal()}>
                    CLOSE
                </button>
                <button class="action-btn confirm" onclick={handleEngage}>
                    ENGAGE
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
        border: 1px solid var(--border-color, #ffb000);
        min-width: 360px;
        max-width: 420px;
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

    .event-reward {
        background-color: rgba(255, 176, 0, 0.1);
        border: 1px solid var(--text-amber, #ffb000);
        padding: 12px 20px;
        border-radius: 4px;
    }

    .reward-label {
        color: var(--text-dim, #008800);
        font-size: 12px;
        text-transform: uppercase;
        margin-right: 8px;
    }

    .reward-value {
        color: var(--text-primary, #00ff00);
        font-size: 24px;
        font-weight: bold;
        margin-right: 8px;
    }

    .reward-note {
        display: block;
        color: var(--text-dim, #008800);
        font-size: 10px;
        margin-top: 4px;
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

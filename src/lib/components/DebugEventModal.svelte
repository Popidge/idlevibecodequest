<script lang="ts">
    import { store } from '$lib/game/store.svelte';

    interface Props {
        onClose: () => void;
    }

    let { onClose }: Props = $props();

    // Get list of all available events
    const eventList = store.getDebugEventList();

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            onClose();
        }
    }

    function triggerEvent(eventId: string) {
        const success = store.debugTriggerEvent(eventId);
        if (success) {
            onClose();
        }
    }

    function triggerRandomEvent() {
        store.triggerRandomEvent();
        onClose();
    }

    // Group events by mechanic type
    const groupedEvents = eventList.reduce((acc, event) => {
        if (!acc[event.mechanic]) {
            acc[event.mechanic] = [];
        }
        acc[event.mechanic].push(event);
        return acc;
    }, {} as Record<string, typeof eventList>);

    const mechanicLabels: Record<string, string> = {
        'decision': '🎯 Decision',
        'reaction': '⚡ Reaction',
        'memory': '🧠 Memory',
        'typing': '⌨️ Typing',
        'spotting': '🔍 Spotting',
        'pattern': '🧩 Pattern'
    };
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Debug Event Trigger">
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <div class="modal-header">
            <span class="header-title">┌─ DEBUG: TRIGGER EVENT ─┐</span>
            <button class="close-btn" onclick={onClose}>[X]</button>
        </div>

        <div class="modal-body">
            <div class="trigger-section">
                <button class="trigger-btn random" onclick={triggerRandomEvent}>
                    🎲 Trigger Random Event
                </button>
            </div>

            <div class="divider"></div>

            <div class="events-list">
                <h3>Specific Events</h3>
                {#each Object.entries(groupedEvents) as [mechanic, events]}
                    <div class="mechanic-group">
                        <h4>{mechanicLabels[mechanic] || mechanic}</h4>
                        <div class="event-buttons">
                            {#each events as event}
                                <button
                                    class="event-btn"
                                    onclick={() => triggerEvent(event.id)}
                                    title={event.id}
                                >
                                    {event.name}
                                </button>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <div class="modal-footer">
            <span class="hint">Click event to trigger immediately</span>
        </div>

        <div class="modal-corner">└─────────────────────────────┘</div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: #0d0d0d;
        border: 2px solid #ff8800;
        border-radius: 8px;
        max-width: 90vw;
        max-height: 80vh;
        width: 500px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 40px rgba(255, 136, 0, 0.3);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        background: rgba(255, 136, 0, 0.1);
        border-bottom: 1px solid #ff4400;
    }

    .header-title {
        color: #ff8800;
        font-size: 0.9rem;
        font-weight: bold;
    }

    .close-btn {
        background: transparent;
        border: 1px solid #ff4400;
        color: #ff8800;
        padding: 4px 10px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-size: 0.8rem;
        border-radius: 4px;
    }

    .close-btn:hover {
        background: #331100;
    }

    .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
    }

    .trigger-section {
        text-align: center;
        margin-bottom: 15px;
    }

    .trigger-btn {
        width: 100%;
        padding: 12px 20px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.15s ease;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .trigger-btn.random {
        background: linear-gradient(135deg, #004400, #006600);
        border: 2px solid #00ff00;
        color: #00ff00;
    }

    .trigger-btn.random:hover {
        background: linear-gradient(135deg, #006600, #008800);
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
    }

    .divider {
        height: 1px;
        background: #ff4400;
        margin: 15px 0;
        opacity: 0.5;
    }

    .events-list h3 {
        color: #ff8800;
        margin: 0 0 15px 0;
        font-size: 0.9rem;
        text-transform: uppercase;
    }

    .mechanic-group {
        margin-bottom: 15px;
    }

    .mechanic-group h4 {
        color: #00ccff;
        margin: 0 0 8px 0;
        font-size: 0.85rem;
        padding-bottom: 4px;
        border-bottom: 1px solid #004444;
    }

    .event-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 6px;
    }

    .event-btn {
        padding: 8px 10px;
        background: #1a1a1a;
        border: 1px solid #444;
        color: #ccc;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        border-radius: 3px;
        transition: all 0.15s ease;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .event-btn:hover {
        background: #2a2a2a;
        border-color: #00ff00;
        color: #00ff00;
    }

    .modal-footer {
        padding: 10px 15px;
        background: rgba(0, 40, 0, 0.3);
        border-top: 1px solid #333;
    }

    .hint {
        color: #666;
        font-size: 0.75rem;
        font-style: italic;
    }

    .modal-corner {
        color: #ff8800;
        font-size: 0.8rem;
        padding: 5px 15px;
        text-align: right;
    }

    /* Scrollbar styling */
    .modal-body::-webkit-scrollbar {
        width: 6px;
    }

    .modal-body::-webkit-scrollbar-track {
        background: #1a1a1a;
    }

    .modal-body::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 3px;
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
</style>

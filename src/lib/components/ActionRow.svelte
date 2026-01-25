<script lang="ts">
    import { store } from '$lib/game/store.svelte';
</script>

<div class="action-row">
    <div class="action-left">
        <div class="action-buttons">
            <button class="window-btn" onclick={() => store.saveGame()}>[ SAVE ]</button>
            <button class="window-btn" onclick={() => store.resetGame()}>[ RESET ]</button>
        </div>
    </div>
    <div class="action-center">
        <div class="prompt-text">
            <span class="cursor-blink">&gt;</span> {store.currentPrompt}
        </div>
    </div>
    <div class="action-right">
        <button class="prompt-btn" onclick={(e) => store.handlePromptClick(e)}>
            [ >PROMPT ]
        </button>
    </div>
</div>

<style>
    .action-row {
        grid-column: 1 / -1;
        grid-row: 3;
        display: grid;
        grid-template-columns: 200px 1fr 1fr;
        gap: 10px;
        padding: 15px 10px;
        border-top: 1px solid var(--border-color, #00ff00);
        min-height: 60px;
    }

    .action-left {
        display: flex;
        align-items: center;
    }

    .action-center {
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .action-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 10px;
    }

    .prompt-text {
        color: var(--text-primary, #00ff00);
        font-size: 14px;
        font-style: italic;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .prompt-btn {
        background-color: var(--button-bg, #1a1a1a);
        color: var(--text-primary, #00ff00);
        border: 1px solid var(--border-color, #00ff00);
        padding: 12px 12px;
        font-family: 'Courier New', monospace;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .action-buttons {
        display: flex;
        gap: 12px;
    }

    .window-btn {
        background-color: var(--button-bg, #1a1a1a);
        color: var(--text-primary, #00ff00);
        border: 1px solid var(--border-color, #00ff00);
        padding: 6px 12px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .window-btn:hover {
        background-color: var(--button-hover, #2a2a2a);
        box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
    }

    .cursor-blink {
        display: inline-block;
        animation: blink 1s step-end infinite;
    }

    @keyframes blink {
        50% { opacity: 0; }
    }
</style>

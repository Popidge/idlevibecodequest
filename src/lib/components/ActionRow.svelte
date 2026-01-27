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

    /* Tablet Styles (900px - 1100px) */
    @media (max-width: 1100px) and (min-width: 901px) {
        .action-row {
            grid-template-columns: auto 1fr auto;
            gap: 8px;
            padding: 10px 6px;
            min-height: 50px;
        }

        .action-left {
            gap: 4px;
        }

        .action-buttons {
            gap: 6px;
        }

        .window-btn {
            padding: 4px 8px;
            font-size: 10px;
        }

        .action-center {
            padding: 0 8px;
        }

        .prompt-text {
            font-size: 12px;
        }

        .action-right {
            padding-right: 4px;
        }

        .prompt-btn {
            padding: 8px 10px;
            font-size: 14px;
        }
    }

    /* Narrow Tablet Styles (768px - 900px) - Stack buttons, wrap prompt text */
    @media (max-width: 900px) and (min-width: 768px) {
        .action-row {
            grid-template-columns: auto 1fr auto;
            gap: 6px;
            padding: 8px 6px;
            min-height: 60px;
        }

        .action-left {
            align-items: stretch;
        }

        .action-buttons {
            flex-direction: column;
            gap: 4px;
        }

        .window-btn {
            padding: 3px 6px;
            font-size: 9px;
            min-height: 24px;
        }

        .action-center {
            padding: 0 6px;
            align-items: flex-start;
        }

        .prompt-text {
            font-size: 11px;
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
            line-height: 1.4;
            word-break: break-word;
        }

        .action-right {
            padding-right: 2px;
        }

        .prompt-btn {
            padding: 6px 8px;
            font-size: 12px;
            white-space: nowrap;
        }
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

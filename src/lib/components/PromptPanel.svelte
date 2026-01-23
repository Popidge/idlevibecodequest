<script lang="ts">
    import { currentPrompt, handlePromptClick, floatTexts } from '$lib/game/store';

    function handleClick(event: MouseEvent) {
        handlePromptClick(event);
    }
</script>

<div class="bottom-bar">
    <div class="prompt-panel">
        <div class="prompt-row">
            <div class="prompt-display">
                <span class="prompt-cursor">></span> <span class="prompt-output">{currentPrompt}</span>
            </div>
            <button id="prompt-btn" class="prompt-button" onclick={handleClick}>&#62; PROMPT &#60;</button>
        </div>
    </div>
    <div class="footer-info">
        <span id="save-status">Auto-saves every 30s</span>
        <span class="footer-divider">│</span>
        <span>Game saved to localStorage</span>
        <span class="footer-divider">│</span>
        <span>Vibe-coded by <a href="https://github.com/Popidge">JT</a></span>
    </div>
</div>

<!-- Float text animations -->
{#each floatTexts as floatText (floatText.id)}
    <div 
        class="float-text" 
        style="left: {floatText.x}px; top: {floatText.y}px;"
    >
        {floatText.text}
    </div>
{/each}

<style>
    .bottom-bar {
        grid-column: 2 / 4;
        grid-row: 3;
        display: flex;
        flex-direction: column;
    }

    .prompt-panel {
        background-color: var(--panel-bg, #0f0f0f);
        border: 1px solid var(--border-color, #00ff00);
        padding: 8px 12px;
    }

    .prompt-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }

    .prompt-display {
        color: var(--text-secondary, #00cc00);
        font-size: 12px;
        flex: 1;
    }

    .prompt-cursor {
        color: var(--text-amber, #ffb000);
        animation: blink 1s infinite;
    }

    .prompt-output {
        color: var(--text-primary, #00ff00);
    }

    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }

    .prompt-button {
        background-color: var(--button-bg, #1a1a1a);
        color: var(--text-primary, #00ff00);
        border: 1px solid var(--border-color, #00ff00);
        padding: 8px 20px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        white-space: nowrap;
    }

    .prompt-button:hover {
        background-color: var(--button-hover, #2a2a2a);
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    }

    .prompt-button:active {
        background-color: var(--button-active, #3a3a3a);
        transform: scale(0.98);
    }

    .footer-info {
        grid-column: 2 / 4;
        display: flex;
        justify-content: center;
        gap: 15px;
        color: var(--text-dim, #008800);
        font-size: 11px;
        padding: 6px 0;
        align-items: center;
    }

    .footer-divider {
        color: var(--text-dim, #008800);
    }

    .float-text {
        position: fixed;
        color: var(--text-primary, #00ff00);
        font-size: 14px;
        font-weight: bold;
        pointer-events: none;
        animation: floatUp 1s ease-out forwards;
        z-index: 1000;
    }

    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-30px);
        }
    }

    a {
        color: var(--text-primary, #00ff00);
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }
</style>

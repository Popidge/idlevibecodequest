<script lang="ts">
    import { store } from '$lib/game/store.svelte';
</script>

<div class="mobile-action-area">
    <button class="mobile-prompt-btn" onclick={(e) => store.handlePromptClick(e)}>
        <span class="prompt-label">PROMPT</span>
    </button>
    <div class="prompt-text">
        <span class="cursor-blink">></span>
        <span class="text">{store.currentPrompt}</span>
    </div>
</div>

<style>
    .mobile-action-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background-color: var(--panel-bg);
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
    }
    
    .mobile-prompt-btn {
        width: 100%;
        min-height: 56px;
        background-color: var(--button-bg);
        border: 2px solid var(--border-color);
        color: var(--text-primary);
        font-family: var(--font-family);
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }
    
    .mobile-prompt-btn:active {
        background-color: var(--button-active);
        transform: scale(0.98);
    }
    
    .mobile-prompt-btn::before {
        content: '[';
        margin-right: 8px;
        opacity: 0.5;
    }
    
    .mobile-prompt-btn::after {
        content: ']';
        margin-left: 8px;
        opacity: 0.5;
    }
    
    .prompt-label {
        letter-spacing: 4px;
    }
    
    .prompt-text {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-secondary);
        font-size: 12px;
        font-style: italic;
        max-width: 100%;
        overflow: hidden;
    }
    
    .text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .cursor-blink {
        animation: blink 1s step-end infinite;
    }
    
    @keyframes blink {
        50% { opacity: 0; }
    }
</style>
<script lang="ts">
    import { store } from '$lib/game/store.svelte';
    import ThemeToggle from '../ThemeToggle.svelte';
    
    let { onToggleTuning }: { onToggleTuning?: () => void } = $props();
</script>

<div class="mobile-info-tab">
    <div class="info-section">
        <h3 class="section-title">Settings</h3>
        <div class="theme-row">
            <span class="row-label">Theme</span>
            <ThemeToggle />
        </div>
    </div>
    
    <div class="info-section">
        <h3 class="section-title">Game Controls</h3>
        <div class="button-row">
            <button class="control-btn save-btn" onclick={() => store.saveGame()}>
                Save Game
            </button>
            <button class="control-btn reset-btn" onclick={() => store.resetGame()}>
                Reset Game
            </button>
        </div>
        {#if onToggleTuning}
            <button class="control-btn tuning-btn" onclick={onToggleTuning}>
                Open Tuning
            </button>
        {/if}
    </div>
    
    <div class="info-section">
        <h3 class="section-title">About</h3>
        <div class="about-text">
            <p>Idle Vibe Code Quest v0.5</p>
            <p class="credits">Vibe Coded by JT</p>
            <p class="auto-save">Auto saves every 30s</p>
        </div>
    </div>
</div>

<style>
    .mobile-info-tab {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .info-section {
        background-color: var(--panel-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 16px;
    }
    
    .section-title {
        font-size: 14px;
        color: var(--text-primary);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border-color);
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .theme-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .row-label {
        color: var(--text-secondary);
        font-size: 14px;
    }
    
    .button-row {
        display: flex;
        gap: 12px;
    }
    
    .control-btn {
        flex: 1;
        min-height: 48px;
        background-color: var(--button-bg);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        font-family: var(--font-family);
        font-size: 14px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    .control-btn:hover {
        background-color: var(--button-hover);
    }
    
    .save-btn {
        border-color: var(--text-secondary);
    }
    
    .reset-btn {
        border-color: var(--text-amber);
        color: var(--text-amber);
    }
    
    .tuning-btn {
        margin-top: 12px;
        width: 100%;
        border-color: var(--text-cyan);
        color: var(--text-cyan);
    }
    
    .about-text {
        text-align: center;
        color: var(--text-dim);
    }
    
    .about-text p {
        margin: 4px 0;
    }
    
    .credits {
        font-size: 12px;
    }
    
    .auto-save {
        font-size: 11px;
        opacity: 0.7;
    }
</style>
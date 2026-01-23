<script lang="ts">
    import { store } from '$lib/game/store.svelte';
    
    function dismissHint(id: number) {
        store.dismissHint(id);
    }
</script>

<div class="hints-container">
    {#each store.hints.slice(0, 2) as hint (hint.id)}
        <button 
            class="hint" 
            onclick={() => dismissHint(hint.id)}
            aria-label="Dismiss hint"
        >
            <span class="hint-icon">💡</span>
            <span class="hint-text">{hint.message}</span>
            <span class="hint-dismiss">×</span>
        </button>
    {/each}
</div>

<style>
    .hints-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 100;
        pointer-events: none;
    }
    
    .hint {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: #1a1a1a;
        border: 1px solid #ffb000;
        color: #ffb000;
        padding: 8px 12px;
        font-size: 11px;
        font-family: 'Courier New', monospace;
        cursor: pointer;
        pointer-events: auto;
        max-width: 280px;
        animation: slideIn 0.3s ease-out;
        transition: all 0.2s ease;
    }
    
    .hint:hover {
        background-color: #2a2a1a;
    }
    
    .hint-icon {
        flex-shrink: 0;
        font-size: 12px;
    }
    
    .hint-text {
        flex: 1;
        text-align: left;
    }
    
    .hint-dismiss {
        flex-shrink: 0;
        font-size: 14px;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    
    .hint:hover .hint-dismiss {
        opacity: 1;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
</style>

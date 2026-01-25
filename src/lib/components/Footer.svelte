<script lang="ts">
    import { store } from '$lib/game/store.svelte';
</script>

<div class="footer">
    <div class="footer-content">
        <span class="auto-save-text">Auto saves every 30s</span>
        <span class="auto-save-text">Vibe Coded by JT</span>
    </div>
</div>

<style>
    .footer {
        grid-column: 1 / -1;
        grid-row: 4;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px 10px;
        border-top: 1px solid var(--border-color, #00ff00);
        font-size: 10px;
    }

    .footer-content {
        display: flex;
        gap: 30px;
        align-items: center;
    }

    .auto-save-text {
        color: var(--text-dim, #008800);
    }

    .debt-indicator {
        color: var(--text-primary, #00ff00);
    }

    .debt-indicator.warning {
        color: var(--text-amber, #ffb000);
    }
</style>

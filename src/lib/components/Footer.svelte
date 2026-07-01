<script lang="ts">
    import { store } from '$lib/game/store.svelte';
</script>

<div class="footer">
    <div class="footer-content">
        <span class="auto-save-text">Auto saves every 30s</span>
        <a class="github-link" href="https://github.com/popidge/idlevibecodequest" target="_blank" rel="noopener noreferrer">
            Vibe Coded by JT
        </a>
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

    .github-link {
        color: var(--text-dim, #008800);
        text-decoration: none;
        transition: color 0.15s ease;
    }

    .github-link:hover {
        color: var(--text-primary, #00ff00);
    }

</style>

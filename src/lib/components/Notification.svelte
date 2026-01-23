<script lang="ts">
    import { store } from '$lib/game/store.svelte';
</script>

{#each store.notifications as notification (notification.id)}
    <div class="notification">
        {notification.message}
    </div>
{/each}

<style>
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--button-bg, #1a1a1a);
        border: 2px solid var(--text-amber, #ffb000);
        color: var(--text-primary, #00ff00);
        padding: 15px 20px;
        font-size: 12px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
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

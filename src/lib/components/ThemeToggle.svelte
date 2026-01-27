<script lang="ts">
    import { store } from '$lib/game/store.svelte';

    type Theme = 'terminal' | 'ide' | 'vibe-ai';

    const themes: { id: Theme; label: string; icon: string }[] = [
        { id: 'terminal', label: 'Terminal', icon: '⌨️' },
        { id: 'ide', label: 'IDE', icon: '💻' },
        { id: 'vibe-ai', label: 'Vibe AI', icon: '✨' }
    ];

    function setTheme(theme: Theme) {
        store.setTheme(theme);
    }
</script>

<div class="theme-toggle-container">
    <div class="theme-toggle">
        {#each themes as theme}
            <button
                class="theme-toggle-btn"
                class:active={store.currentTheme === theme.id}
                onclick={() => setTheme(theme.id)}
                title={theme.label}
            >
                <span class="theme-icon">{theme.icon}</span>
                <span class="theme-label">{theme.label}</span>
            </button>
        {/each}
    </div>
</div>

<style>
    .theme-toggle-container {
        position: absolute;
        top: 45px;
        right: 5px;
        z-index: 50;
    }

    .theme-toggle {
        display: flex;
        gap: 4px;
        padding: 4px;
        background: var(--panel-bg);
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        box-shadow: var(--panel-shadow);
    }

    .theme-toggle-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: transparent;
        border: none;
        color: var(--text-dim);
        font-family: var(--font-family);
        font-size: var(--font-size-xs);
        cursor: pointer;
        border-radius: calc(var(--border-radius) - 2px);
        transition: all 0.2s ease;
        white-space: nowrap;
    }

    .theme-toggle-btn:hover {
        color: var(--text-secondary);
        background: var(--button-bg);
    }

    .theme-toggle-btn.active {
        color: var(--text-primary);
        background: var(--button-active);
    }

    .theme-icon {
        font-size: 14px;
        line-height: 1;
    }

    .theme-label {
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Terminal theme specific */
    :global([data-theme="terminal"]) .theme-toggle-btn {
        font-family: 'Courier New', monospace;
    }

    :global([data-theme="terminal"]) .theme-icon {
        display: none;
    }

    :global([data-theme="terminal"]) .theme-toggle-btn.active {
        background: var(--text-primary);
        color: var(--panel-bg);
    }

    /* IDE theme specific */
    :global([data-theme="ide"]) .theme-toggle {
        border-radius: 6px;
    }

    :global([data-theme="ide"]) .theme-toggle-btn {
        border-radius: 4px;
        font-weight: 500;
    }

    :global([data-theme="ide"]) .theme-toggle-btn.active {
        background: #0e639c;
        color: #ffffff;
    }

    /* Vibe AI theme specific */
    :global([data-theme="vibe-ai"]) .theme-toggle {
        background: rgba(139, 92, 246, 0.1);
        border-color: rgba(139, 92, 246, 0.3);
        border-radius: 12px;
        padding: 6px;
    }

    :global([data-theme="vibe-ai"]) .theme-toggle-btn {
        border-radius: 8px;
        font-weight: 500;
    }

    :global([data-theme="vibe-ai"]) .theme-toggle-btn.active {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(249, 115, 22, 0.4));
        color: #ffffff;
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
    }

    :global([data-theme="vibe-ai"]) .theme-icon {
        filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
    }

    /* Responsive adjustments */
    @media (max-width: 900px) {
        .theme-toggle-container {
            position: relative;
            top: auto;
            right: auto;
            margin-bottom: 10px;
        }

        .theme-toggle {
            justify-content: center;
        }

        .theme-label {
            display: none;
        }

        .theme-toggle-btn {
            padding: 8px;
        }
    }
</style>

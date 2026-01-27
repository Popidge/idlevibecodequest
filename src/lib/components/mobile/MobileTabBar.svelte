<script lang="ts">
    import type { MobileTab } from '$lib/stores/responsive';
    
    let { activeTab, onTabChange }: { activeTab: MobileTab, onTabChange: (tab: MobileTab) => void } = $props();
    
    const tabs: { id: MobileTab; label: string; icon: string }[] = [
        { id: 'projects', label: 'Projects', icon: '📦' },
        { id: 'upgrades', label: 'Upgrades', icon: '⬆️' },
        { id: 'stats', label: 'Stats', icon: '📊' },
        { id: 'info', label: 'Info', icon: 'ℹ️' }
    ];
    
    function handleTabClick(tabId: MobileTab) {
        onTabChange(tabId);
    }
</script>

<div class="mobile-tab-bar">
    {#each tabs as tab}
        <button 
            class="tab-button"
            class:active={activeTab === tab.id}
            onclick={() => handleTabClick(tab.id)}
        >
            <span class="tab-icon">{tab.icon}</span>
            <span class="tab-label">{tab.label}</span>
        </button>
    {/each}
</div>

<style>
    .mobile-tab-bar {
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: var(--panel-bg);
        border-top: 1px solid var(--border-color);
        padding: 8px 0;
        flex-shrink: 0;
        gap: 4px;
    }
    
    .tab-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        flex: 1;
        min-height: 56px;
        background: transparent;
        border: none;
        color: var(--text-dim);
        font-family: var(--font-family);
        font-size: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 8px;
        padding: 4px;
    }
    
    .tab-button.active {
        color: var(--text-primary);
        background-color: var(--tab-active-bg);
    }
    
    .tab-icon {
        font-size: 20px;
        line-height: 1;
    }
    
    .tab-label {
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
</style>
<script lang="ts">
    import { UPGRADES } from '$lib/game/constants';
    import { store, formatNumber } from '$lib/game/store.svelte';
    import { getUpgradeCost, getEffectiveRequiredCredForUpgrade } from '$lib/game/utils';

    type UpgradeType = 'vibeCode' | 'delegation';
    const upgradeTypes: { key: UpgradeType; label: string }[] = [
        { key: 'vibeCode', label: 'VIBE CODE' },
        { key: 'delegation', label: 'DELEGATION' }
    ];

    function handleTabClick(type: UpgradeType) {
        store.switchTab('upgrades', type);
    }
    
    // Get effective click power reactively
    let clickPower = $state(store.effectiveClickPower);
    
    $effect(() => {
        clickPower = store.effectiveClickPower;
    });
</script>

<div class="panel upgrades-panel">
    <div class="panel-header">
        ┌─ UPGRADES ──────────────────────────────────────┐
        <div class="tab-bar">
            {#each upgradeTypes as type}
                <button 
                    class="tab-btn" 
                    class:active={store.gameState.activeTab.upgrades === type.key}
                    onclick={() => handleTabClick(type.key)}
                >
                    [ {type.label} ]
                </button>
            {/each}
        </div>
    </div>
    <div class="panel-content upgrades-content">
        {#each upgradeTypes as type}
            <div class="tab-content" class:active={store.gameState.activeTab.upgrades === type.key}>
                <div class="item-list">
                    {#each UPGRADES[type.key] as upgrade}
                        {@const isUnlocked = upgrade.level <= store.maxUpgradeLevel}
                        {@const currentCount = store.gameState.upgrades[type.key][upgrade.level] || 0}
                        {@const currentCost = getUpgradeCost(upgrade, currentCount)}
                        {@const canAfford = store.gameState.resources.money >= currentCost}
                        {@const delegLocSec = type.key === 'delegation' ? (upgrade.level + (0.02 * clickPower)).toFixed(2) : '0'}
                        <button 
                            class="upgrade-item"
                            class:locked={!isUnlocked}
                            class:purchased={currentCount > 0}
                            class:affordable={isUnlocked && canAfford}
                            onclick={() => isUnlocked && store.buyUpgrade(type.key, upgrade.level)}
                            disabled={!isUnlocked}
                        >
                            {#if !isUnlocked}
                                <span class="item-name">🔒 {upgrade.name}</span>
                                {@const reducedCred = getEffectiveRequiredCredForUpgrade(upgrade.level, store.effectiveCredThresholdReduction)}
                                <span class="item-locked-text">Need {reducedCred} Cred</span>
                            {:else}
                                <span class="item-name">
                                    {upgrade.name}
                                    {#if currentCount > 0}
                                        <span class="count-badge">[Owned: {currentCount}]</span>
                                    {/if}
                                </span>
                                <span class="item-cost">${formatNumber(currentCost)}</span>
                                <span class="item-reward">
                                    → {type.key === 'delegation' ? `+${delegLocSec} LoC/sec` : upgrade.desc}
                                </span>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
    <div class="panel-footer upgrades-footer">└───────────────────────────────────────────────────┘</div>
</div>

<style>
    .panel {
        background-color: var(--panel-bg, #0f0f0f);
        display: flex;
        flex-direction: column;
    }

    .upgrades-panel {
        grid-column: 3;
        grid-row: 2;
        min-height: 0;
    }

    .panel-header {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        white-space: pre;
        padding: 4px 0;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .panel-content {
        flex: 1;
        overflow: auto;
        padding: 10px;
        border-left: 1px solid var(--border-color, #00ff00);
        border-right: 1px solid var(--border-color, #00ff00);
    }

    .panel-footer {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        white-space: pre;
        padding: 4px 0;
        flex-shrink: 0;
    }

    .upgrades-footer {
        border: none !important;
    }

    .tab-bar {
        display: flex;
        gap: 2px;
        padding: 4px 0;
    }

    .tab-btn {
        background-color: transparent;
        color: var(--text-dim, #008800);
        border: 1px solid transparent;
        padding: 4px 12px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .tab-btn:hover {
        color: var(--text-secondary, #00cc00);
        border-color: var(--text-dim, #008800);
    }

    .tab-btn.active {
        color: var(--text-primary, #00ff00);
        background-color: var(--tab-active-bg, #1a3a1a);
        border-color: var(--tab-active-border, #00ff00);
    }

    .tab-content {
        display: none;
        height: 100%;
    }

    .tab-content.active {
        display: block;
    }

    .item-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .upgrade-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 10px;
        background-color: var(--button-bg, #1a1a1a);
        border: 1px solid var(--text-dim, #008800);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-wrap: nowrap;
        gap: 10px;
        font-family: 'Courier New', monospace;
        text-align: left;
        width: 100%;
    }

    .upgrade-item:hover:not(.locked):not(.purchased) {
        background-color: var(--button-hover, #2a2a2a);
        border-color: var(--border-color, #00ff00);
    }

    .upgrade-item.locked {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .upgrade-item.purchased {
        background-color: #1a2a1a;
        border-color: var(--text-dim, #008800);
        cursor: default;
    }

    .upgrade-item.affordable {
        background-color: #1a3a1a;
        border-color: var(--text-secondary, #00cc00);
        box-shadow: 0 0 6px rgba(0, 255, 0, 0.2);
    }

    .upgrade-item.affordable:hover {
        background-color: #2a4a2a;
        border-color: var(--text-primary, #00ff00);
    }

    .item-name {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        flex: 0 0 auto;
    }

    .count-badge {
        color: var(--text-amber, #ffb000);
    }

    .item-cost {
        color: var(--text-amber, #ffb000);
        font-size: 12px;
        white-space: nowrap;
        flex: 0 0 auto;
    }

    .item-reward {
        color: var(--text-secondary, #00cc00);
        font-size: 12px;
        white-space: nowrap;
        flex: 0 0 auto;
    }

    .item-locked-text {
        color: var(--text-amber, #ffb000);
        font-size: 12px;
        font-weight: bold;
    }

    .upgrades-panel .panel-content,
    .upgrades-panel .tab-content {
        overflow-y: auto;
        overflow-x: hidden;
    }
</style>

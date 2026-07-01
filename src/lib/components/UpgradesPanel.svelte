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

    let showLocked = $state(false);
    
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
                <div class="item-list" class:show-locked={showLocked}>
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
                <button class="desktop-locked-toggle" class:expanded={showLocked} onclick={() => showLocked = !showLocked} aria-expanded={showLocked}>
                    <span>▣ &nbsp; LOCKED UPGRADES <b>{showLocked ? '⌃' : '⌄'}</b></span>
                    <small>Reveal upcoming upgrades and their Cred requirements.</small>
                </button>
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

    /* Tablet Styles (768px - 1100px) */
    @media (min-width: 1101px) {
        .upgrades-panel { grid-column:auto; grid-row:auto; border:1px solid color-mix(in srgb,var(--border-color) 35%,transparent); border-radius:var(--border-radius); overflow:hidden; }
        .panel-header { padding:14px 16px 8px; font-size:0; white-space:normal; }
        .panel-header::before { content:'ϟ  UPGRADES'; font-size:14px; letter-spacing:.5px; }
        .tab-bar { margin-top:8px; gap:5px; }
        .tab-btn { min-height:34px; padding:6px 18px; font-size:12px; border-color:color-mix(in srgb,var(--text-dim) 60%,transparent); }
        .panel-content { border:0; padding:6px 16px 14px; }
        .item-list { gap:9px; }
        .upgrade-item.locked { display:none; }
        .item-list.show-locked .upgrade-item.locked { display:grid; }
        .upgrade-item { min-height:66px; padding:12px 14px; display:grid; grid-template-columns:1fr auto; grid-template-rows:auto auto; gap:6px 10px; border-radius:var(--border-radius); }
        .item-name { grid-column:1/-1; font-size:13px; }
        .item-cost, .item-reward, .item-locked-text { font-size:12px; }
        .item-reward, .item-locked-text { justify-self:end; }
        .panel-footer { display:none; }
        .desktop-locked-toggle { width:100%; min-height:58px; margin-top:10px; padding:11px 13px; display:flex; flex-direction:column; justify-content:center; gap:6px; border:1px dashed color-mix(in srgb,var(--text-amber) 55%,transparent); border-radius:var(--border-radius); color:var(--text-amber); background:transparent; font-family:var(--font-family); text-align:left; cursor:pointer; }
        .desktop-locked-toggle:hover, .desktop-locked-toggle.expanded { background:color-mix(in srgb,var(--text-amber) 7%,transparent); border-color:var(--text-amber); }
        .desktop-locked-toggle span { display:flex; justify-content:space-between; }
        .desktop-locked-toggle small { color:var(--text-dim); padding-left:22px; }
    }

    @media (max-width: 1100px) and (min-width: 768px) {
        .desktop-locked-toggle { display:none; }
        .upgrades-panel {
            grid-column: auto;
            grid-row: auto;
        }

        .panel-header {
            font-size: 11px;
            padding: 4px;
        }

        .panel-content {
            padding: 6px;
        }

        .tab-bar {
            gap: 2px;
            padding: 2px 0;
        }

        .tab-btn {
            padding: 3px 8px;
            font-size: 11px;
        }

        .item-list {
            gap: 4px;
        }

        .upgrade-item {
            padding: 6px 8px;
        }

        .item-name {
            font-size: 11px;
        }

        .item-cost {
            font-size: 11px;
        }

        .item-reward {
            font-size: 10px;
        }

        .item-locked-text {
            font-size: 10px;
        }

        .panel-footer {
            font-size: 10px;
        }
    }

    /* Mobile Styles */
    @media (max-width: 767px) {
        .desktop-locked-toggle { display:none; }
        .upgrades-panel {
            grid-column: auto;
            grid-row: auto;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .panel-header {
            font-size: 11px;
            padding: 8px 12px;
            white-space: normal;
        }

        .panel-content {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
        }

        .tab-bar {
            padding: 8px 0;
            gap: 4px;
        }

        .tab-btn {
            flex: 1;
            padding: 8px 4px;
            font-size: 11px;
            min-height: 44px;
        }

        .item-list {
            gap: 8px;
        }

        .upgrade-item {
            min-height: 60px;
            padding: 12px 16px;
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
        }

        .item-name {
            font-size: 14px;
            width: 100%;
            display: flex;
            justify-content: space-between;
        }

        .item-cost {
            font-size: 13px;
        }

        .item-reward {
            font-size: 12px;
            color: var(--text-secondary);
        }

        .panel-footer {
            display: none;
        }
    }
</style>

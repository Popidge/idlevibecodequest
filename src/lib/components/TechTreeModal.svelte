<script lang="ts">
    import { store, formatNumber } from '$lib/game/store.svelte';
    import { TECH_TREES } from '$lib/game/constants';
    import type { TechTreePath } from '$lib/game/types';

    const trees = [
        { id: 'buyout' as TechTreePath, ...TECH_TREES.buyout },
        { id: 'nirvana' as TechTreePath, ...TECH_TREES.nirvana },
        { id: 'linus' as TechTreePath, ...TECH_TREES.linus },
        { id: 'learning' as TechTreePath, ...TECH_TREES.learning }
    ];

    // Get the active tree based on the current tab
    let activeTree = $derived(trees.find(t => t.id === store.activeTechTreeTab));

    function handleClose() {
        store.closeTechTree();
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            handleClose();
        }
    }

    function handlePurchase(path: TechTreePath, nodeIndex: number) {
        store.purchaseTechTreeNode(path, nodeIndex);
    }

    function formatEffectValue(effect: string, value: number): string {
        switch (effect) {
            case 'startingCash':
                return `+$${formatNumber(value)}`;
            case 'cashMultiplier':
            case 'locMultiplier':
            case 'credMultiplier':
            case 'debtAccumulationReduction':
            case 'debtPenaltyMitigation':
                return `+${(value * 100).toFixed(0)}%`;
            case 'prestigePointMultiplier':
                return `+${(value * 100).toFixed(0)}%`;
            case 'debtClearingMultiplier':
                return `${value}×`;
            case 'autoPurchaseThreshold':
                return `${(value * 100).toFixed(0)}% of LoC`;
            case 'locPerClick':
                return `+${(value * 100).toFixed(0)}%`;
            case 'passiveLocRate':
                return `+${(value * 100).toFixed(0)}%`;
            case 'credThresholdReduction':
                return `${value} cred earlier`;
            default:
                console.warn(`Unknown effect type: ${effect}`);
                return `${value}`;
        }
    }
</script>

{#if store.showTechTreeModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Tech Tree">
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">┌─ TECH TREE ──────────────────────┐</div>
            <div class="modal-body">
                <div class="points-display">
                    <span class="points-icon">⭐</span>
                    <span class="points-value">{store.totalPrestigePoints}</span>
                    <span class="points-label">Prestige Points Available</span>
                </div>

                <div class="tabs">
                    {#each trees as tree}
                        <button
                            class="tab"
                            class:active={store.activeTechTreeTab === tree.id}
                            style="--tab-color: {tree.color}"
                            onclick={() => store.setActiveTechTreeTab(tree.id)}
                        >
                            <span class="tab-icon">{tree.icon}</span>
                            <span class="tab-name">{tree.name}</span>
                        </button>
                    {/each}
                </div>

                <div class="tree-content">
                    {#if activeTree}
                            <div class="tree-description">{activeTree.description}</div>

                            <div class="nodes-container">
                                {#each activeTree.nodes as node, index}
                                    {@const isPurchased = store.getPurchasedNodes(activeTree.id).includes(index)}
                                    {@const canPurchase = store.canPurchaseNode(activeTree.id, index)}
                                    {@const isLocked = !isPurchased && !canPurchase}
                                    {@const previousPurchased = index === 0 || store.getPurchasedNodes(activeTree.id).includes(index - 1)}

                                    <div class="node-wrapper">
                                        {#if index > 0}
                                            <div class="connector" class:purchased={previousPurchased}></div>
                                        {/if}
                                        <button
                                            class="node"
                                            class:purchased={isPurchased}
                                            class:available={canPurchase && !isPurchased}
                                            class:locked={isLocked}
                                            style="--node-color: {activeTree.color}"
                                            onclick={() => handlePurchase(activeTree.id, index)}
                                            disabled={isLocked || isPurchased}
                                        >
                                            <div class="node-status">
                                                {#if isPurchased}
                                                    <span class="check">✓</span>
                                                {:else if isLocked}
                                                    <span class="lock">🔒</span>
                                                {:else}
                                                    <span class="cost">{node.cost} pts</span>
                                                {/if}
                                            </div>
                                            <div class="node-name">{node.name}</div>
                                            <div class="node-description">{node.description}</div>
                                            <div class="node-effect">
                                                {formatEffectValue(node.effect, node.effectValue)}
                                            </div>
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn cancel" onclick={handleClose}>CLOSE</button>
            </div>
            <div class="modal-corner">└─────────────────────────────┘</div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .modal-content {
        background-color: var(--panel-bg, #0f0f0f);
        border: 2px solid var(--text-cyan, #00ccff);
        min-width: 500px;
        max-width: 700px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 40px rgba(0, 204, 255, 0.2);
    }

    .modal-header {
        color: var(--text-cyan, #00ccff);
        font-size: 12px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--text-cyan, #00ccff);
        text-align: center;
    }

    .modal-body {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
    }

    .points-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px;
        background-color: rgba(0, 204, 255, 0.1);
        border: 1px solid var(--text-cyan, #00ccff);
        border-radius: 4px;
        margin-bottom: 16px;
    }

    .points-display .points-icon {
        font-size: 24px;
    }

    .points-display .points-value {
        color: var(--text-cyan, #00ccff);
        font-size: 28px;
        font-weight: bold;
    }

    .points-display .points-label {
        color: var(--text-secondary, #00cc00);
        font-size: 12px;
    }

    .tabs {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 16px;
    }

    .tab {
        background-color: rgba(26, 26, 26, 0.8);
        border: 1px solid var(--tab-color, #00ff00);
        padding: 8px 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .tab:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .tab.active {
        background-color: var(--tab-color, #00ff00);
        color: var(--panel-bg, #0f0f0f);
    }

    .tab-icon {
        font-size: 20px;
    }

    .tab-name {
        font-size: 10px;
        text-align: center;
        line-height: 1.2;
    }

    .tree-description {
        text-align: center;
        color: var(--text-secondary, #00cc00);
        font-size: 12px;
        margin-bottom: 16px;
    }

    .nodes-container {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .node-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .connector {
        width: 2px;
        height: 20px;
        background-color: #333;
        transition: background-color 0.3s ease;
    }

    .connector.purchased {
        background-color: var(--node-color, #00ff00);
    }

    .node {
        background-color: rgba(26, 26, 26, 0.8);
        border: 2px solid #333;
        padding: 12px;
        width: 100%;
        max-width: 400px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        gap: 4px 12px;
        text-align: left;
    }

    .node:disabled {
        cursor: default;
    }

    .node.available {
        border-color: var(--node-color, #00ff00);
    }

    .node.available:hover {
        background-color: rgba(255, 255, 255, 0.1);
        transform: translateX(4px);
    }

    .node.purchased {
        border-color: var(--node-color, #00ff00);
        background-color: rgba(0, 255, 0, 0.1);
    }

    .node.locked {
        opacity: 0.5;
        border-color: #333;
    }

    .node-status {
        grid-row: span 2;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
    }

    .check {
        color: var(--node-color, #00ff00);
        font-size: 20px;
        font-weight: bold;
    }

    .lock {
        font-size: 16px;
    }

    .cost {
        color: var(--node-color, #00ff00);
        font-size: 14px;
        font-weight: bold;
    }

    .node-name {
        color: var(--text-primary, #00ff00);
        font-size: 14px;
        font-weight: bold;
    }

    .node.purchased .node-name {
        color: var(--node-color, #00ff00);
    }

    .node-description {
        color: var(--text-dim, #008800);
        font-size: 11px;
        grid-column: 2;
    }

    .node-effect {
        color: var(--node-color, #00ff00);
        font-size: 12px;
        font-weight: bold;
        grid-column: 2;
    }

    .modal-footer {
        display: flex;
        gap: 12px;
        padding: 12px 16px;
        border-top: 1px solid var(--text-cyan, #00ccff);
        justify-content: center;
    }

    .modal-corner {
        color: var(--text-cyan, #00ccff);
        font-size: 12px;
        padding: 4px 12px 8px;
        text-align: right;
    }

    .action-btn.cancel {
        background-color: var(--button-bg, #1a1a1a);
        color: var(--text-secondary, #00cc00);
        border: 1px solid var(--border-color, #00ff00);
        padding: 10px 24px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .action-btn.cancel:hover {
        background-color: var(--button-hover, #2a2a2a);
    }
</style>

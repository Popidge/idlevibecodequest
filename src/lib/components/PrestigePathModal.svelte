<script lang="ts">
    import { store, formatNumber } from '$lib/game/store.svelte';
    import type { PrestigePath } from '$lib/game/types';
    import { PRESTIGE } from '$lib/game/constants';
    
    const { DEBT_RELIEF_PER_POINT, DEBT_ACCUMULATION_REDUCTION, DEBT_PENALTY_REDUCTION } = PRESTIGE;
    
    const paths = [
        {
            id: 'buyout' as PrestigePath,
            name: 'Big Company Buyout',
            icon: '💰',
            description: 'Starting cash boost + cash income multiplier',
            color: '#00ff00'
        },
        {
            id: 'nirvana' as PrestigePath,
            name: 'Tech Bro Nirvana',
            icon: '💻',
            description: 'LoC generation multiplier',
            color: '#00ccff'
        },
        {
            id: 'linus' as PrestigePath,
            name: 'The Linus Effect',
            icon: '⭐',
            description: 'Credibility gain multiplier',
            color: '#ffb000'
        },
        {
            id: 'learning' as PrestigePath,
            name: 'Learning to... Code?',
            icon: '📚',
            description: 'Tech debt mitigation & clearing efficiency',
            color: '#ff00ff'
        }
    ] as const;
    
    function handleSelectPath(pathId: PrestigePath) {
        store.performPrestige(pathId);
    }
    
    function handleClose() {
        store.closePrestigePathModal();
    }
    
    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            handleClose();
        }
    }
    
    function formatMultiplier(value: number): string {
        return (value * 100).toFixed(0) + '%';
    }
</script>

{#if store.showPrestigeModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Select Prestige Path">
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">┌─ CHOOSE YOUR PATH ───────────┐</div>
            <div class="modal-body">
                <p class="intro-text">Select a prestige path to commit your {store.prestigePointsToEarn} point{store.prestigePointsToEarn > 1 ? 's' : ''}. This choice is permanent for this prestige!</p>
                
                <div class="paths-container">
                    {#each paths as path}
                        {@const points = store.prestigePointsToEarn}
                        {@const currentTotal = store.gameState.prestige?.bonuses ?? { startingCash: 0, cashMultiplier: 0, locMultiplier: 0, credMultiplier: 0 }}
                        
                        <button 
                            class="path-card"
                            style="--path-color: {path.color}"
                            onclick={() => handleSelectPath(path.id)}
                        >
                            <div class="path-icon">{path.icon}</div>
                            <div class="path-name">{path.name}</div>
                            <div class="path-description">{path.description}</div>
                            
                            <div class="path-bonuses">
                                {#if path.id === 'buyout'}
                                    <div class="bonus-row">
                                        <span class="bonus-label">Starting Cash:</span>
                                        <span class="bonus-value">+${formatNumber(points * 5000)}</span>
                                    </div>
                                    <div class="bonus-row">
                                        <span class="bonus-label">Cash Multiplier:</span>
                                        <span class="bonus-value">+{formatMultiplier(points * 0.20)}</span>
                                    </div>
                                    <div class="bonus-row total">
                                        <span class="bonus-label">Total Starting:</span>
                                        <span class="bonus-value">${formatNumber(currentTotal.startingCash + (points * 5000))}</span>
                                    </div>
                                    <div class="bonus-row total">
                                        <span class="bonus-label">Total Cash Bonus:</span>
                                        <span class="bonus-value">+{formatMultiplier(currentTotal.cashMultiplier + (points * 0.20))}</span>
                                    </div>
                                {:else if path.id === 'nirvana'}
                                    <div class="bonus-row">
                                        <span class="bonus-label">LoC Multiplier:</span>
                                        <span class="bonus-value">+{formatMultiplier(points * 0.15)}</span>
                                    </div>
                                    <div class="bonus-row total">
                                        <span class="bonus-label">Total LoC Bonus:</span>
                                        <span class="bonus-value">+{formatMultiplier(currentTotal.locMultiplier + (points * 0.15))}</span>
                                    </div>
                                {:else if path.id === 'linus'}
                                    <div class="bonus-row">
                                        <span class="bonus-label">Cred Multiplier:</span>
                                        <span class="bonus-value">+{formatMultiplier(points * 0.25)}</span>
                                    </div>
                                    <div class="bonus-row total">
                                        <span class="bonus-label">Total Cred Bonus:</span>
                                        <span class="bonus-value">+{formatMultiplier(currentTotal.credMultiplier + (points * 0.25))}</span>
                                    </div>
                                {:else}
                                    <div class="bonus-row">
                                        <span class="bonus-label">Debt Relief:</span>
                                        <span class="bonus-value">-{(points * DEBT_RELIEF_PER_POINT * 100).toFixed(0)}%</span>
                                    </div>
                                    <div class="bonus-row">
                                        <span class="bonus-label">Debt Reduction:</span>
                                        <span class="bonus-value">-{formatMultiplier(points * DEBT_ACCUMULATION_REDUCTION)}</span>
                                    </div>
                                    <div class="bonus-row total">
                                        <span class="bonus-label">Penalty Reduction:</span>
                                        <span class="bonus-value">-{formatMultiplier(points * DEBT_PENALTY_REDUCTION)}</span>
                                    </div>
                                {/if}
                            </div>
                            
                            <div class="select-btn">SELECT</div>
                        </button>
                    {/each}
                </div>
                
                <div class="current-points">
                    <span class="points-icon">⭐</span>
                    <span class="points-value">{store.gameState.prestige?.prestigePoints ?? 0}</span>
                    <span class="points-label">Total Prestige Points</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn cancel" onclick={handleClose}>BACK</button>
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
        border: 2px solid var(--text-amber, #ffb000);
        min-width: 500px;
        max-width: 700px;
        box-shadow: 0 0 40px rgba(255, 176, 0, 0.2);
    }
    
    .modal-header {
        color: var(--text-amber, #ffb000);
        font-size: 12px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--text-amber, #ffb000);
        text-align: center;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .intro-text {
        color: var(--text-secondary, #00cc00);
        font-size: 13px;
        text-align: center;
        margin: 0 0 20px;
    }
    
    .paths-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
    }
    
    .path-card {
        background-color: rgba(26, 26, 26, 0.8);
        border: 2px solid var(--path-color, #00ff00);
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .path-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px var(--path-color);
        background-color: var(--path-color);
    }
    
    .path-card:hover .path-name,
    .path-card:hover .path-description,
    .path-card:hover .bonus-label,
    .path-card:hover .bonus-value,
    .path-card:hover .select-btn {
        color: var(--panel-bg, #0f0f0f);
    }
    
    .path-card:hover .bonus-row.total {
        border-top-color: var(--path-color);
    }
    
    .path-icon {
        font-size: 36px;
        margin-bottom: 8px;
    }
    
    .path-name {
        color: var(--path-color, #00ff00);
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 4px;
    }
    
    .path-description {
        color: var(--text-secondary, #00cc00);
        font-size: 11px;
        margin-bottom: 12px;
    }
    
    .path-bonuses {
        width: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 12px;
    }
    
    .bonus-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        font-size: 11px;
    }
    
    .bonus-row.total {
        border-top: 1px dashed var(--path-color, #00ff00);
        margin-top: 6px;
        padding-top: 6px;
    }
    
    .bonus-label {
        color: var(--text-dim, #008800);
    }
    
    .bonus-value {
        color: var(--path-color, #00ff00);
        font-weight: bold;
    }
    
    .select-btn {
        background-color: var(--path-color, #00ff00);
        color: var(--panel-bg, #0f0f0f);
        padding: 6px 20px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .current-points {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        background-color: rgba(255, 176, 0, 0.1);
        border: 1px solid var(--text-amber, #ffb000);
        border-radius: 4px;
    }
    
    .current-points .points-icon {
        font-size: 20px;
    }
    
    .current-points .points-value {
        color: var(--text-amber, #ffb000);
        font-size: 24px;
        font-weight: bold;
    }
    
    .current-points .points-label {
        color: var(--text-secondary, #00cc00);
        font-size: 12px;
    }
    
    .modal-footer {
        display: flex;
        gap: 12px;
        padding: 12px 16px;
        border-top: 1px solid var(--text-amber, #ffb000);
        justify-content: center;
    }
    
    .modal-corner {
        color: var(--text-amber, #ffb000);
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

<script lang="ts">
    import { defaultConfig, simulateGameplay, type TuningConfig, type SimulationResult } from '$lib/game/tuning-sim';
    import TuningControls from './TuningControls.svelte';
    import MetricsDisplay from './MetricsDisplay.svelte';

    interface Props {
        onClose: () => void;
    }

    let { onClose }: Props = $props();

    let config = $state<TuningConfig>({ ...defaultConfig });
    let result = $state<SimulationResult | null>(null);
    let simulationTime = $state(0);

    // Track config changes for reactivity
    let configChangeTracker = $derived({
        clickRate: config.clickRate,
        baseDebtPerClick: config.baseDebtPerClick,
        techTreeLocMultiplier: config.techTreeLocMultiplier,
        techTreePassiveLocBonus: config.techTreePassiveLocBonus,
        techTreeMoneyMultiplier: config.techTreeMoneyMultiplier,
        techTreeLocPerClickBonus: config.techTreeLocPerClickBonus,
        upgradeCostMultiplier: config.upgradeCostMultiplier,
        prestigeThresholdPercent: config.prestigeThresholdPercent,
        startingCashPerPoint: config.startingCashPerPoint,
    });

    function runSimulation() {
        const startTime = performance.now();
        result = simulateGameplay(config, 3600);
        simulationTime = performance.now() - startTime;
    }

    // Auto-run on mount and when config changes
    $effect(() => {
        // Depend on configChangeTracker to trigger rerun on config changes
        void configChangeTracker;
        runSimulation();
    });
</script>

<div class="modal-backdrop" onclick={onClose} role="dialog" aria-modal="true" aria-label="Game Balance Tuning">
    <div class="modal-content tuning-modal" onclick={(e) => e.stopPropagation()}>
        <div class="modal-header">
            <span class="header-title">┌─ GAME BALANCE TUNING ─┐</span>
            <button class="close-btn" onclick={onClose}>[X]</button>
        </div>
        
        <div class="modal-body">
            <div class="tuning-layout">
                <aside class="controls-panel">
                    <TuningControls bind:config />
                </aside>

                <section class="results-panel">
                    {#if result}
                        <MetricsDisplay {result} />
                    {:else}
                        <div class="no-results">
                            <p>Computing simulation...</p>
                        </div>
                    {/if}
                </section>
            </div>
        </div>

        <div class="modal-footer">
            <span class="sim-time">{#if result}Computed in {simulationTime.toFixed(1)}ms{/if}</span>
            <button class="action-btn rerun" onclick={runSimulation}>Rerun Simulation</button>
        </div>
        
        <div class="modal-corner">└─────────────────────────────┘</div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: #0d0d0d;
        border: 2px solid #00ff00;
        border-radius: 8px;
        max-width: 95vw;
        max-height: 95vh;
        width: 1600px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 40px rgba(0, 255, 0, 0.3);
    }

    .tuning-modal {
        width: 95vw;
        height: 90vh;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background: rgba(0, 40, 0, 0.5);
        border-bottom: 1px solid #004400;
    }

    .header-title {
        color: #00ff00;
        font-size: 0.9rem;
        font-weight: bold;
    }

    .close-btn {
        background: transparent;
        border: 1px solid #ff4400;
        color: #ff8800;
        padding: 4px 10px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-size: 0.8rem;
        border-radius: 4px;
    }

    .close-btn:hover {
        background: #331100;
    }

    .modal-body {
        flex: 1;
        overflow: hidden;
        padding: 15px;
    }

    .tuning-layout {
        display: grid;
        grid-template-columns: 380px 1fr;
        gap: 20px;
        height: 100%;
    }

    .controls-panel {
        max-height: 100%;
        overflow-y: auto;
    }

    .results-panel {
        max-height: 100%;
        overflow-y: auto;
    }

    .no-results {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #669966;
    }

    .modal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background: rgba(0, 40, 0, 0.3);
        border-top: 1px solid #004400;
    }

    .sim-time {
        color: #669966;
        font-size: 0.8rem;
    }

    .action-btn.rerun {
        background: #004400;
        border: 1px solid #00ff00;
        color: #00ff00;
        padding: 6px 15px;
        cursor: pointer;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
    }

    .action-btn.rerun:hover {
        background: #006600;
    }

    .modal-corner {
        color: #00ff00;
        font-size: 0.8rem;
        padding: 5px 15px;
        text-align: right;
    }

    @media (max-width: 1200px) {
        .tuning-layout {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
        }
    }
</style>

<script lang="ts">
    import type { TuningConfig } from '$lib/game/tuning-sim';
    import { tuningPresets } from '$lib/game/tuning-sim';

    interface Props {
        config: TuningConfig;
    }

    let { config = $bindable() }: Props = $props();
    
    let selectedPreset = $state('baseline');

    function applyPreset(presetName: string) {
        const preset = tuningPresets[presetName];
        if (preset) {
            Object.assign(config, preset);
            selectedPreset = presetName;
        }
    }

    function resetToDefaults() {
        Object.assign(config, tuningPresets.baseline);
        selectedPreset = 'custom';
    }
</script>

<div class="tuning-controls">
    <div class="controls-header">
        <h3>Configuration Presets</h3>
        <div class="preset-buttons">
            {#each Object.keys(tuningPresets) as preset}
                <button 
                    class="preset-btn" 
                    class:active={selectedPreset === preset}
                    onclick={() => applyPreset(preset)}
                >
                    {preset}
                </button>
            {/each}
            <button class="preset-btn reset" onclick={resetToDefaults}>Reset</button>
        </div>
    </div>

    <div class="controls-section">
        <h4>Core Gameplay</h4>
        
        <div class="control-row">
            <label>
                Click Rate (clicks/sec)
                <input type="number" step="0.5" min="0" max="20" bind:value={config.clickRate} />
            </label>
            <span class="hint">How fast the player clicks</span>
        </div>

        <div class="control-row">
            <label>
                Upgrade Cost Multiplier
                <input type="number" step="0.01" min="1" max="2" bind:value={config.upgradeCostMultiplier} />
            </label>
            <span class="hint">How fast upgrade costs scale (1.15 = +15%/level)</span>
        </div>

        <div class="control-row">
            <label>
                Prestige Threshold (%)
                <input type="number" step="0.05" min="0.1" max="1" bind:value={config.prestigeThresholdPercent} />
            </label>
            <span class="hint">% of upgrades needed to prestige</span>
        </div>
    </div>

    <div class="controls-section">
        <h4>Tech Debt System</h4>
        
        <div class="control-row">
            <label>
                Base Debt per LoC
                <input type="number" step="0.1" min="0" max="10" bind:value={config.baseDebtPerClick} />
            </label>
            <span class="hint">Debt accumulated per generated LoC</span>
        </div>

        <div class="control-row">
            <label>
                Delegation Debt Rate
                <input type="number" step="0.01" min="0" max="1" bind:value={config.delegationDebtRate} />
            </label>
            <span class="hint">Passive debt rate multiplier (default: 0.1)</span>
        </div>

        <div class="control-row">
            <label>
                Max Debt Cap
                <input type="number" step="100" min="100" max="10000" bind:value={config.maxDebt} />
            </label>
            <span class="hint">Maximum internal debt units (default: 5000)</span>
        </div>
    </div>

    <div class="controls-section">
        <h4>Prestige System</h4>

        <div class="control-row">
            <label>
                Simulated Path
                <select bind:value={config.prestigePath}>
                    <option value="buyout">Buyout</option>
                    <option value="nirvana">Nirvana</option>
                    <option value="linus">Linus</option>
                    <option value="learning">Learning</option>
                </select>
            </label>
            <span class="hint">Path chosen at each simulated prestige</span>
        </div>
        
        <div class="control-row">
            <label>
                Starting Cash per Point
                <input type="number" step="500" min="0" bind:value={config.startingCashPerPoint} />
            </label>
            <span class="hint">Cash awarded per prestige point (default: 5000)</span>
        </div>

        <div class="control-row">
            <label>
                Cash Multiplier per Point
                <input type="number" step="0.05" min="0" max="2" bind:value={config.cashMultiplierPerPoint} />
            </label>
            <span class="hint">Cash generation bonus per point (default: 0.20)</span>
        </div>

        <div class="control-row">
            <label>
                LoC Multiplier per Point
                <input type="number" step="0.05" min="0" max="2" bind:value={config.locMultiplierPerPoint} />
            </label>
            <span class="hint">LoC generation bonus per point (default: 0.15)</span>
        </div>

        <div class="control-row">
            <label>
                Cred Multiplier per Point
                <input type="number" step="0.05" min="0" max="2" bind:value={config.credMultiplierPerPoint} />
            </label>
            <span class="hint">Cred gain bonus per point (default: 0.25)</span>
        </div>
    </div>

    <div class="controls-section">
        <h4>Tech Tree Modifiers</h4>
        
        <div class="control-row">
            <label>
                Money Multiplier
                <input type="number" step="0.1" min="0" max="5" bind:value={config.techTreeMoneyMultiplier} />
            </label>
            <span class="hint">Additive cash multiplier from tech tree</span>
        </div>

        <div class="control-row">
            <label>
                LoC Multiplier
                <input type="number" step="0.1" min="0" max="5" bind:value={config.techTreeLocMultiplier} />
            </label>
            <span class="hint">Additive LoC multiplier from tech tree</span>
        </div>

        <div class="control-row">
            <label>
                Cred Multiplier
                <input type="number" step="0.1" min="0" max="5" bind:value={config.techTreeCredMultiplier} />
            </label>
            <span class="hint">Additive cred multiplier from tech tree</span>
        </div>

        <div class="control-row">
            <label>
                LoC/Click Bonus (%)
                <input type="number" step="0.1" min="0" max="5" bind:value={config.techTreeLocPerClickBonus} />
            </label>
            <span class="hint">Bonus LoC per click from tech tree</span>
        </div>

        <div class="control-row">
            <label>
                Passive LoC Bonus (%)
                <input type="number" step="0.1" min="0" max="5" bind:value={config.techTreePassiveLocBonus} />
            </label>
            <span class="hint">Bonus passive LoC from tech tree</span>
        </div>

        <div class="control-row">
            <label>
                Debt Accumulation Reduction
                <input type="number" step="0.05" min="0" max="0.95" bind:value={config.techTreeDebtAccumReduction} />
            </label>
            <span class="hint">Debt accumulation reduction from tech tree</span>
        </div>

        <div class="control-row">
            <label>
                Debt Penalty Reduction
                <input type="number" step="0.05" min="0" max="1" bind:value={config.techTreeDebtPenaltyReduction} />
            </label>
            <span class="hint">Debt penalty mitigation from tech tree</span>
        </div>
    </div>

    <div class="controls-section">
        <h4>Auto-Purchase</h4>
        
        <div class="control-row">
            <label>
                Auto-Purchase Threshold (%)
                <input type="number" step="0.05" min="0" max="1" bind:value={config.autoPurchaseThreshold} />
            </label>
            <span class="hint">% of cost needed to auto-buy (1.0 = 100%)</span>
        </div>
    </div>
</div>

<style>
    .tuning-controls {
        background: rgba(0, 20, 0, 0.5);
        border: 1px solid #00ff00;
        padding: 20px;
        border-radius: 8px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .controls-header {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #004400;
    }

    .controls-header h3 {
        margin: 0 0 10px 0;
        color: #00ff00;
    }

    .preset-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .preset-btn {
        padding: 6px 12px;
        background: #001100;
        border: 1px solid #004400;
        color: #00cc00;
        cursor: pointer;
        border-radius: 4px;
        font-size: 0.85rem;
        transition: all 0.2s;
    }

    .preset-btn:hover {
        background: #002200;
        border-color: #00ff00;
    }

    .preset-btn.active {
        background: #004400;
        border-color: #00ff00;
        color: #ffffff;
    }

    .preset-btn.reset {
        border-color: #ff4400;
        color: #ff8800;
    }

    .controls-section {
        margin-bottom: 25px;
    }

    .controls-section h4 {
        margin: 0 0 15px 0;
        color: #00cc00;
        font-size: 1rem;
        border-bottom: 1px solid #004400;
        padding-bottom: 8px;
    }

    .control-row {
        margin-bottom: 12px;
    }

    .control-row label {
        display: flex;
        flex-direction: column;
        gap: 5px;
        color: #aaffaa;
        font-size: 0.9rem;
    }

    .control-row input {
        padding: 8px 12px;
        background: #001100;
        border: 1px solid #004400;
        color: #00ff00;
        border-radius: 4px;
        font-size: 1rem;
        width: 100%;
        max-width: 200px;
    }

    .control-row input:focus {
        outline: none;
        border-color: #00ff00;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
    }

    .hint {
        font-size: 0.75rem;
        color: #669966;
        font-style: italic;
    }
</style>

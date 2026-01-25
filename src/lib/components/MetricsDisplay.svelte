<script lang="ts">
    import type { SimulationResult } from '$lib/game/tuning-sim';

    interface Props {
        result: SimulationResult;
    }

    let { result }: Props = $props();

    function formatTime(seconds: number | null): string {
        if (seconds === null) return 'N/A';
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
        return `${(seconds / 3600).toFixed(1)}h`;
    }

    function formatPercent(value: number): string {
        return `${(value * 100).toFixed(1)}%`;
    }

    function formatNumber(value: number): string {
        if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toFixed(1);
    }
</script>

<div class="metrics-display">
    <h3>Simulation Results</h3>
    
    <div class="metrics-section">
        <h4>Primary Metrics</h4>
        <div class="metrics-grid">
            <div class="metric-card primary">
                <span class="metric-label">Time to First Prestige</span>
                <span class="metric-value">{formatTime(result.timeToFirstPrestige)}</span>
                <span class="metric-hint">Until 70% upgrades owned</span>
            </div>
            
            <div class="metric-card primary">
                <span class="metric-label">Time to Second Prestige</span>
                <span class="metric-value">{formatTime(result.timeToSecondPrestige)}</span>
                <span class="metric-hint">From first to second prestige</span>
            </div>
            
            <div class="metric-card highlight">
                <span class="metric-label">Tech Debt at 4 min</span>
                <span class="metric-value">{formatPercent(result.techDebtAt4Minutes)}</span>
                <span class="metric-hint">Expected debt after 4 minutes</span>
            </div>
            
            <div class="metric-card">
                <span class="metric-label">Time to Next Upgrade</span>
                <span class="metric-value">{formatTime(result.timeToNextUpgrade)}</span>
                <span class="metric-hint">Until cheapest upgrade affordable</span>
            </div>
        </div>
    </div>

    <div class="metrics-section">
        <h4>Upgrade Progress</h4>
        <div class="metrics-grid">
            <div class="metric-card">
                <span class="metric-label">Upgrades at 1st Prestige</span>
                <span class="metric-value">{result.totalUpgradesAtFirstPrestige} / 20</span>
                <span class="metric-hint">Total upgrades owned</span>
            </div>
            
            <div class="metric-card">
                <span class="metric-label">Upgrades at 2nd Prestige</span>
                <span class="metric-value">{result.totalUpgradesAtSecondPrestige} / 20</span>
                <span class="metric-hint">Total upgrades owned</span>
            </div>
        </div>
    </div>

    <div class="metrics-section">
        <h4>Final Generation Rates</h4>
        <div class="metrics-grid">
            <div class="metric-card">
                <span class="metric-label">Click Power</span>
                <span class="metric-value">{formatNumber(result.finalClickPower)}</span>
                <span class="metric-hint">LoC per click</span>
            </div>
            
            <div class="metric-card">
                <span class="metric-label">Passive LoC/sec</span>
                <span class="metric-value">{formatNumber(result.finalPassiveLocRate)}</span>
                <span class="metric-hint">Auto-generation rate</span>
            </div>
            
            <div class="metric-card">
                <span class="metric-label">Passive Income/sec</span>
                <span class="metric-value">${formatNumber(result.finalPassiveIncome)}</span>
                <span class="metric-hint">Cash from SaaS projects</span>
            </div>
            
            <div class="metric-card">
                <span class="metric-label">Debt Penalty Factor</span>
                <span class="metric-value">{result.finalDebtPenaltyFactor.toFixed(3)}</span>
                <span class="metric-hint">(1 - debt)² multiplier</span>
            </div>
        </div>
    </div>

    {#if result.timeToUpgradeLevels.length > 0}
        <div class="metrics-section">
            <h4>Upgrade Timeline</h4>
            <div class="timeline">
                {#each result.timeToUpgradeLevels.slice(0, 10) as entry}
                    <div class="timeline-item">
                        <span class="timeline-level">Level {entry.level}</span>
                        <span class="timeline-time">{formatTime(entry.time)}</span>
                        <div class="timeline-bar">
                            <div 
                                class="timeline-fill" 
                                style="width: {Math.min(100, (entry.time / (result.timeToFirstPrestige || 600)) * 100)}%"
                            ></div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    {#if result.upgradeProgressOverTime.length > 0}
        <div class="metrics-section">
            <h4>Upgrade Progress Over Time</h4>
            <div class="chart-container">
                <div class="chart">
                    {#each result.upgradeProgressOverTime as point}
                        <div 
                            class="chart-point"
                            style="left: {(point.time / 600) * 100}%; bottom: {point.percentage}%"
                            title="{point.time.toFixed(0)}s: {point.owned} upgrades ({point.percentage.toFixed(1)}%)"
                        ></div>
                    {/each}
                    <div class="chart-threshold"></div>
                </div>
                <div class="chart-labels">
                    <span>0s</span>
                    <span>600s</span>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .metrics-display {
        background: rgba(0, 20, 0, 0.5);
        border: 1px solid #00ff00;
        padding: 20px;
        border-radius: 8px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .metrics-display h3 {
        margin: 0 0 20px 0;
        color: #00ff00;
        text-align: center;
    }

    .metrics-section {
        margin-bottom: 25px;
    }

    .metrics-section h4 {
        margin: 0 0 15px 0;
        color: #00cc00;
        font-size: 1rem;
        border-bottom: 1px solid #004400;
        padding-bottom: 8px;
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
    }

    .metric-card {
        background: rgba(0, 40, 0, 0.5);
        border: 1px solid #004400;
        padding: 15px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .metric-card.primary {
        border-color: #00aa00;
    }

    .metric-card.highlight {
        border-color: #00ffff;
        background: rgba(0, 40, 40, 0.5);
    }

    .metric-label {
        color: #88cc88;
        font-size: 0.85rem;
    }

    .metric-value {
        color: #00ff00;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .metric-hint {
        color: #669966;
        font-size: 0.75rem;
        font-style: italic;
    }

    .timeline {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .timeline-item {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .timeline-level {
        width: 80px;
        color: #aaffaa;
        font-size: 0.85rem;
    }

    .timeline-time {
        width: 60px;
        color: #00ff00;
        font-size: 0.85rem;
    }

    .timeline-bar {
        flex: 1;
        height: 8px;
        background: #001100;
        border-radius: 4px;
        overflow: hidden;
    }

    .timeline-fill {
        height: 100%;
        background: linear-gradient(90deg, #00aa00, #00ff00);
        border-radius: 4px;
    }

    .chart-container {
        padding: 10px 0;
    }

    .chart {
        position: relative;
        height: 100px;
        background: #001100;
        border: 1px solid #004400;
        border-radius: 4px;
    }

    .chart-threshold {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 70%;
        border-top: 1px dashed #ff8800;
    }

    .chart-point {
        position: absolute;
        width: 6px;
        height: 6px;
        background: #00ff00;
        border-radius: 50%;
        transform: translate(-50%, 50%);
    }

    .chart-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        color: #669966;
        font-size: 0.75rem;
    }
</style>

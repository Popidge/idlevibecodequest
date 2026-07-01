<script lang="ts">
    import { untrack } from 'svelte';
    import type { ReactionEvent } from '$lib/game/event-types';
    
    interface Props {
        config: ReactionEvent;
        onScoreUpdate: (score: number, maxScore: number) => void;
        onComplete: (score: number, maxScore: number) => void;
    }
    
    let { config, onScoreUpdate, onComplete }: Props = $props();
    const gameConfig = untrack(() => config.config);
    
    // Game state
    let score = $state(0);
    let targets = $state<Array<{
        id: string;
        type: string;
        emoji: string;
        score: number;
        isGood: boolean;
        x: number;
        y: number;
        spawnedAt: number;
        clicked: boolean;
    }>>([]);
    let spawnInterval: ReturnType<typeof setInterval> | null = null;
    let cleanupInterval: ReturnType<typeof setInterval> | null = null;
    const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
    let isComplete = $state(false);
    
    // Calculate max possible score
    const maxPossibleTargets = Math.floor(gameConfig.duration * gameConfig.spawnRate);
    const maxGoodTargetScore = Math.max(...gameConfig.targetTypes.filter(t => t.isGood).map(t => t.score), 10);
    const maxPossibleScore = maxPossibleTargets * maxGoodTargetScore;
    
    // Start the game
    $effect(() => {
        if (isComplete) return;
        
        // Start spawning targets
        const spawnDelay = 1000 / gameConfig.spawnRate;
        let spawnCount = 0;
        const maxSpawns = maxPossibleTargets;
        
        spawnInterval = setInterval(() => {
            if (spawnCount >= maxSpawns || isComplete) {
                if (spawnInterval) clearInterval(spawnInterval);
                return;
            }
            spawnTarget();
            spawnCount++;
        }, spawnDelay);
        
        // Cleanup old targets periodically
        cleanupInterval = setInterval(() => {
            const now = Date.now();
            targets = targets.filter(t => {
                // Keep targets for 3 seconds or if already clicked
                return t.clicked || (now - t.spawnedAt) < 3000;
            });
        }, 500);
        
        // End game after duration
        const timeout = setTimeout(() => {
            endGame();
        }, gameConfig.duration * 1000);
        
        return () => {
            if (spawnInterval) clearInterval(spawnInterval);
            if (cleanupInterval) clearInterval(cleanupInterval);
            clearTimeout(timeout);
            for (const pending of pendingTimeouts) clearTimeout(pending);
        };
    });
    
    function spawnTarget() {
        const targetTypes = gameConfig.targetTypes;
        const totalWeight = targetTypes.reduce((sum, t) => sum + t.weight, 0);
        let rand = Math.random() * totalWeight;
        
        let selected = targetTypes[0];
        for (const type of targetTypes) {
            rand -= type.weight;
            if (rand <= 0) {
                selected = type;
                break;
            }
        }
        
        // Calculate spawn position (within configured area)
        const area = gameConfig.spawnArea;
        const margin = (100 - area.width) / 2;
        const x = margin + Math.random() * area.width;
        const y = 10 + Math.random() * (area.height - 10);
        
        const target = {
            id: `target-${Date.now()}-${Math.random()}`,
            type: selected.id,
            emoji: selected.emoji,
            score: selected.score,
            isGood: selected.isGood,
            x,
            y,
            spawnedAt: Date.now(),
            clicked: false
        };
        
        targets = [...targets, target];
    }
    
    function handleTargetClick(targetId: string) {
        const target = targets.find(t => t.id === targetId);
        if (!target || target.clicked) return;
        
        target.clicked = true;
        
        if (target.isGood) {
            score += target.score;
        } else {
            score = Math.max(0, score + target.score);
        }
        
        // Remove clicked target after animation
        const timeout = setTimeout(() => {
            pendingTimeouts.delete(timeout);
            targets = targets.filter(t => t.id !== targetId);
        }, 300);
        pendingTimeouts.add(timeout);
        
        onScoreUpdate(score, maxPossibleScore);
    }
    
    function endGame() {
        if (isComplete) return;
        isComplete = true;
        if (spawnInterval) clearInterval(spawnInterval);
        if (cleanupInterval) clearInterval(cleanupInterval);
        onComplete(score, maxPossibleScore);
    }
</script>

<div class="reaction-game">
    <div class="score-display">
        <span class="score-label">Score:</span>
        <span class="score-value">{score}</span>
    </div>
    
    <div class="target-area" style="--spawn-width: {gameConfig.spawnArea.width}%; --spawn-height: {gameConfig.spawnArea.height}%;">
        {#each targets as target (target.id)}
            <button
                class="target"
                class:clicked={target.clicked}
                class:good={target.isGood}
                class:bad={!target.isGood}
                style="left: {target.x}%; top: {target.y}%;"
                onclick={() => handleTargetClick(target.id)}
                aria-label="Target {target.type}"
            >
                {target.emoji}
            </button>
        {/each}
    </div>
    
    <div class="legend">
        {#each gameConfig.targetTypes as type}
            <div class="legend-item">
                <span class="legend-emoji">{type.emoji}</span>
                <span class="legend-text">
                    {type.isGood ? '+' : ''}{type.score} pts
                </span>
            </div>
        {/each}
    </div>
</div>

<style>
    .reaction-game {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }
    
    .score-display {
        text-align: center;
        font-size: 1.5rem;
        font-weight: 600;
    }
    
    .score-label {
        color: var(--text-muted, #888);
        margin-right: 0.5rem;
    }
    
    .score-value {
        color: var(--accent-color, #00ff88);
    }
    
    .target-area {
        position: relative;
        width: 100%;
        height: 200px;
        margin: 0 auto;
        background: var(--bg-secondary, rgba(255, 255, 255, 0.05));
        border: 2px solid var(--border-color, rgba(255, 255, 255, 0.1));
        border-radius: 12px;
        overflow: hidden;
    }
    
    .target {
        position: absolute;
        width: 48px;
        height: 48px;
        border: none;
        background: transparent;
        font-size: 2rem;
        cursor: pointer;
        transition: transform 0.15s ease, opacity 0.3s ease;
        animation: spawnIn 0.3s ease-out;
        user-select: none;
    }
    
    .target:hover {
        transform: scale(1.2);
    }
    
    .target.clicked {
        animation: clickPop 0.3s ease-out forwards;
    }
    
    .target.good {
        filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.5));
    }
    
    .target.bad {
        filter: drop-shadow(0 0 8px rgba(255, 68, 68, 0.5));
    }
    
    @keyframes spawnIn {
        from {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
        }
        to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
    }
    
    @keyframes clickPop {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.5);
        }
        100% {
            transform: scale(0);
            opacity: 0;
        }
    }
    
    .legend {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        flex-wrap: wrap;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--bg-tertiary, rgba(255, 255, 255, 0.05));
        border-radius: 8px;
    }
    
    .legend-emoji {
        font-size: 1.25rem;
    }
    
    .legend-text {
        font-size: 0.875rem;
        color: var(--text-muted, #888);
    }
</style>

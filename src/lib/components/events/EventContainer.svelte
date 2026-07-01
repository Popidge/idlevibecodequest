<script lang="ts">
    import { untrack } from 'svelte';
    import type { RandomEventConfig, ActiveEventState, EventMechanicType } from '$lib/game/event-types';
    import { store } from '$lib/game/store.svelte';
    import ReactionGame from './ReactionGame.svelte';
    import DecisionGame from './DecisionGame.svelte';
    import MemoryGame from './MemoryGame.svelte';
    import TypingGame from './TypingGame.svelte';
    import PatternGame from './PatternGame.svelte';
    import SpottingGame from './SpottingGame.svelte';
    
    interface Props {
        eventConfig: RandomEventConfig;
        onComplete: () => void;
        onAbandon: () => void;
    }
    
    let { eventConfig, onComplete, onAbandon }: Props = $props();
    const initialDuration = untrack(() => eventConfig.notificationDuration);
    
    // Game state
    let score = $state(0);
    let maxScore = $state(0);
    let timeRemaining = $state(initialDuration);
    let gameStatus = $state<'playing' | 'completed' | 'failed'>('playing');
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    
    // Start countdown timer
    $effect(() => {
        timerInterval = setInterval(() => {
            timeRemaining--;
            if (timeRemaining <= 0) {
                if (timerInterval) clearInterval(timerInterval);
                handleTimeout();
            }
        }, 1000);
        
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    });
    
    function handleTimeout() {
        // If still playing when time runs out, auto-complete with current score
        if (gameStatus === 'playing') {
            handleGameComplete(score, maxScore);
        }
    }
    
    function handleScoreUpdate(newScore: number, newMaxScore: number) {
        score = newScore;
        maxScore = newMaxScore;
    }
    
    function handleGameComplete(finalScore: number, finalMaxScore: number) {
        if (gameStatus !== 'playing') return;
        score = finalScore;
        maxScore = finalMaxScore;
        gameStatus = 'completed';
        
        // Calculate rewards and apply them
        store.completeRandomEvent(score, maxScore);
        
        if (timerInterval) clearInterval(timerInterval);
        onComplete();
    }
    
    function handleGameFail(reason: string) {
        if (gameStatus !== 'playing') return;
        gameStatus = 'failed';
        if (timerInterval) clearInterval(timerInterval);
        onAbandon();
    }
    
    function handleAbandon() {
        gameStatus = 'failed';
        if (timerInterval) clearInterval(timerInterval);
        onAbandon();
    }
    
    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
</script>

<div class="event-container">
    <div class="event-header">
        <div class="event-title">
            <h2>{eventConfig.name}</h2>
            <span class="mechanic-badge">{eventConfig.mechanic}</span>
        </div>
        <div class="timer" class:urgent={timeRemaining < 5}>
            {formatTime(timeRemaining)}
        </div>
    </div>
    
    <div class="event-description">
        {eventConfig.description}
    </div>
    
    <div class="game-area">
        {#if eventConfig.mechanic === 'reaction'}
            <ReactionGame
                config={eventConfig}
                onScoreUpdate={handleScoreUpdate}
                onComplete={handleGameComplete}
            />
        {:else if eventConfig.mechanic === 'decision'}
            <DecisionGame
                config={eventConfig}
                onScoreUpdate={handleScoreUpdate}
                onComplete={handleGameComplete}
                onFail={handleGameFail}
            />
        {:else if eventConfig.mechanic === 'memory'}
            <MemoryGame
                config={eventConfig}
                onScoreUpdate={handleScoreUpdate}
                onComplete={handleGameComplete}
                onFail={handleGameFail}
            />
        {:else if eventConfig.mechanic === 'typing'}
            <TypingGame
                config={eventConfig}
                onScoreUpdate={handleScoreUpdate}
                onComplete={handleGameComplete}
                onFail={handleGameFail}
            />
        {:else if eventConfig.mechanic === 'pattern'}
            <PatternGame
                config={eventConfig}
                onScoreUpdate={handleScoreUpdate}
                onComplete={handleGameComplete}
                onFail={handleGameFail}
            />
        {:else if eventConfig.mechanic === 'spotting'}
            <SpottingGame
                config={eventConfig}
                onScoreUpdate={handleScoreUpdate}
                onComplete={handleGameComplete}
                onFail={handleGameFail}
            />
        {:else}
            <div class="placeholder">
                <p>🎮 Unknown mechanic type</p>
                <button class="abandon-button" onclick={handleAbandon}>Close</button>
            </div>
        {/if}
    </div>
    
    <div class="event-footer">
        <div class="score-display">
            {#if maxScore > 0}
                <span class="score">{score} / {maxScore}</span>
                <span class="percentage">({Math.round((score / maxScore) * 100)}%)</span>
            {/if}
        </div>
        <button class="abandon-button" onclick={handleAbandon} disabled={gameStatus !== 'playing'}>
            Abandon
        </button>
    </div>
</div>

<style>
    .event-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.5rem;
        max-width: 600px;
        margin: 0 auto;
    }
    
    .event-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }
    
    .event-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .event-title h2 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--text-primary, #fff);
    }
    
    .mechanic-badge {
        padding: 0.25rem 0.5rem;
        background: var(--accent-color, #00ff88);
        color: var(--bg-primary, #000);
        font-size: 0.625rem;
        font-weight: 600;
        text-transform: uppercase;
        border-radius: 4px;
    }
    
    .timer {
        font-size: 1.5rem;
        font-weight: 600;
        font-family: 'Fira Code', monospace;
        color: var(--accent-color, #00ff88);
    }
    
    .timer.urgent {
        color: #ff4444;
        animation: pulse 1s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    .event-description {
        color: var(--text-muted, #888);
        font-size: 0.9rem;
        text-align: center;
    }
    
    .game-area {
        min-height: 300px;
        background: var(--bg-secondary, rgba(255, 255, 255, 0.02));
        border-radius: 12px;
        overflow: hidden;
    }
    
    .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        gap: 1rem;
        color: var(--text-muted, #888);
    }
    
    .event-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }
    
    .score-display {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .score {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--accent-color, #00ff88);
    }
    
    .percentage {
        color: var(--text-muted, #888);
        font-size: 0.875rem;
    }
    
    .abandon-button {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
        border-radius: 8px;
        background: transparent;
        color: var(--text-muted, #888);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .abandon-button:hover:not(:disabled) {
        border-color: #ff4444;
        color: #ff4444;
    }
    
    .abandon-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>

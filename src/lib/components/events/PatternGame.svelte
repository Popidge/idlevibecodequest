<script lang="ts">
    import { untrack } from 'svelte';
    import type { PatternEvent } from '$lib/game/event-types';
    
    interface Props {
        config: PatternEvent;
        onScoreUpdate: (score: number, maxScore: number) => void;
        onComplete: (score: number, maxScore: number) => void;
        onFail: (reason: string) => void;
    }
    
    let { config, onScoreUpdate, onComplete, onFail }: Props = $props();
    const gameConfig = untrack(() => config.config);
    
    // Game state
    let currentRound = $state(0);
    let score = $state(0);
    let timeRemaining = $state(gameConfig.timePerRound);
    let isShowingResult = $state(false);
    let lastResult = $state<'correct' | 'wrong' | null>(null);
    let isComplete = $state(false);
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    let nextRoundTimeout: ReturnType<typeof setTimeout> | null = null;
    
    // Shuffle patterns for variety
    let patterns = $state([...gameConfig.patterns].sort(() => Math.random() - 0.5).slice(0, gameConfig.rounds));
    
    const maxScore = gameConfig.rounds * 100;
    
    $effect(() => {
        startTimer();
        
        return () => {
            if (timerInterval) clearInterval(timerInterval);
            if (nextRoundTimeout) clearTimeout(nextRoundTimeout);
        };
    });
    
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timeRemaining = gameConfig.timePerRound;
        
        timerInterval = setInterval(() => {
            timeRemaining -= 0.1;
            if (timeRemaining <= 0) {
                if (timerInterval) clearInterval(timerInterval);
                handleTimeout();
            }
        }, 100);
    }
    
    function handleTimeout() {
        lastResult = 'wrong';
        isShowingResult = true;
        
        nextRoundTimeout = setTimeout(() => {
            nextRound();
        }, 1000);
    }
    
    function handleChoice(choiceIndex: number) {
        if (isShowingResult || isComplete) return;
        
        const currentPattern = patterns[currentRound];
        const isCorrect = choiceIndex === currentPattern.correctIndex;
        
        if (isCorrect) {
            score += 100;
            lastResult = 'correct';
        } else {
            lastResult = 'wrong';
        }
        
        isShowingResult = true;
        if (timerInterval) clearInterval(timerInterval);
        
        onScoreUpdate(score, maxScore);
        
        nextRoundTimeout = setTimeout(() => {
            nextRound();
        }, 800);
    }
    
    function nextRound() {
        isShowingResult = false;
        lastResult = null;
        currentRound++;
        
        if (currentRound >= patterns.length) {
            endGame();
        } else {
            startTimer();
        }
    }
    
    function endGame() {
        isComplete = true;
        onComplete(score, maxScore);
    }
    
    function getProgressPercent(): number {
        return (timeRemaining / gameConfig.timePerRound) * 100;
    }
    
    function formatSequence(seq: string[]): string {
        return seq.join(' ');
    }
</script>

<div class="pattern-game">
    <div class="progress-bar">
        <div class="progress-fill" style="width: {(currentRound / patterns.length) * 100}%"></div>
        <span class="progress-text">Round {currentRound + 1} / {patterns.length}</span>
    </div>
    
    {#if currentRound < patterns.length}
        <div class="timer-bar">
            <div class="timer-fill" class:urgent={timeRemaining < 2} style="width: {getProgressPercent()}%"></div>
        </div>
        
        <div class="pattern-display">
            <h3>What comes next?</h3>
            <div class="sequence">{formatSequence(patterns[currentRound].sequence)}</div>
        </div>
        
        {#if isShowingResult}
            <div class="result-feedback" class:correct={lastResult === 'correct'} class:wrong={lastResult === 'wrong'}>
                {lastResult === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
            </div>
        {:else}
            <div class="choices">
                {#each patterns[currentRound].options as option, i}
                    <button
                        class="choice-button"
                        onclick={() => handleChoice(i)}
                        disabled={isShowingResult}
                    >
                        {option}
                    </button>
                {/each}
            </div>
        {/if}
    {/if}
    
    <div class="score-display">
        Score: {score} / {maxScore}
    </div>
</div>

<style>
    .pattern-game {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        min-height: 300px;
    }
    
    .progress-bar {
        position: relative;
        height: 24px;
        background: var(--bg-tertiary);
        border-radius: 12px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-color), var(--accent-secondary));
        transition: width 0.3s ease;
    }
    
    .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-primary);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    .timer-bar {
        height: 4px;
        background: var(--bg-tertiary);
        border-radius: 2px;
        overflow: hidden;
    }
    
    .timer-fill {
        height: 100%;
        background: var(--accent-color);
        transition: width 0.1s linear;
    }
    
    .timer-fill.urgent {
        background: #ff4444;
        animation: pulse 0.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    .pattern-display {
        text-align: center;
        padding: 1.5rem;
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: 12px;
    }
    
    .pattern-display h3 {
        margin: 0 0 1rem 0;
        color: var(--text-muted);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
    
    .sequence {
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--accent-color);
        letter-spacing: 0.1em;
    }
    
    .result-feedback {
        text-align: center;
        padding: 2rem;
        font-size: 2rem;
        font-weight: bold;
        animation: feedbackPop 0.5s ease-out;
    }
    
    .result-feedback.correct {
        color: #00ff88;
    }
    
    .result-feedback.wrong {
        color: #ff4444;
    }
    
    @keyframes feedbackPop {
        0% { transform: scale(0.5); opacity: 0; }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
    }
    
    .choices {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
    }
    
    .choice-button {
        padding: 1rem 1.5rem;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 1.1rem;
        font-family: 'Fira Code', 'Consolas', monospace;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .choice-button:hover:not(:disabled) {
        background: var(--bg-tertiary);
        border-color: var(--accent-color);
        transform: translateY(-2px);
    }
    
    .choice-button:active:not(:disabled) {
        transform: scale(0.98);
    }
    
    .choice-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .score-display {
        text-align: center;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--accent-color);
        margin-top: auto;
    }
</style>

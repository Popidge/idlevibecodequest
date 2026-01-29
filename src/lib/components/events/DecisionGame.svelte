<script lang="ts">
    import type { DecisionEvent } from '$lib/game/event-types';
    
    interface Props {
        config: DecisionEvent;
        onScoreUpdate: (score: number, maxScore: number) => void;
        onComplete: (score: number, maxScore: number) => void;
        onFail: (reason: string) => void;
    }
    
    let { config, onScoreUpdate, onComplete, onFail }: Props = $props();
    
    // Game state
    let currentRound = $state(0);
    let score = $state(0);
    let timeRemaining = $state(config.config.timePerDecision || 5);
    let isShowingResult = $state(false);
    let lastResult = $state<'correct' | 'wrong' | null>(null);
    let isComplete = $state(false);
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    
    const rounds = config.config.choices || [];
    const maxScore = rounds.length * 100; // 100 points per correct answer
    
    // Start timer for current round
    $effect(() => {
        if (isComplete || isShowingResult || rounds.length === 0) return;
        
        timeRemaining = config.config.timePerDecision || 5;
        
        timerInterval = setInterval(() => {
            timeRemaining -= 0.1;
            if (timeRemaining <= 0) {
                if (timerInterval) clearInterval(timerInterval);
                handleTimeout();
            }
        }, 100);
        
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    });
    
    function handleTimeout() {
        // Time's up - wrong answer
        lastResult = 'wrong';
        isShowingResult = true;
        
        setTimeout(() => {
            nextRound();
        }, 1000);
    }
    
    function handleChoice(choiceIndex: number) {
        if (isShowingResult || isComplete) return;
        
        const currentChoice = rounds[currentRound];
        const selected = currentChoice.choices[choiceIndex];
        
        if (selected.isCorrect) {
            score += 100;
            lastResult = 'correct';
        } else {
            lastResult = 'wrong';
        }
        
        isShowingResult = true;
        if (timerInterval) clearInterval(timerInterval);
        
        onScoreUpdate(score, maxScore);
        
        setTimeout(() => {
            nextRound();
        }, 800);
    }
    
    function nextRound() {
        isShowingResult = false;
        lastResult = null;
        currentRound++;
        
        if (currentRound >= rounds.length) {
            endGame();
        }
    }
    
    function endGame() {
        isComplete = true;
        onComplete(score, maxScore);
    }
    
    function getProgressPercent(): number {
        if (!config.config.timePerDecision) return 100;
        return (timeRemaining / config.config.timePerDecision) * 100;
    }
</script>

<div class="decision-game">
    <div class="progress-bar">
        <div class="progress-fill" style="width: {((currentRound) / rounds.length) * 100}%"></div>
        <span class="progress-text">Round {currentRound + 1} / {rounds.length}</span>
    </div>
    
    {#if currentRound < rounds.length}
        <div class="timer-bar">
            <div class="timer-fill" class:urgent={timeRemaining < 1.5} style="width: {getProgressPercent()}%"></div>
        </div>
        
        <div class="prompt">
            <h3>{rounds[currentRound].prompt}</h3>
        </div>
        
        {#if isShowingResult}
            <div class="result-feedback" class:correct={lastResult === 'correct'} class:wrong={lastResult === 'wrong'}>
                {lastResult === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
            </div>
        {:else}
            <div class="choices">
                {#each rounds[currentRound].choices as choice, i}
                    <button
                        class="choice-button"
                        onclick={() => handleChoice(i)}
                        disabled={isShowingResult}
                    >
                        <span class="choice-label">{choice.text}</span>
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
    .decision-game {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }
    
    .progress-bar {
        position: relative;
        height: 24px;
        background: var(--bg-tertiary, rgba(255, 255, 255, 0.1));
        border-radius: 12px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-color, #00ff88), var(--accent-secondary, #00ccff));
        transition: width 0.3s ease;
    }
    
    .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-primary, #fff);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    .timer-bar {
        height: 4px;
        background: var(--bg-tertiary, rgba(255, 255, 255, 0.1));
        border-radius: 2px;
        overflow: hidden;
    }
    
    .timer-fill {
        height: 100%;
        background: var(--accent-color, #00ff88);
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
    
    .prompt {
        text-align: center;
        padding: 1rem;
    }
    
    .prompt h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--text-primary, #fff);
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
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .choice-button {
        padding: 1rem 1.5rem;
        border: 2px solid var(--border-color, rgba(255, 255, 255, 0.2));
        border-radius: 12px;
        background: var(--bg-secondary, rgba(255, 255, 255, 0.05));
        color: var(--text-primary, #fff);
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
    }
    
    .choice-button:hover:not(:disabled) {
        background: var(--bg-tertiary, rgba(255, 255, 255, 0.1));
        border-color: var(--accent-color, #00ff88);
        transform: translateX(4px);
    }
    
    .choice-button:active:not(:disabled) {
        transform: scale(0.98);
    }
    
    .choice-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .choice-label {
        font-family: 'Fira Code', 'Consolas', monospace;
    }
    
    .score-display {
        text-align: center;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--accent-color, #00ff88);
    }
</style>

<script lang="ts">
    import type { TypingEvent } from '$lib/game/event-types';
    
    interface Props {
        config: TypingEvent;
        onScoreUpdate: (score: number, maxScore: number) => void;
        onComplete: (score: number, maxScore: number) => void;
        onFail: (reason: string) => void;
    }
    
    let { config, onScoreUpdate, onComplete, onFail }: Props = $props();
    
    // Game state
    let currentPhrase = $state(config.config.phrases[Math.floor(Math.random() * config.config.phrases.length)]);
    let userInput = $state('');
    let timeRemaining = $state(config.config.timeLimit);
    let isComplete = $state(false);
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    let accuracy = $state(100);
    let startTime = $state(0);
    let wpm = $state(0);
    
    // Max score based on phrase length
    const maxScore = currentPhrase.text.length * 10;
    
    $effect(() => {
        startTime = Date.now();
        
        timerInterval = setInterval(() => {
            timeRemaining -= 0.1;
            
            // Calculate WPM
            const elapsed = (Date.now() - startTime) / 1000 / 60;
            if (elapsed > 0) {
                const wordsTyped = userInput.length / 5;
                wpm = Math.floor(wordsTyped / elapsed);
            }
            
            if (timeRemaining <= 0) {
                if (timerInterval) clearInterval(timerInterval);
                endGame();
            }
        }, 100);
        
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    });
    
    function handleInput(event: Event) {
        const input = (event.target as HTMLInputElement).value;
        userInput = input;
        
        // Calculate accuracy
        let correct = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] === currentPhrase.text[i]) {
                correct++;
            }
        }
        accuracy = input.length > 0 ? (correct / input.length) * 100 : 100;
        
        // Calculate score based on correct characters
        const score = correct * 10;
        onScoreUpdate(score, maxScore);
        
        // Check if complete
        if (input === currentPhrase.text) {
            endGame();
        }
    }
    
    function endGame() {
        if (isComplete) return;
        isComplete = true;
        if (timerInterval) clearInterval(timerInterval);
        
        // Final score calculation
        let correct = 0;
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] === currentPhrase.text[i]) {
                correct++;
            }
        }
        
        // Bonus for completing full phrase
        let finalScore = correct * 10;
        if (userInput === currentPhrase.text) {
            finalScore += 50;
        }
        
        onScoreUpdate(finalScore, maxScore);
        onComplete(finalScore, maxScore);
    }
    
    function getCharacterClass(index: number): string {
        if (index >= userInput.length) {
            return 'pending';
        }
        return userInput[index] === currentPhrase.text[index] ? 'correct' : 'incorrect';
    }
</script>

<div class="typing-game">
    <div class="stats-bar">
        <div class="stat">
            <span class="stat-label">Time</span>
            <span class="stat-value" class:urgent={timeRemaining < 3}>{timeRemaining.toFixed(1)}s</span>
        </div>
        <div class="stat">
            <span class="stat-label">WPM</span>
            <span class="stat-value">{wpm}</span>
        </div>
        <div class="stat">
            <span class="stat-label">Accuracy</span>
            <span class="stat-value" class:good={accuracy >= 90} class:bad={accuracy < 70}>
                {accuracy.toFixed(0)}%
            </span>
        </div>
    </div>
    
    <div class="phrase-container">
        <div class="phrase">
            {#each currentPhrase.text.split('') as char, i}
                <span class="char {getCharacterClass(i)}">{char}</span>
            {/each}
        </div>
        <div class="difficulty-badge">{currentPhrase.difficulty}</div>
    </div>
    
    <div class="input-area">
        <input
            type="text"
            class="typing-input"
            value={userInput}
            oninput={handleInput}
            disabled={isComplete}
            placeholder="Type the code above..."
            autocomplete="off"
            spellcheck="false"
        />
    </div>
    
    <div class="progress-bar">
        <div class="progress-fill" style="width: {(userInput.length / currentPhrase.text.length) * 100}%"></div>
    </div>
    
    {#if isComplete}
        <div class="result">
            {#if userInput === currentPhrase.text}
                <span class="success">✅ Perfect!</span>
            {:else}
                <span class="partial">⚠️ Partial ({accuracy.toFixed(0)}% accurate)</span>
            {/if}
        </div>
    {/if}
</div>

<style>
    .typing-game {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        min-height: 250px;
    }
    
    .stats-bar {
        display: flex;
        justify-content: space-around;
        gap: 1rem;
    }
    
    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
    }
    
    .stat-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .stat-value {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--accent-color);
        font-family: 'Fira Code', monospace;
    }
    
    .stat-value.urgent {
        color: #ff4444;
        animation: pulse 0.5s ease-in-out infinite;
    }
    
    .stat-value.good {
        color: #00ff88;
    }
    
    .stat-value.bad {
        color: #ff4444;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    .phrase-container {
        position: relative;
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: 12px;
        padding: 1.5rem;
    }
    
    .phrase {
        font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
        font-size: 1.1rem;
        line-height: 1.6;
        word-break: break-all;
    }
    
    .char {
        transition: color 0.1s ease;
    }
    
    .char.pending {
        color: var(--text-muted);
    }
    
    .char.correct {
        color: #00ff88;
    }
    
    .char.incorrect {
        color: #ff4444;
        text-decoration: underline;
    }
    
    .difficulty-badge {
        position: absolute;
        top: -10px;
        right: 10px;
        padding: 0.25rem 0.75rem;
        background: var(--accent-color);
        color: var(--bg-primary);
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        border-radius: 12px;
    }
    
    .input-area {
        position: relative;
    }
    
    .typing-input {
        width: 100%;
        padding: 1rem;
        background: var(--bg-tertiary);
        border: 2px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 1rem;
        transition: all 0.2s ease;
    }
    
    .typing-input:focus {
        outline: none;
        border-color: var(--accent-color);
        box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.2);
    }
    
    .typing-input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .progress-bar {
        height: 6px;
        background: var(--bg-tertiary);
        border-radius: 3px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-color), var(--accent-secondary));
        transition: width 0.1s linear;
    }
    
    .result {
        text-align: center;
        padding: 1rem;
        font-size: 1.25rem;
        font-weight: 600;
    }
    
    .success {
        color: #00ff88;
    }
    
    .partial {
        color: #ffaa00;
    }
</style>

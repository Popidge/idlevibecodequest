<script lang="ts">
    import type { MemoryEvent } from '$lib/game/event-types';
    
    interface Props {
        config: MemoryEvent;
        onScoreUpdate: (score: number, maxScore: number) => void;
        onComplete: (score: number, maxScore: number) => void;
        onFail: (reason: string) => void;
    }
    
    let { config, onScoreUpdate, onComplete, onFail }: Props = $props();
    
    // Game phases: 'showing' | 'input' | 'complete'
    let phase = $state<'showing' | 'input' | 'complete'>('showing');
    let playerSequence = $state<string[]>([]);
    let showTimer = $state(config.config.displayTime);
    let isComplete = $state(false);
    let showHighlight = $state<string | null>(null);
    
    // Generate sequence immediately (not in effect)
    const pool = config.config.itemPool;
    const sequence: string[] = [];
    for (let i = 0; i < config.config.sequenceLength; i++) {
        const randomItem = pool[Math.floor(Math.random() * pool.length)];
        sequence.push(randomItem.id);
    }
    
    // Calculate max score (100 points per correct item)
    const maxScore = config.config.sequenceLength * 100;
    
    // Timer refs
    let showInterval: ReturnType<typeof setInterval> | null = null;
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    
    // Start game on mount using $effect with no dependencies tracking
    $effect(() => {
        // Start the show phase
        startShowPhase();
        
        // Cleanup function
        return () => {
            if (showInterval) clearInterval(showInterval);
            if (timerInterval) clearInterval(timerInterval);
        };
    });
    
    function startShowPhase() {
        phase = 'showing';
        showTimer = config.config.displayTime;
        
        // Animate through sequence
        let itemIndex = 0;
        showInterval = setInterval(() => {
            if (itemIndex < sequence.length) {
                showHighlight = sequence[itemIndex];
                itemIndex++;
                
                // Clear highlight after 400ms
                setTimeout(() => {
                    showHighlight = null;
                }, 400);
            } else {
                if (showInterval) clearInterval(showInterval);
            }
        }, 600);
        
        // Countdown timer
        timerInterval = setInterval(() => {
            showTimer -= 0.1;
            if (showTimer <= 0) {
                if (timerInterval) clearInterval(timerInterval);
                startInputPhase();
            }
        }, 100);
    }
    
    function startInputPhase() {
        phase = 'input';
        playerSequence = [];
    }
    
    function handleItemClick(itemId: string) {
        if (phase !== 'input' || isComplete) return;
        
        // Show brief highlight
        showHighlight = itemId;
        setTimeout(() => {
            showHighlight = null;
        }, 200);
        
        const newPlayerSequence = [...playerSequence, itemId];
        playerSequence = newPlayerSequence;
        
        // Check if correct so far
        const currentPosition = newPlayerSequence.length - 1;
        if (newPlayerSequence[currentPosition] !== sequence[currentPosition]) {
            // Wrong! Game over with partial score
            endGame();
            return;
        }
        
        // Update score based on progress
        const score = newPlayerSequence.length * 100;
        onScoreUpdate(score, maxScore);
        
        // Check if complete
        if (newPlayerSequence.length === sequence.length) {
            endGame();
        }
    }
    
    function endGame() {
        if (isComplete) return;
        isComplete = true;
        phase = 'complete';
        
        if (showInterval) clearInterval(showInterval);
        if (timerInterval) clearInterval(timerInterval);
        
        const score = playerSequence.filter((id, i) => id === sequence[i]).length * 100;
        onScoreUpdate(score, maxScore);
        onComplete(score, maxScore);
    }
    
    function getItemById(id: string) {
        return config.config.itemPool.find(item => item.id === id);
    }
</script>

<div class="memory-game">
    {#if phase === 'showing'}
        <div class="phase-header">
            <h3>👀 Watch the sequence...</h3>
            <div class="timer-bar">
                <div class="timer-fill" style="width: {(showTimer / config.config.displayTime) * 100}%"></div>
            </div>
        </div>
        
        <div class="sequence-display">
            {#each sequence as itemId}
                {@const item = getItemById(itemId)}
                <div 
                    class="sequence-item"
                    class:active={showHighlight === itemId}
                    class:dimmed={showHighlight !== null && showHighlight !== itemId}
                >
                    <span class="emoji">{item?.emoji}</span>
                    <span class="label">{item?.label}</span>
                </div>
            {/each}
        </div>
        
        <p class="hint">Remember the order!</p>
    {:else if phase === 'input'}
        <div class="phase-header">
            <h3>🎯 Repeat the sequence!</h3>
            <div class="progress">
                {playerSequence.length} / {sequence.length}
            </div>
        </div>
        
        <div class="player-sequence">
            {#each sequence as _, i}
                <div class="sequence-slot" class:filled={i < playerSequence.length}>
                    {#if i < playerSequence.length}
                        {@const item = getItemById(playerSequence[i])}
                        <span class="emoji">{item?.emoji}</span>
                    {:else}
                        <span class="placeholder">?</span>
                    {/if}
                </div>
            {/each}
        </div>
        
        <div class="item-grid">
            {#each config.config.itemPool as item}
                <button
                    class="item-button"
                    class:highlight={showHighlight === item.id}
                    onclick={() => handleItemClick(item.id)}
                    disabled={isComplete}
                >
                    <span class="emoji">{item.emoji}</span>
                    <span class="label">{item.label}</span>
                </button>
            {/each}
        </div>
    {:else}
        <div class="complete-message">
            <h3>✅ Sequence Complete!</h3>
            <p>You remembered {playerSequence.filter((id, i) => id === sequence[i]).length} of {sequence.length}</p>
        </div>
    {/if}
</div>

<style>
    .memory-game {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        min-height: 300px;
    }
    
    .phase-header {
        text-align: center;
    }
    
    .phase-header h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
    }
    
    .timer-bar {
        height: 6px;
        background: var(--bg-tertiary);
        border-radius: 3px;
        overflow: hidden;
    }
    
    .timer-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-color), var(--accent-secondary));
        transition: width 0.1s linear;
    }
    
    .progress {
        font-size: 0.9rem;
        color: var(--text-muted);
    }
    
    .sequence-display {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        padding: 1rem;
    }
    
    .sequence-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        background: var(--bg-tertiary);
        border-radius: 12px;
        transition: all 0.3s ease;
        min-width: 60px;
    }
    
    .sequence-item.active {
        background: var(--accent-color);
        transform: scale(1.1);
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    }
    
    .sequence-item.dimmed {
        opacity: 0.3;
    }
    
    .sequence-item .emoji {
        font-size: 2rem;
        margin-bottom: 0.25rem;
    }
    
    .sequence-item .label {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: capitalize;
    }
    
    .sequence-item.active .label {
        color: var(--bg-primary);
    }
    
    .hint {
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
    }
    
    .player-sequence {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        padding: 1rem;
    }
    
    .sequence-slot {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-tertiary);
        border: 2px dashed var(--border-color);
        border-radius: 8px;
        transition: all 0.2s ease;
    }
    
    .sequence-slot.filled {
        background: var(--bg-secondary);
        border-style: solid;
        border-color: var(--accent-color);
    }
    
    .sequence-slot .emoji {
        font-size: 1.5rem;
    }
    
    .sequence-slot .placeholder {
        color: var(--text-muted);
        font-size: 1.25rem;
    }
    
    .item-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
        max-width: 400px;
        margin: 0 auto;
    }
    
    .item-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem 0.5rem;
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .item-button:hover:not(:disabled) {
        background: var(--bg-tertiary);
        border-color: var(--accent-color);
        transform: translateY(-2px);
    }
    
    .item-button:active:not(:disabled) {
        transform: scale(0.95);
    }
    
    .item-button.highlight {
        background: var(--accent-color);
        border-color: var(--accent-color);
    }
    
    .item-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .item-button .emoji {
        font-size: 1.75rem;
        margin-bottom: 0.25rem;
    }
    
    .item-button .label {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: capitalize;
    }
    
    .item-button.highlight .label {
        color: var(--bg-primary);
    }
    
    .complete-message {
        text-align: center;
        padding: 2rem;
    }
    
    .complete-message h3 {
        color: var(--accent-color);
        margin-bottom: 0.5rem;
    }
    
    .complete-message p {
        color: var(--text-muted);
    }
</style>

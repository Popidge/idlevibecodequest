<script lang="ts">
    import type { SpottingEvent } from '$lib/game/event-types';
    
    interface Props {
        config: SpottingEvent;
        onScoreUpdate: (score: number, maxScore: number) => void;
        onComplete: (score: number, maxScore: number) => void;
        onFail: (reason: string) => void;
    }
    
    let { config, onScoreUpdate, onComplete, onFail }: Props = $props();
    
    // Game state
    let foundLines = $state<Set<number>>(new Set());
    let clickedLines = $state<Set<number>>(new Set());
    let timeRemaining = $state(config.config.timeLimit);
    let isComplete = $state(false);
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    let showResult = $state(false);
    
    // Calculate max score (100 points per hallucination found)
    const hallucinationLines = config.config.hallucinations
        .filter(h => h.isHallucination)
        .map(h => h.line);
    const maxScore = hallucinationLines.length * 100;
    
    const contentLines = config.config.content.split('\n');
    
    $effect(() => {
        timerInterval = setInterval(() => {
            timeRemaining -= 0.1;
            if (timeRemaining <= 0) {
                if (timerInterval) clearInterval(timerInterval);
                endGame();
            }
        }, 100);
        
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    });
    
    function handleLineClick(lineNumber: number) {
        if (isComplete || clickedLines.has(lineNumber)) return;
        
        clickedLines = new Set([...clickedLines, lineNumber]);
        
        const lineInfo = config.config.hallucinations.find(h => h.line === lineNumber);
        
        if (lineInfo?.isHallucination) {
            // Found a bug!
            foundLines = new Set([...foundLines, lineNumber]);
            const score = foundLines.size * 100;
            onScoreUpdate(score, maxScore);
            
            // Check if all found
            if (foundLines.size === hallucinationLines.length) {
                endGame();
            }
        }
    }
    
    function endGame() {
        if (isComplete) return;
        isComplete = true;
        showResult = true;
        if (timerInterval) clearInterval(timerInterval);
        
        const score = foundLines.size * 100;
        onScoreUpdate(score, maxScore);
        onComplete(score, maxScore);
    }
    
    function getLineClass(lineNumber: number): string {
        if (foundLines.has(lineNumber)) {
            return 'found';
        }
        if (clickedLines.has(lineNumber)) {
            return 'clicked-wrong';
        }
        return '';
    }
    
    function isClickable(lineNumber: number): boolean {
        const lineInfo = config.config.hallucinations.find(h => h.line === lineNumber);
        return !!lineInfo && !clickedLines.has(lineNumber) && !isComplete;
    }
</script>

<div class="spotting-game">
    <div class="header">
        <div class="instructions">
            <span class="icon">🐛</span>
            <span>Click on the lines with bugs/hallucinations!</span>
        </div>
        <div class="timer" class:urgent={timeRemaining < 5}>
            {timeRemaining.toFixed(1)}s
        </div>
    </div>
    
    <div class="progress">
        Found: {foundLines.size} / {hallucinationLines.length}
    </div>
    
    <div class="code-container">
        {#each contentLines as line, index}
            {@const lineNumber = index + 1}
            {@const lineInfo = config.config.hallucinations.find(h => h.line === lineNumber)}
            <div 
                class="code-line {getLineClass(lineNumber)}"
                class:clickable={isClickable(lineNumber)}
                onclick={() => handleLineClick(lineNumber)}
            >
                <span class="line-number">{lineNumber}</span>
                <span class="line-content">{line}</span>
                {#if foundLines.has(lineNumber)}
                    <span class="bug-icon">🐛</span>
                {/if}
            </div>
        {/each}
    </div>
    
    {#if showResult}
        <div class="result">
            <h3>✅ Review Complete!</h3>
            <p>Found {foundLines.size} of {hallucinationLines.length} issues</p>
        </div>
    {/if}
</div>

<style>
    .spotting-game {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
        min-height: 300px;
    }
    
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .instructions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-muted);
        font-size: 0.9rem;
    }
    
    .instructions .icon {
        font-size: 1.25rem;
    }
    
    .timer {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--accent-color);
        font-family: 'Fira Code', monospace;
    }
    
    .timer.urgent {
        color: #ff4444;
        animation: pulse 0.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    .progress {
        font-size: 0.875rem;
        color: var(--text-muted);
        text-align: center;
    }
    
    .code-container {
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: 12px;
        overflow: hidden;
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 0.85rem;
        max-height: 250px;
        overflow-y: auto;
    }
    
    .code-line {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid var(--border-color);
        transition: all 0.2s ease;
    }
    
    .code-line:last-child {
        border-bottom: none;
    }
    
    .code-line.clickable {
        cursor: pointer;
        background: rgba(255, 68, 68, 0.05);
    }
    
    .code-line.clickable:hover {
        background: rgba(255, 68, 68, 0.15);
    }
    
    .code-line.found {
        background: rgba(0, 255, 136, 0.15);
    }
    
    .code-line.clicked-wrong {
        opacity: 0.5;
    }
    
    .line-number {
        color: var(--text-muted);
        min-width: 2rem;
        text-align: right;
        user-select: none;
    }
    
    .line-content {
        flex: 1;
        white-space: pre;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .bug-icon {
        font-size: 1rem;
        animation: bugPop 0.3s ease-out;
    }
    
    @keyframes bugPop {
        0% { transform: scale(0); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
    }
    
    .result {
        text-align: center;
        padding: 1rem;
        background: var(--bg-tertiary);
        border-radius: 8px;
    }
    
    .result h3 {
        color: var(--accent-color);
        margin: 0 0 0.5rem 0;
    }
    
    .result p {
        color: var(--text-muted);
        margin: 0;
    }
</style>

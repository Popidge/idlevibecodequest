<script lang="ts">
    import { store } from '$lib/game/store.svelte';

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            store.closeHowToPlay();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            store.closeHowToPlay();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if store.showHowToPlayModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="How to Play">
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">┌─ HOW TO PLAY ────────────┐</div>
            
            <div class="modal-body">
                <div class="intro">
                    <span class="icon">🎮</span>
                    <p>Welcome to <strong>Idle Vibe Code Quest</strong> - the incremental game where you vibe code your way to startup success!</p>
                </div>

                <div class="section">
                    <h3>💻 Core Loop</h3>
                    <ol>
                        <li><strong>Click to Code</strong> - Generate Lines of Code (LoC)</li>
                        <li><strong>Ship Projects</strong> - Spend LoC to build products</li>
                        <li><strong>Earn Money & Cred</strong> - Projects pay cash and street cred</li>
                        <li><strong>Upgrade Tools</strong> - Spend money on better vibe coding</li>
                        <li><strong>Prestige</strong> - Reset for permanent bonuses</li>
                    </ol>
                </div>

                <div class="section">
                    <h3>📊 Resources</h3>
                    <ul>
                        <li><span class="resource">LoC</span> - Lines of Code. The main resource. Generate by clicking or passively.</li>
                        <li><span class="resource">Money ($)</span> - Cash earned from shipping projects. Spend on upgrades.</li>
                        <li><span class="resource">Cred</span> - Street credibility. Unlocks better projects and upgrades.</li>
                    </ul>
                </div>

                <div class="section">
                    <h3>⚡ Upgrades</h3>
                    <ul>
                        <li><strong>Vibe Code</strong> - Increases LoC per click. Each level adds more power.</li>
                        <li><strong>Delegation</strong> - Generates passive LoC/sec automatically.</li>
                    </ul>
                    <p class="tip">💡 Pro tip: Balance both types for optimal growth!</p>
                </div>

                <div class="section">
                    <h3>📦 Projects</h3>
                    <ul>
                        <li><strong>Standard</strong> - One-time payouts (websites, apps)</li>
                        <li><strong>SaaS</strong> - Recurring passive income!</li>
                        <li><strong>Open Source</strong> - Low cash but high Cred rewards</li>
                    </ul>
                </div>

                <div class="section warning">
                    <h3>⚠️ Tech Debt</h3>
                    <p>As you code, tech debt accumulates. Higher debt reduces your income multiplier.</p>
                    <ul>
                        <li>Warning at <span class="highlight">20%</span> - Income starts dropping</li>
                        <li>Danger at <span class="highlight danger">80%</span> - Click CLEAR to reduce debt</li>
                    </ul>
                    <p class="tip">💡 Clear debt by spending LoC or Cash when it gets high!</p>
                </div>

                <div class="section">
                    <h3>⭐ Prestige System</h3>
                    <p>When you reach <strong>70% upgrades owned</strong>, you can Prestige:</p>
                    <ul>
                        <li>Reset all progress (except Tech Trees)</li>
                        <li>Earn <strong>Prestige Points</strong> based on upgrades</li>
                        <li>Spend points in <strong>Tech Trees</strong> for permanent bonuses</li>
                        <li>Choose from 4 paths: Buyout, Nirvana, Linus, Learning</li>
                    </ul>
                </div>

                <div class="section">
                    <h3>🎲 Random Events</h3>
                    <p>Random mini-games appear periodically:</p>
                    <ul>
                        <li><strong>Memory</strong> - Match the pattern</li>
                        <li><strong>Typing</strong> - Code as fast as you can</li>
                        <li><strong>Spotting</strong> - Find the bugs</li>
                        <li><strong>Pattern</strong> - Repeat the sequence</li>
                    </ul>
                    <p class="tip">💡 Complete events for cash, LoC, Cred, and temporary buffs!</p>
                </div>

                <div class="section">
                    <h3>🎯 Tips for Success</h3>
                    <ul>
                        <li>Start with Standard projects to build capital</li>
                        <li>Invest in SaaS early for passive income</li>
                        <li>Keep tech debt low - it hurts your profits!</li>
                        <li>Prestige when progress slows down</li>
                        <li>Focus on one Tech Tree path per run</li>
                    </ul>
                </div>
            </div>

            <div class="modal-footer">
                <button class="action-btn confirm" onclick={() => store.closeHowToPlay()}>
                    GOT IT - START CODING!
                </button>
            </div>
            <div class="modal-corner">└─────────────────────────┘</div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 200;
        padding: 20px;
    }

    .modal-content {
        background-color: var(--panel-bg, #0f0f0f);
        border: 2px solid var(--border-color, #00ff00);
        max-width: 600px;
        max-height: 90vh;
        width: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .modal-header {
        color: var(--text-amber, #ffb000);
        font-size: 14px;
        padding: 12px 16px;
        border-bottom: 2px solid var(--border-color, #00ff00);
        font-weight: bold;
        flex-shrink: 0;
    }

    .modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
    }

    .modal-footer {
        display: flex;
        justify-content: center;
        padding: 16px;
        border-top: 1px solid var(--border-color, #00ff00);
        flex-shrink: 0;
    }

    .modal-corner {
        color: var(--text-amber, #ffb000);
        font-size: 12px;
        padding: 4px 16px 12px;
        text-align: right;
        flex-shrink: 0;
    }

    .intro {
        text-align: center;
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px dashed var(--text-dim, #008800);
    }

    .intro .icon {
        font-size: 48px;
        display: block;
        margin-bottom: 12px;
    }

    .intro p {
        color: var(--text-secondary, #00cc00);
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
    }

    .intro strong {
        color: var(--text-primary, #00ff00);
    }

    .section {
        margin-bottom: 24px;
    }

    .section:last-child {
        margin-bottom: 0;
    }

    .section h3 {
        color: var(--text-amber, #ffb000);
        font-size: 14px;
        margin: 0 0 12px 0;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--text-dim, #008800);
    }

    .section ul,
    .section ol {
        margin: 0;
        padding-left: 20px;
        color: var(--text-secondary, #00cc00);
        font-size: 13px;
        line-height: 1.7;
    }

    .section li {
        margin-bottom: 6px;
    }

    .section p {
        color: var(--text-secondary, #00cc00);
        font-size: 13px;
        line-height: 1.6;
        margin: 0 0 10px 0;
    }

    .section strong {
        color: var(--text-primary, #00ff00);
    }

    .resource {
        color: var(--text-primary, #00ff00);
        font-weight: bold;
    }

    .highlight {
        color: var(--text-amber, #ffb000);
        font-weight: bold;
    }

    .highlight.danger {
        color: #ff4444;
    }

    .tip {
        background-color: rgba(0, 204, 255, 0.1);
        border-left: 3px solid var(--text-cyan, #00ccff);
        padding: 10px 14px;
        margin-top: 12px;
        font-size: 12px;
        color: var(--text-cyan, #00ccff);
    }

    .warning {
        background-color: rgba(255, 176, 0, 0.05);
        padding: 16px;
        border: 1px solid var(--text-amber, #ffb000);
        border-radius: 4px;
    }

    .warning h3 {
        border-bottom-color: var(--text-amber, #ffb000);
    }

    .action-btn {
        padding: 12px 32px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.15s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        background-color: var(--text-primary, #00ff00);
        color: var(--panel-bg, #0f0f0f);
        border: 2px solid var(--text-primary, #00ff00);
    }

    .action-btn:hover {
        background-color: var(--panel-bg, #0f0f0f);
        color: var(--text-primary, #00ff00);
    }

    /* Mobile styles */
    @media (max-width: 767px) {
        .modal-backdrop {
            padding: 10px;
        }

        .modal-content {
            max-height: 95vh;
        }

        .modal-body {
            padding: 16px;
        }

        .intro .icon {
            font-size: 36px;
        }

        .section h3 {
            font-size: 13px;
        }

        .section ul,
        .section ol,
        .section p {
            font-size: 12px;
        }

        .action-btn {
            padding: 14px 24px;
            font-size: 13px;
            min-height: 48px;
        }
    }
</style>
<script lang="ts">
    import { saveGame, resetGame } from '$lib/game/store';
</script>

<div class="panel title-panel">
    <div class="panel-header">┌─ VIBE CODE GURU v0.3 ─┐</div>
    <div class="panel-content title-content">
        <pre class="ascii-title">
╔══════════╗
║  ███╗    ║
║  ████╗   ║
║  ██╔██╗  ║
║  ██║╚██╗ ║
║  ██║ ╚██╗║
║  ╚═╝  ╚═╝║
╚══════════╝
        </pre>
    </div>
    <div class="panel-footer title-footer">
        <button class="window-btn" onclick={saveGame}>[ SAVE ]</button>
        <button class="window-btn" onclick={resetGame}>[ RESET ]</button>
    </div>
</div>

<style>
    .panel {
        background-color: var(--panel-bg, #0f0f0f);
        display: flex;
        flex-direction: column;
    }

    .title-panel {
        grid-column: 1;
        grid-row: 1;
    }

    .panel-header {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        white-space: pre;
        padding: 4px 0;
        flex-shrink: 0;
    }

    .panel-content {
        flex: 1;
        overflow: auto;
        padding: 10px;
        border-left: 1px solid var(--border-color, #00ff00);
        border-right: 1px solid var(--border-color, #00ff00);
    }

    .title-content {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 5px;
    }

    .ascii-title {
        color: var(--text-primary, #00ff00);
        font-size: 8px;
        line-height: 1.1;
        white-space: pre;
        overflow: hidden;
    }

    .panel-footer {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        white-space: pre;
        padding: 4px 0;
        flex-shrink: 0;
    }

    .title-footer {
        display: flex;
        gap: 5px;
        justify-content: center;
        padding: 8px !important;
        border: none !important;
    }

    .window-btn {
        background-color: var(--button-bg, #1a1a1a);
        color: var(--text-primary, #00ff00);
        border: 1px solid var(--border-color, #00ff00);
        padding: 4px 10px;
        font-family: 'Courier New', monospace;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .window-btn:hover {
        background-color: var(--button-hover, #2a2a2a);
        box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
    }
</style>

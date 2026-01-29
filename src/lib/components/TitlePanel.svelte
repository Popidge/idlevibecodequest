<script lang="ts">
    // TitlePanel - Just displays the ASCII title card
    // All notifications moved to NotificationBar component
</script>

<div class="panel title-panel">
    <div class="panel-header">idle-vibe-code v0.6</div>
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
        border-bottom: 1px solid var(--border-color, #00ff00);
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
</style>

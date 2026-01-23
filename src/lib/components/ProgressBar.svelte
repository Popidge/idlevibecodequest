<script lang="ts">
    let { current = 0, max = 100, label = '' } = $props();
    
    const progress = $derived(Math.min((current / max) * 100, 100));
    const isComplete = $derived(progress >= 100);
</script>

<div class="progress-bar-container" class:complete={isComplete}>
    <div class="progress-bar" style="width: {progress}%"></div>
    <span class="progress-text">{label}</span>
</div>

<style>
    .progress-bar-container {
        width: 130px;
        height: 16px;
        background-color: #0f0f0f;
        border: 1px solid #008800;
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
    }
    
    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #004400, #00aa00);
        transition: width 0.2s ease-out;
    }
    
    .progress-bar-container.complete {
        border-color: #00ff00;
    }
    
    .progress-bar-container.complete .progress-bar {
        background: linear-gradient(90deg, #006600, #00ff00);
    }
    
    .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 10px;
        font-family: 'Courier New', monospace;
        color: #00ff00;
        white-space: nowrap;
        text-shadow: 0 0 2px #0d0d0d;
        z-index: 1;
    }
</style>

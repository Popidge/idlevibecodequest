<script lang="ts">
    import { onMount } from 'svelte';
    import TitlePanel from './lib/components/TitlePanel.svelte';
    import StatsPanel from './lib/components/StatsPanel.svelte';
    import ProjectsPanel from './lib/components/ProjectsPanel.svelte';
    import UpgradesPanel from './lib/components/UpgradesPanel.svelte';
    import PromptPanel from './lib/components/PromptPanel.svelte';
    import Notification from './lib/components/Notification.svelte';
    import { store } from './lib/game/store.svelte';

    onMount(() => {
        store.init();
    });
</script>

<div class="terminal-dashboard">
    <TitlePanel />
    <StatsPanel />
    <ProjectsPanel />
    <UpgradesPanel />
    <PromptPanel />
    <Notification />
</div>

<style>
    .terminal-dashboard {
        display: grid;
        grid-template-columns: 200px 1fr 1fr;
        grid-template-rows: auto 1fr auto auto;
        gap: 10px;
        width: 100%;
        max-width: 1400px;
        height: calc(100vh - 40px);
        background-color: var(--terminal-bg, #0d0d0d);
        border: 2px solid var(--border-color, #00ff00);
        box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
        padding: 10px;
    }
</style>

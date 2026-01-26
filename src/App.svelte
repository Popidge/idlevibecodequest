<script lang="ts">
    import { onMount } from 'svelte';
    import TitlePanel from './lib/components/TitlePanel.svelte';
    import NotificationBar from './lib/components/NotificationBar.svelte';
    import StatsPanel from './lib/components/StatsPanel.svelte';
    import ProjectsPanel from './lib/components/ProjectsPanel.svelte';
    import UpgradesPanel from './lib/components/UpgradesPanel.svelte';
    import ActionRow from './lib/components/ActionRow.svelte';
    import Footer from './lib/components/Footer.svelte';
    // Phase 1: Modal imports
    import DebtReductionModal from './lib/components/DebtReductionModal.svelte';
    import OfflineGainsModal from './lib/components/OfflineGainsModal.svelte';
    // Phase 2: Hint system
    import HintsContainer from './lib/components/HintsContainer.svelte';
    // Phase 3: Prestige modals
    import PrestigeSummaryModal from './lib/components/PrestigeSummaryModal.svelte';
    import PrestigePathModal from './lib/components/PrestigePathModal.svelte';
    // Phase 4: Tech Tree modal
    import TechTreeModal from './lib/components/TechTreeModal.svelte';
    // v0.4: Tuning page
    import TuningModal from './lib/components/TuningModal.svelte';
    // v0.5: Random Event modal
    import RandomEventModal from './lib/components/RandomEventModal.svelte';
    import { store } from './lib/game/store.svelte';
    import { isDebugMode } from './lib/env';

    let showTuning = $state(false);

    onMount(() => {
        store.init();
    });

    function toggleTuning() {
        showTuning = !showTuning;
    }

    function grantDebugResources() {
        store.grantDebugResources();
    }
</script>

<div class="terminal-dashboard">
    <!-- Row 1: Title, Notifications, Debug -->
    <TitlePanel />
    <NotificationBar />

    <!-- Debug Toolbar (top-right of row 1) -->
    {#if isDebugMode()}
        <div class="debug-toolbar">
            <button class="debug-btn" onclick={grantDebugResources} title="Add debug resources">
                🐛 RESOURCES
            </button>
            <button class="debug-btn tuning-btn" onclick={toggleTuning} title="Open tuning page">
                ⚙️ TUNING
            </button>
        </div>
    {/if}

    <!-- Row 2: Main Content -->
    <StatsPanel />
    <ProjectsPanel />
    <UpgradesPanel />

    <!-- Row 3: Action Row (Prompt + Save/Reset) -->
    <ActionRow />

    <!-- Row 4: Footer -->
    <Footer />

    <!-- Modals -->
    <DebtReductionModal />
    <OfflineGainsModal />
    <HintsContainer />
    <PrestigeSummaryModal />
    <PrestigePathModal />
    <TechTreeModal />
    <!-- v0.5: Random Event Modal -->
    <RandomEventModal />

    <!-- v0.4: Tuning modal (debug only) -->
    {#if isDebugMode() && showTuning}
        <TuningModal onClose={toggleTuning} />
    {/if}
</div>

<!-- Float text animations (rendered outside grid for overlaying) -->
{#each store.floatTexts as floatText (floatText.id)}
    <div
        class="float-text"
        style="left: {floatText.x}px; top: {floatText.y}px;"
    >
        {floatText.text}
    </div>
{/each}

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
        position: relative;
    }

    .debug-toolbar {
        position: absolute;
        top: 5px;
        right: 5px;
        display: flex;
        gap: 6px;
        z-index: 100;
    }

    .debug-btn {
        background-color: var(--panel-bg, #0f0f0f);
        color: var(--text-primary, #00ff00);
        border: 1px solid var(--text-amber, #ffb000);
        padding: 10px 10px;
        font-family: 'Courier New', monospace;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 3px;
    }

    .debug-btn:hover {
        background-color: var(--text-amber, #ffb000);
        color: var(--panel-bg, #0f0f0f);
    }

    .tuning-btn {
        border-color: var(--text-cyan, #00ccff);
        color: var(--text-cyan, #00ccff);
    }

    .tuning-btn:hover {
        background-color: var(--text-cyan, #00ccff);
        color: var(--panel-bg, #0f0f0f);
    }

    .float-text {
        position: fixed;
        color: var(--text-primary, #00ff00);
        font-size: 14px;
        font-weight: bold;
        pointer-events: none;
        animation: floatUp 1s ease-out forwards;
        z-index: 1000;
    }

    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-30px);
        }
    }
</style>

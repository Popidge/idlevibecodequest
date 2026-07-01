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
    // How to Play modal
    import HowToPlayModal from './lib/components/HowToPlayModal.svelte';
    // v0.6.1: Debug Event Trigger
    import DebugEventModal from './lib/components/DebugEventModal.svelte';
    // Theme system
    import ThemeToggle from './lib/components/ThemeToggle.svelte';
    import { store } from './lib/game/store.svelte';
    import { isDebugMode } from './lib/env';
    // Mobile components
    import { mobileTab, type MobileTab } from './lib/stores/responsive';
    import MobileHeader from './lib/components/mobile/MobileHeader.svelte';
    import MobileStatsBar from './lib/components/mobile/MobileStatsBar.svelte';
    import MobileActionArea from './lib/components/mobile/MobileActionArea.svelte';
    import MobileTabBar from './lib/components/mobile/MobileTabBar.svelte';
    import MobileInfoTab from './lib/components/mobile/MobileInfoTab.svelte';

    let showTuning = $state(false);
    let showDebugEvents = $state(false);

    onMount(() => {
        store.init();
        const saveBeforeUnload = () => store.saveGame(false);
        const saveWhenHidden = () => {
            if (document.visibilityState === 'hidden') saveBeforeUnload();
        };
        window.addEventListener('beforeunload', saveBeforeUnload);
        window.addEventListener('pagehide', saveBeforeUnload);
        document.addEventListener('visibilitychange', saveWhenHidden);
        return () => {
            window.removeEventListener('beforeunload', saveBeforeUnload);
            window.removeEventListener('pagehide', saveBeforeUnload);
            document.removeEventListener('visibilitychange', saveWhenHidden);
            store.saveGame(false);
        };
    });

    function toggleTuning() {
        showTuning = !showTuning;
    }

    function toggleDebugEvents() {
        showDebugEvents = !showDebugEvents;
    }

    function grantDebugResources() {
        store.grantDebugResources();
    }

    function handleTabChange(tab: MobileTab) {
        mobileTab.set(tab);
    }
</script>

<div class="terminal-dashboard">
    <!-- Desktop Layout - Full 3-column grid -->
    <div class="desktop-layout">
        <!-- Theme Toggle (centered top) -->
        <ThemeToggle />
        
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
                <button class="debug-btn events-btn" onclick={toggleDebugEvents} title="Trigger random events">
                    🎲 EVENTS
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
    </div>

    <!-- Tablet Layout - Sidebar + stacked panels -->
    <div class="tablet-layout">
        <!-- Theme Toggle (centered top) -->
        <ThemeToggle />
        
        <!-- Row 1: Title, Notifications, Debug -->
        <TitlePanel />
        <NotificationBar />

        <!-- Debug Toolbar (top-right of row 1) -->
        {#if isDebugMode()}
            <div class="debug-toolbar tablet-debug">
                <button class="debug-btn" onclick={grantDebugResources} title="Add debug resources">
                    🐛 RESOURCES
                </button>
                <button class="debug-btn tuning-btn" onclick={toggleTuning} title="Open tuning page">
                    ⚙️ TUNING
                </button>
                <button class="debug-btn events-btn" onclick={toggleDebugEvents} title="Trigger random events">
                    🎲 EVENTS
                </button>
            </div>
        {/if}

        <!-- Row 2: Stats Sidebar -->
        <StatsPanel />
        
        <!-- Row 2: Stacked Projects & Upgrades -->
        <div class="tablet-main-content">
            <ProjectsPanel />
            <UpgradesPanel />
        </div>

        <!-- Row 3: Action Row -->
        <ActionRow />

        <!-- Row 4: Footer -->
        <Footer />
    </div>

    <!-- Mobile Layout - Hidden on desktop/tablet -->
    <div class="mobile-layout">
        <MobileHeader onToggleTuning={toggleTuning} />
        <MobileStatsBar />
        <MobileActionArea />
        
        <div class="mobile-content">
            {#if $mobileTab === 'projects'}
                <ProjectsPanel />
            {:else if $mobileTab === 'upgrades'}
                <UpgradesPanel />
            {:else if $mobileTab === 'stats'}
                <StatsPanel />
            {:else if $mobileTab === 'info'}
                <MobileInfoTab onToggleTuning={toggleTuning} />
            {/if}
        </div>
        
        <MobileTabBar activeTab={$mobileTab} onTabChange={handleTabChange} />
    </div>

    <!-- Modals -->
    <DebtReductionModal />
    <OfflineGainsModal />
    <HintsContainer />
    <PrestigeSummaryModal />
    <PrestigePathModal />
    <TechTreeModal />
    <!-- v0.5: Random Event Modal -->
    <RandomEventModal />
    <!-- How to Play Modal -->
    <HowToPlayModal />

    <!-- v0.4: Tuning modal (debug only) -->
    {#if isDebugMode() && showTuning}
        <TuningModal onClose={toggleTuning} />
    {/if}

    <!-- v0.6.1: Debug Event Trigger modal -->
    {#if isDebugMode() && showDebugEvents}
        <DebugEventModal onClose={toggleDebugEvents} />
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
        width: 100%;
        max-width: 1400px;
        height: calc(100vh - 40px);
        position: relative;
    }

    /* Desktop Layout */
    .desktop-layout {
        display: grid;
        grid-template-columns: 200px 1fr 1fr;
        grid-template-rows: auto 1fr auto auto;
        gap: 10px;
        width: 100%;
        height: 100%;
        background-color: var(--terminal-bg, #0d0d0d);
        border: 2px solid var(--border-color, #00ff00);
        box-shadow: 0 0 30px rgba(212, 134, 92, 0.3);
        padding: 10px;
        opacity: 1;
        visibility: visible;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    /* Tablet Layout - Sidebar + Stacked Panels */
    .tablet-layout {
        display: none;
        grid-template-columns: 180px 1fr;
        grid-template-rows: auto auto 1fr auto auto;
        gap: 8px;
        width: 100%;
        height: 100%;
        background-color: var(--terminal-bg, #0d0d0d);
        border: 2px solid var(--border-color, #00ff00);
        box-shadow: 0 0 30px rgba(212, 134, 92, 0.3);
        padding: 8px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .tablet-layout :global(.title-panel) {
        grid-column: 1;
        grid-row: 1;
    }

    .tablet-layout :global(.notification-bar) {
        grid-column: 2;
        grid-row: 1 / 3;
        align-self: start;
    }

    .tablet-layout :global(.stats-panel) {
        grid-column: 1;
        grid-row: 3;
    }

    .tablet-main-content {
        grid-column: 2;
        grid-row: 2 / 5;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 0;
        overflow: hidden;
    }

    .tablet-layout :global(.projects-panel),
    .tablet-layout :global(.upgrades-panel) {
        flex: 1;
        min-height: 0;
    }

    .tablet-layout :global(.action-row) {
        grid-column: 1 / 3;
        grid-row: 5;
    }

    .tablet-layout :global(.footer) {
        grid-column: 1 / 3;
        grid-row: 6;
    }

    .tablet-debug {
        position: static;
        grid-column: 2;
        grid-row: 1;
        justify-self: end;
        align-self: start;
        margin: 2px 4px 0 0;
        gap: 4px;
    }

    .tablet-layout :global(.theme-toggle) {
        grid-column: 1;
        grid-row: 1;
        justify-self: start;
        margin: 2px 0 0 4px;
    }

    /* Mobile Layout */
    .mobile-layout {
        display: none;
        flex-direction: column;
        width: 100%;
        height: 100vh;
        height: 100dvh;
        background-color: var(--bg-color);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .mobile-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 0;
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

    .events-btn {
        border-color: var(--text-amber, #ffb000);
        color: var(--text-amber, #ffb000);
    }

    .events-btn:hover {
        background-color: var(--text-amber, #ffb000);
        color: var(--panel-bg, #0f0f0f);
    }

    .float-text {
        position: fixed;
        color: var(--text-primary, #e8e6e3);
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

    /* Tablet breakpoint - Sidebar + stacked panels (768px - 1100px) */
    @media (max-width: 1100px) and (min-width: 768px) {
        .desktop-layout {
            display: none;
            opacity: 0;
            visibility: hidden;
        }

        .tablet-layout {
            display: grid;
            opacity: 1;
            visibility: visible;
        }

        .mobile-layout {
            display: none;
            opacity: 0;
            visibility: hidden;
        }

        /* Smaller debug buttons for tablet */
        .tablet-debug .debug-btn {
            padding: 4px 8px;
            font-size: 9px;
        }
    }

    /* Mobile breakpoint - Full mobile layout */
    @media (max-width: 767px) {
        .terminal-dashboard {
            height: 100vh;
            max-width: 100%;
        }

        .desktop-layout {
            display: none;
            opacity: 0;
            visibility: hidden;
        }

        .tablet-layout {
            display: none;
            opacity: 0;
            visibility: hidden;
        }

        .mobile-layout {
            display: flex;
            opacity: 1;
            visibility: visible;
        }
    }

</style>

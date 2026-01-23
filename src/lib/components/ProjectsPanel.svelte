<script lang="ts">
    import { PROJECTS } from '$lib/game/constants';
    import { gameState, switchTab, shipProject, unlockedProjects, formatNumber } from '$lib/game/store';
    import { getRequiredCredForProject } from '$lib/game/utils';

    type ProjectType = 'standard' | 'saas' | 'openSource';
    const projectTypes: { key: ProjectType; label: string }[] = [
        { key: 'standard', label: 'STANDARD' },
        { key: 'saas', label: 'SAAS' },
        { key: 'openSource', label: 'OPEN SOURCE' }
    ];

    function handleTabClick(type: ProjectType) {
        switchTab('projects', type);
    }
</script>

<div class="panel projects-panel">
    <div class="panel-header">
        ┌─ SHIP PROJECTS ────────────────────────────────┐
        <div class="tab-bar">
            {#each projectTypes as type}
                <button 
                    class="tab-btn" 
                    class:active={gameState.activeTab.projects === type.key}
                    onclick={() => handleTabClick(type.key)}
                >
                    [ {type.label} ]
                </button>
            {/each}
        </div>
    </div>
    <div class="panel-content projects-content">
        {#each projectTypes as type}
            <div class="tab-content" class:active={gameState.activeTab.projects === type.key}>
                <div class="item-list">
                    {#each PROJECTS[type.key] as project}
                        {@const count = gameState.projects[type.key][project.id] || 0}
                        {@const isUnlocked = unlockedProjects.includes(project.id)}
                        <button 
                            class="project-item"
                            class:locked={!isUnlocked}
                            class:purchased={count > 0}
                            onclick={() => isUnlocked && shipProject(type.key, project.id)}
                            disabled={!isUnlocked}
                        >
                            {#if !isUnlocked}
                                <span class="item-name">🔒 {project.name}</span>
                                <span class="item-locked-text">Need {getRequiredCredForProject(project.id)} Cred</span>
                            {:else}
                                <span class="item-name">
                                    {project.name}
                                    {#if count > 0}
                                        <span class="count-badge">[{count}]</span>
                                    {/if}
                                </span>
                                <span class="item-cost">{formatNumber(project.locCost)} LoC</span>
                                <span class="item-reward">
                                    → ${formatNumber(project.reward)}
                                    {#if project.cred > 0} + {project.cred} Cred{/if}
                                    {#if 'recurring' in project && project.recurring} (recurring){/if}
                                </span>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
    <div class="panel-footer projects-footer">└─────────────────────────────────────────────────────────┘</div>
</div>

<style>
    .panel {
        background-color: var(--panel-bg, #0f0f0f);
        display: flex;
        flex-direction: column;
    }

    .projects-panel {
        grid-column: 2;
        grid-row: 2;
        min-height: 0;
    }

    .panel-header {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        white-space: pre;
        padding: 4px 0;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .panel-content {
        flex: 1;
        overflow: auto;
        padding: 10px;
        border-left: 1px solid var(--border-color, #00ff00);
        border-right: 1px solid var(--border-color, #00ff00);
    }

    .panel-footer {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        white-space: pre;
        padding: 4px 0;
        flex-shrink: 0;
    }

    .projects-footer {
        border: none !important;
    }

    .tab-bar {
        display: flex;
        gap: 2px;
        padding: 4px 0;
    }

    .tab-btn {
        background-color: transparent;
        color: var(--text-dim, #008800);
        border: 1px solid transparent;
        padding: 4px 12px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .tab-btn:hover {
        color: var(--text-secondary, #00cc00);
        border-color: var(--text-dim, #008800);
    }

    .tab-btn.active {
        color: var(--text-primary, #00ff00);
        background-color: var(--tab-active-bg, #1a3a1a);
        border-color: var(--tab-active-border, #00ff00);
    }

    .tab-content {
        display: none;
        height: 100%;
    }

    .tab-content.active {
        display: block;
    }

    .item-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .project-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 10px;
        background-color: var(--button-bg, #1a1a1a);
        border: 1px solid var(--text-dim, #008800);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-wrap: nowrap;
        gap: 10px;
        font-family: 'Courier New', monospace;
        text-align: left;
        width: 100%;
    }

    .project-item:hover:not(.locked):not(.purchased) {
        background-color: var(--button-hover, #2a2a2a);
        border-color: var(--border-color, #00ff00);
    }

    .project-item.locked {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .project-item.purchased {
        background-color: #1a2a1a;
        border-color: var(--text-dim, #008800);
        cursor: default;
    }

    .item-name {
        color: var(--text-primary, #00ff00);
        font-size: 12px;
        flex: 0 0 auto;
    }

    .count-badge {
        color: var(--text-amber, #ffb000);
    }

    .item-cost {
        color: var(--text-amber, #ffb000);
        font-size: 11px;
        white-space: nowrap;
        flex: 0 0 auto;
    }

    .item-reward {
        color: var(--text-secondary, #00cc00);
        font-size: 10px;
        white-space: nowrap;
        flex: 0 0 auto;
    }

    .item-locked-text {
        color: var(--disabled-color, #444444);
        font-size: 10px;
    }

    .projects-panel .panel-content,
    .projects-panel .tab-content {
        overflow-y: auto;
        overflow-x: hidden;
    }
</style>

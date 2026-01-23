// Vibe Code Guru - Utility Functions

import type { Upgrade } from './constants';

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
}

export function getUpgradeCost(upgrade: Upgrade, count: number): number {
    const costMultiplier = Math.pow(1.15, count);
    return Math.floor(upgrade.cost * costMultiplier);
}

export function getMaxUpgradeLevel(cred: number): number {
    const UNLOCKS_UPGRADES = [
        { cred: 0, maxLevel: 3 },
        { cred: 50, maxLevel: 5 },
        { cred: 150, maxLevel: 7 },
        { cred: 400, maxLevel: 9 },
        { cred: 800, maxLevel: 10 }
    ];
    
    let maxLevel = 0;
    for (const unlock of UNLOCKS_UPGRADES) {
        if (cred >= unlock.cred) {
            maxLevel = unlock.maxLevel;
        }
    }
    return maxLevel;
}

export function getUnlockedProjects(cred: number): string[] {
    const UNLOCKS_PROJECTS = [
        { cred: 0, unlocks: ['todo-app', 'calculator', 'cli-tool'] },
        { cred: 10, unlocks: ['weather-app', 'mini-crm', 'library'] },
        { cred: 30, unlocks: ['portfolio', 'task-manager', 'framework'] },
        { cred: 50, unlocks: ['contact-form', 'analytics-tool', 'plugin-system'] },
        { cred: 80, unlocks: ['blog-engine', 'invoice-gen', 'theme-pack'] },
        { cred: 120, unlocks: ['wiki-clone', 'appointment-booker', 'codegen'] },
        { cred: 180, unlocks: ['bookmark-manager', 'survey-platform', 'linter'] },
        { cred: 250, unlocks: ['recipe-tracker', 'ab-testing', 'test-framework'] },
        { cred: 350, unlocks: ['habit-tracker', 'user-feedback', 'docs-site'] },
        { cred: 500, unlocks: ['feature-flags', 'api-gateway', 'package-manager'] }
    ];
    
    let unlocked: string[] = [];
    for (const unlock of UNLOCKS_PROJECTS) {
        if (cred >= unlock.cred) {
            unlocked = unlocked.concat(unlock.unlocks);
        }
    }
    return [...new Set(unlocked)];
}

export function getRequiredCredForProject(projectId: string): number {
    const UNLOCKS_PROJECTS = [
        { cred: 0, unlocks: ['todo-app', 'calculator', 'cli-tool'] },
        { cred: 10, unlocks: ['weather-app', 'mini-crm', 'library'] },
        { cred: 30, unlocks: ['portfolio', 'task-manager', 'framework'] },
        { cred: 50, unlocks: ['contact-form', 'analytics-tool', 'plugin-system'] },
        { cred: 80, unlocks: ['blog-engine', 'invoice-gen', 'theme-pack'] },
        { cred: 120, unlocks: ['wiki-clone', 'appointment-booker', 'codegen'] },
        { cred: 180, unlocks: ['bookmark-manager', 'survey-platform', 'linter'] },
        { cred: 250, unlocks: ['recipe-tracker', 'ab-testing', 'test-framework'] },
        { cred: 350, unlocks: ['habit-tracker', 'user-feedback', 'docs-site'] },
        { cred: 500, unlocks: ['feature-flags', 'api-gateway', 'package-manager'] }
    ];
    
    for (const unlock of UNLOCKS_PROJECTS) {
        if (unlock.unlocks.includes(projectId)) {
            return unlock.cred;
        }
    }
    return 0;
}

export function getRequiredCredForUpgrade(type: 'vibeCode' | 'delegation', level: number): number {
    const UNLOCKS_UPGRADES = [
        { cred: 0, maxLevel: 3 },
        { cred: 50, maxLevel: 5 },
        { cred: 150, maxLevel: 7 },
        { cred: 400, maxLevel: 9 },
        { cred: 800, maxLevel: 10 }
    ];
    
    for (const unlock of UNLOCKS_UPGRADES) {
        if (level <= unlock.maxLevel) {
            return unlock.cred;
        }
    }
    return 999;
}

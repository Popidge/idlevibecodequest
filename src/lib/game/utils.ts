// Idle Vibe Code Quest - Utility Functions

import type { Upgrade } from './constants';

// Import UNLOCKS from constants for reference
import { UNLOCKS } from './constants';

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
    let maxLevel = 0;
    for (const unlock of UNLOCKS.upgrades) {
        if (cred >= unlock.cred) {
            maxLevel = unlock.maxLevel;
        }
    }
    return maxLevel;
}

export function getUnlockedProjects(cred: number): string[] {
    let unlocked: string[] = [];
    for (const unlock of UNLOCKS.projects) {
        if (cred >= unlock.cred) {
            unlocked = unlocked.concat(unlock.unlocks);
        }
    }
    return [...new Set(unlocked)];
}

export function getRequiredCredForProject(projectId: string): number {
    for (const unlock of UNLOCKS.projects) {
        if ((unlock.unlocks as readonly string[]).includes(projectId)) {
            return unlock.cred;
        }
    }
    return 0;
}

export function getRequiredCredForUpgrade(type: 'vibeCode' | 'delegation', level: number): number {
    for (const unlock of UNLOCKS.upgrades) {
        if (level <= unlock.maxLevel) {
            return unlock.cred;
        }
    }
    return 999;
}

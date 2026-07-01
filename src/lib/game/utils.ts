// Idle Vibe Code Quest - Utility Functions

import type { Project, Upgrade } from './constants';

// Import UNLOCKS from constants for reference
import { UNLOCKS } from './constants';

/**
 * Produces a compact string representation of a number using 'K' for thousands and 'M' for millions.
 *
 * @param num - The numeric value to format.
 * @returns A string with two decimal places and 'M' if `num` >= 1,000,000; with one decimal place and 'K' if `num` >= 1,000; otherwise the integer part as a string.
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
}

export function formatMoney(amount: number): string {
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + 'B';
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 10000) return (amount / 1000).toFixed(1) + 'K';
    return amount.toFixed(2);
}

export function getProjectLocCost(project: Project, count: number): number {
    return Math.floor(project.locCost * Math.pow(1.15, count));
}

/**
 * Compute the cost for the next upgrade level based on the upgrade's base cost and how many have already been purchased.
 *
 * @param upgrade - The upgrade definition whose base `cost` is used as the starting value
 * @param count - The number of times this upgrade has already been purchased
 * @returns The calculated cost for the next upgrade level, rounded down to an integer
 */
export function getUpgradeCost(upgrade: Upgrade, count: number): number {
    const costMultiplier = Math.pow(1.15, count);
    return Math.floor(upgrade.cost * costMultiplier);
}

/**
 * Determine the highest upgrade level available for the given credential amount.
 *
 * @param cred - The credential value used to check unlock thresholds
 * @param credThresholdReduction - Reduction to apply to cred thresholds from tech tree bonuses
 * @returns The highest unlocked upgrade level for `cred`, or `0` if none are unlocked
 */
export function getMaxUpgradeLevel(cred: number, credThresholdReduction: number = 0): number {
    // credThresholdReduction means the unlock threshold is LOWER by that amount
    // So the player's effective cred for unlocking is: cred + reduction
    const effectiveCred = cred + credThresholdReduction;
    let maxLevel = 0;
    for (const unlock of UNLOCKS.upgrades) {
        if (effectiveCred >= unlock.cred) {
            maxLevel = unlock.maxLevel;
        }
    }
    return maxLevel;
}

/**
 * List project IDs unlocked at the specified credential level.
 *
 * @param cred - The credential value used to evaluate unlock thresholds
 * @param credThresholdReduction - Reduction to apply to cred thresholds from tech tree bonuses
 * @returns An array of unique project IDs unlocked for the given `cred`
 */
export function getUnlockedProjects(cred: number, credThresholdReduction: number = 0): string[] {
    // credThresholdReduction means the unlock threshold is LOWER by that amount
    // So the player's effective cred for unlocking is: cred + reduction
    const effectiveCred = cred + credThresholdReduction;
    let unlocked: string[] = [];
    for (const unlock of UNLOCKS.projects) {
        if (effectiveCred >= unlock.cred) {
            unlocked = unlocked.concat(unlock.unlocks);
        }
    }
    return [...new Set(unlocked)];
}

/**
 * Lookup the credential threshold required to unlock a project.
 *
 * @param projectId - The identifier of the project to query
 * @returns The minimum credential value required to unlock `projectId`, or `0` if the project is not listed
 */
export function getRequiredCredForProject(projectId: string): number {
    for (const unlock of UNLOCKS.projects) {
        if ((unlock.unlocks as readonly string[]).includes(projectId)) {
            return unlock.cred;
        }
    }
    return 0;
}

/**
 * Determine the credential requirement for a given upgrade level.
 *
 * @param level - The target upgrade level to evaluate
 * @returns The minimum credential required to unlock the specified upgrade level, or `999` if no matching unlock is defined
 */
export function getRequiredCredForUpgrade(level: number): number {
    for (const unlock of UNLOCKS.upgrades) {
        if (level <= unlock.maxLevel) {
            return unlock.cred;
        }
    }
    return 999;
}

/**
 * Get the effective credential requirement for unlocking a project after tech tree reductions.
 *
 * @param projectId - The identifier of the project to query
 * @param credThresholdReduction - Reduction to apply to cred thresholds from tech tree bonuses
 * @returns The minimum credential value required to unlock `project`, or `0` if project is always unlocked
 */
export function getEffectiveRequiredCredForProject(projectId: string, credThresholdReduction: number = 0): number {
    const baseCred = getRequiredCredForProject(projectId);
    return Math.max(0, baseCred - credThresholdReduction);
}

/**
 * Get the effective credential requirement for unlocking an upgrade level after tech tree reductions.
 *
 * @param level - The target upgrade level to evaluate
 * @param credThresholdReduction - Reduction to apply to cred thresholds from tech tree bonuses
 * @returns The minimum credential required to unlock the specified upgrade level
 */
export function getEffectiveRequiredCredForUpgrade(level: number, credThresholdReduction: number = 0): number {
    const baseCred = getRequiredCredForUpgrade(level);
    return Math.max(0, baseCred - credThresholdReduction);
}

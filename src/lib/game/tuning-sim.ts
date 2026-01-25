// Idle Vibe Code Quest - Tuning Simulation Engine
// Standalone module for modeling gameplay timing metrics

import { PROJECTS, UPGRADES, TECH_DEBT, PRESTIGE, UNLOCKS, type Upgrade, type Project } from './constants';

// ============================================
// Types for Simulation Configuration
// ============================================

export interface TuningConfig {
    // Click rate (clicks per second)
    clickRate: number;
    
    // Base accumulation rates (overrides TECH_DEBT constants)
    baseDebtPerClick: number;
    debtPerProject: number;
    delegationDebtRate: number;
    maxDebt: number;
    
    // Upgrade cost multiplier
    upgradeCostMultiplier: number;
    
    // Prestige threshold percentage (0.0 - 1.0)
    prestigeThresholdPercent: number;
    
    // Starting cash per prestige point
    startingCashPerPoint: number;
    
    // Multipliers per prestige point
    cashMultiplierPerPoint: number;
    locMultiplierPerPoint: number;
    credMultiplierPerPoint: number;
    
    // Tech tree modifiers (0.0 = no effect)
    techTreeMoneyMultiplier: number;
    techTreeLocMultiplier: number;
    techTreeCredMultiplier: number;
    techTreeLocPerClickBonus: number;
    techTreePassiveLocBonus: number;
    techTreeDebtAccumReduction: number;
    techTreeDebtPenaltyReduction: number;
    techTreeDebtClearingEfficiency: number;
    
    // Auto-purchase threshold (0.0 - 1.0)
    autoPurchaseThreshold: number;
}

export interface SimulationState {
    resources: {
        money: number;
        loc: number;
        cred: number;
    };
    upgrades: {
        vibeCode: Map<number, number>;
        delegation: Map<number, number>;
    };
    projects: {
        standard: Map<string, number>;
        saas: Map<string, number>;
        openSource: Map<string, number>;
    };
    techDebt: number;
    projectsShipped: number;
    totalClicks: number;
    timeElapsed: number; // in seconds
    totalCashEarned: number;
}

export interface SimulationResult {
    // Primary metrics
    timeToFirstPrestige: number | null; // seconds, null if not reached
    timeToSecondPrestige: number | null; // seconds from first to second
    techDebtAt4Minutes: number;
    timeToNextUpgrade: number | null; // seconds, null if no upgrades available
    totalUpgradesAtFirstPrestige: number;
    totalUpgradesAtSecondPrestige: number;
    
    // Secondary metrics
    finalClickPower: number;
    finalPassiveLocRate: number;
    finalPassiveIncome: number;
    finalDebtPenaltyFactor: number;
    
    // Upgrade progression over time (sampled)
    upgradeProgressOverTime: Array<{ time: number; owned: number; percentage: number }>;
    
    // Resource rates over time (sampled)
    resourceRateOverTime: Array<{ time: number; locRate: number; cashRate: number; credRate: number }>;
    
    // Time to each upgrade level
    timeToUpgradeLevels: Array<{ level: number; time: number }>;
}

export interface UpgradeCostInfo {
    type: 'vibeCode' | 'delegation';
    level: number;
    baseCost: number;
    currentCost: number;
    count: number;
}

// ============================================
// Default Configuration
// ============================================

export const defaultConfig: TuningConfig = {
    clickRate: 3, // 3 clicks per second (active play)
    
    // Tech Debt defaults from constants
    baseDebtPerClick: TECH_DEBT.BASE_ACCUMULATION,
    debtPerProject: TECH_DEBT.PER_PROJECT,
    delegationDebtRate: TECH_DEBT.DELEGATION_DEBT_RATE,
    maxDebt: TECH_DEBT.MAX_DEBT,
    
    // Upgrade cost multiplier
    upgradeCostMultiplier: 1.15,
    
    // Prestige defaults
    prestigeThresholdPercent: PRESTIGE.THRESHOLD_PERCENT,
    startingCashPerPoint: PRESTIGE.STARTING_CASH_PER_POINT,
    cashMultiplierPerPoint: PRESTIGE.CASH_MULTIPLIER_PER_POINT,
    locMultiplierPerPoint: PRESTIGE.LOC_MULTIPLIER_PER_POINT,
    credMultiplierPerPoint: PRESTIGE.CRED_MULTIPLIER_PER_POINT,
    
    // Tech tree defaults (no nodes purchased)
    techTreeMoneyMultiplier: 0,
    techTreeLocMultiplier: 0,
    techTreeCredMultiplier: 0,
    techTreeLocPerClickBonus: 0,
    techTreePassiveLocBonus: 0,
    techTreeDebtAccumReduction: 0,
    techTreeDebtPenaltyReduction: 0,
    techTreeDebtClearingEfficiency: 1,
    
    autoPurchaseThreshold: 1.0, // 100% of cost needed for auto-purchase
};

// ============================================
// Helper Functions
// ============================================

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
}

function getUpgradeCost(upgrade: Upgrade, count: number, multiplier: number): number {
    const costMultiplier = Math.pow(multiplier, count);
    return Math.floor(upgrade.cost * costMultiplier);
}

function getProjectLocCost(project: Project, count: number): number {
    const costMultiplier = Math.pow(1.15, count);
    return Math.floor(project.locCost * costMultiplier);
}

function getMaxUpgradeLevel(cred: number): number {
    let maxLevel = 0;
    for (const unlock of UNLOCKS.upgrades) {
        if (cred >= unlock.cred) {
            maxLevel = unlock.maxLevel;
        }
    }
    return maxLevel;
}

function getUnlockedProjects(cred: number): string[] {
    let unlocked: string[] = [];
    for (const unlock of UNLOCKS.projects) {
        if (cred >= unlock.cred) {
            unlocked = unlocked.concat(unlock.unlocks);
        }
    }
    return [...new Set(unlocked)];
}

function calculatePrestigePoints(cash: number): number {
    const rawPoints = Math.floor(Math.log10(cash + 1));
    return Math.max(rawPoints, PRESTIGE.MIN_POINTS);
}

// ============================================
// Simulation Engine
// ============================================

export function simulateGameplay(config: TuningConfig, maxTimeSeconds: number = 3600): SimulationResult {
    // Initialize state
    const state: SimulationState = {
        resources: { money: 0, loc: 0, cred: 0 },
        upgrades: {
            vibeCode: new Map(),
            delegation: new Map()
        },
        projects: {
            standard: new Map(),
            saas: new Map(),
            openSource: new Map()
        },
        techDebt: 0,
        projectsShipped: 0,
        totalClicks: 0,
        timeElapsed: 0,
        totalCashEarned: 0
    };

    // Calculate total upgrades available
    const totalUpgradesAvailable = UPGRADES.vibeCode.length + UPGRADES.delegation.length;

    // Track metrics
    let timeToFirstPrestige: number | null = null;
    let timeToSecondPrestige: number | null = null;
    let upgradesAtFirstPrestige = 0;
    let upgradesAtSecondPrestige = 0;
    
    const upgradeProgressOverTime: Array<{ time: number; owned: number; percentage: number }> = [];
    const resourceRateOverTime: Array<{ time: number; locRate: number; cashRate: number; credRate: number }> = [];
    const timeToUpgradeLevels: Array<{ level: number; time: number }> = [];

    // Sample intervals
    const sampleInterval = 10; // sample every 10 seconds
    let lastSampleTime = 0;

    // Simulation tick (0.1 second resolution)
    const tickRate = 0.1;
    const ticks = Math.ceil(maxTimeSeconds / tickRate);

    for (let tick = 0; tick < ticks; tick++) {
        const dt = tickRate;
        const time = tick * dt;
        state.timeElapsed = time;

        // ========================================
        // Calculate current modifiers
        // ========================================
        
        // Base click power: 1 + sum(level × count)
        let baseClickPower = 1;
        for (const [level, count] of state.upgrades.vibeCode) {
            baseClickPower += level * count;
        }
        
        // Effective click power with tech tree modifier
        const effectiveLocMultiplier = 1 + config.techTreeLocMultiplier;
        const locPerClickFlat = baseClickPower * config.techTreeLocPerClickBonus;
        const effectiveClickPower = Math.floor((baseClickPower + locPerClickFlat) * effectiveLocMultiplier);

        // Base passive loc rate: sum(count × (level + 0.02 × clickPower))
        let basePassiveLocRate = 0;
        for (const [level, count] of state.upgrades.delegation) {
            basePassiveLocRate += count * (level + (0.02 * baseClickPower));
        }
        
        // Effective passive loc rate
        const passiveLocFlat = basePassiveLocRate * config.techTreePassiveLocBonus;
        const effectivePassiveLocRate = (basePassiveLocRate + passiveLocFlat) * effectiveLocMultiplier;

        // Debt penalty factor
        const debtPenaltyFactor = Math.pow(1 - state.techDebt, 2);

        // Effective cash multiplier
        const effectiveCashMultiplier = (1 + config.techTreeMoneyMultiplier) * (1 + config.techTreeLocMultiplier);

        // ========================================
        // Resource generation from clicks
        // ========================================
        
        const clicksThisTick = config.clickRate * dt;
        state.totalClicks += clicksThisTick;
        
        const locFromClicks = effectiveClickPower * clicksThisTick;
        state.resources.loc += locFromClicks;

        // Tech debt from clicks
        const debtPerClick = config.baseDebtPerClick * (1 - Math.min(config.techTreeDebtAccumReduction, 0.95));
        state.techDebt = Math.min(state.techDebt + (debtPerClick * clicksThisTick), config.maxDebt);

        // ========================================
        // Resource generation from passive sources
        // ========================================
        
        // Passive LoC generation
        const locFromPassive = effectivePassiveLocRate * dt;
        state.resources.loc += locFromPassive;

        // Passive income from SaaS projects
        let basePassiveIncome = 0;
        for (const [projectId, count] of state.projects.saas) {
            const project = PROJECTS.saas.find(p => p.id === projectId);
            if (project && 'recurring' in project && project.recurring) {
                basePassiveIncome += project.reward * count;
            }
        }
        
        const effectivePassiveIncome = basePassiveIncome * debtPenaltyFactor * effectiveCashMultiplier;
        const incomeFromPassive = effectivePassiveIncome * dt;
        state.resources.money += incomeFromPassive;
        state.totalCashEarned += incomeFromPassive;

        // Tech debt from passive delegation
        const debtPerSecond = config.baseDebtPerClick * config.delegationDebtRate * (1 - Math.min(config.techTreeDebtAccumReduction, 0.95));
        state.techDebt = Math.min(state.techDebt + (debtPerSecond * dt), config.maxDebt);

        // ========================================
        // Auto-purchase upgrades when affordable
        // ========================================
        
        const maxUpgradeLevel = getMaxUpgradeLevel(state.resources.cred);
        const currentOwned = countTotalUpgrades(state);
        
        // Check vibeCode upgrades
        for (const upgrade of UPGRADES.vibeCode) {
            if (upgrade.level <= maxUpgradeLevel) {
                const currentCount = state.upgrades.vibeCode.get(upgrade.level) || 0;
                const cost = getUpgradeCost(upgrade, currentCount, config.upgradeCostMultiplier);
                
                if (state.resources.money >= cost * config.autoPurchaseThreshold) {
                    state.resources.money -= cost;
                    state.upgrades.vibeCode.set(upgrade.level, currentCount + 1);
                }
            }
        }

        // Check delegation upgrades
        for (const upgrade of UPGRADES.delegation) {
            if (upgrade.level <= maxUpgradeLevel) {
                const currentCount = state.upgrades.delegation.get(upgrade.level) || 0;
                const cost = getUpgradeCost(upgrade, currentCount, config.upgradeCostMultiplier);
                
                if (state.resources.money >= cost * config.autoPurchaseThreshold) {
                    state.resources.money -= cost;
                    state.upgrades.delegation.set(upgrade.level, currentCount + 1);
                }
            }
        }

        // ========================================
        // Ship projects when affordable (optimally)
        // ========================================
        
        // Find cheapest unlocked project
        const unlockedProjectIds = getUnlockedProjects(state.resources.cred);
        let cheapestProject: { type: 'standard' | 'saas' | 'openSource'; id: string; cost: number } | null = null;
        let minCost = Infinity;
        
        for (const type of ['standard', 'saas', 'openSource'] as const) {
            const projectList = PROJECTS[type];
            for (const project of projectList) {
                if (unlockedProjectIds.includes(project.id)) {
                    const count = state.projects[type].get(project.id) || 0;
                    const cost = getProjectLocCost(project, count);
                    if (cost < minCost) {
                        minCost = cost;
                        cheapestProject = { type, id: project.id, cost };
                    }
                }
            }
        }
        
        // Ship project if affordable (use 80% of LOC for optimal play)
        if (cheapestProject && state.resources.loc >= cheapestProject.cost * 0.8) {
            const count = state.projects[cheapestProject.type].get(cheapestProject.id) || 0;
            const cost = getProjectLocCost(PROJECTS[cheapestProject.type].find(p => p.id === cheapestProject.id)!, count);
            
            state.resources.loc -= cost;
            
            const project = PROJECTS[cheapestProject.type].find(p => p.id === cheapestProject.id)!;
            const effectiveMoneyReward = project.reward * debtPenaltyFactor * effectiveCashMultiplier;
            const effectiveCredReward = Math.floor(project.cred * debtPenaltyFactor * (1 + config.techTreeCredMultiplier));
            
            state.resources.money += effectiveMoneyReward;
            state.resources.cred += effectiveCredReward;
            state.totalCashEarned += effectiveMoneyReward;
            state.projects[cheapestProject.type].set(cheapestProject.id, count + 1);
            state.projectsShipped++;
        }

        // ========================================
        // Check prestige threshold
        // ========================================
        
        const newOwned = countTotalUpgrades(state);
        const upgradePercentage = newOwned / totalUpgradesAvailable;
        
        // Sample upgrade progress
        if (time - lastSampleTime >= sampleInterval) {
            upgradeProgressOverTime.push({
                time,
                owned: newOwned,
                percentage: upgradePercentage * 100
            });
            resourceRateOverTime.push({
                time,
                locRate: effectiveClickPower * config.clickRate + effectivePassiveLocRate,
                cashRate: effectivePassiveIncome,
                credRate: calculateAverageCredRate(state, effectiveCashMultiplier)
            });
            lastSampleTime = time;
        }

        // Track time to each upgrade level (vibeCode)
        if (newOwned > currentOwned) {
            // Record when we hit each milestone
            if (newOwned <= 10 && timeToUpgradeLevels.filter(t => t.level === newOwned).length === 0) {
                timeToUpgradeLevels.push({ level: newOwned, time });
            }
        }

        // First prestige
        if (timeToFirstPrestige === null && upgradePercentage >= config.prestigeThresholdPercent) {
            timeToFirstPrestige = time;
            upgradesAtFirstPrestige = newOwned;
            
            // Simulate the prestige reset
            const points = calculatePrestigePoints(state.totalCashEarned);
            state.resources.money = points * config.startingCashPerPoint;
            state.resources.loc = 0;
            state.resources.cred = 0;
            state.upgrades.vibeCode.clear();
            state.upgrades.delegation.clear();
            state.projects.standard.clear();
            state.projects.saas.clear();
            state.projects.openSource.clear();
            state.techDebt = 0;
            state.projectsShipped = 0;
            state.totalCashEarned = state.resources.money;
        }

        // Second prestige
        if (timeToFirstPrestige !== null && timeToSecondPrestige === null && upgradePercentage >= config.prestigeThresholdPercent) {
            timeToSecondPrestige = time - timeToFirstPrestige;
            upgradesAtSecondPrestige = newOwned;
            break; // Stop simulation after second prestige
        }
    }

    // Calculate final metrics
    const finalClickPower = calculateClickPower(state, config);
    const finalPassiveLocRate = calculatePassiveLocRate(state, config);
    const finalPassiveIncome = calculatePassiveIncome(state, config);
    const finalDebtPenaltyFactor = Math.pow(1 - state.techDebt, 2);

    return {
        timeToFirstPrestige,
        timeToSecondPrestige,
        techDebtAt4Minutes: calculateDebtAtTime(state, 240, config),
        timeToNextUpgrade: calculateTimeToNextUpgrade(state, config),
        totalUpgradesAtFirstPrestige: upgradesAtFirstPrestige,
        totalUpgradesAtSecondPrestige: upgradesAtSecondPrestige,
        finalClickPower,
        finalPassiveLocRate,
        finalPassiveIncome,
        finalDebtPenaltyFactor,
        upgradeProgressOverTime,
        resourceRateOverTime,
        timeToUpgradeLevels
    };
}

// ============================================
// Helper Functions
// ============================================

function countTotalUpgrades(state: SimulationState): number {
    let owned = 0;
    for (const count of state.upgrades.vibeCode.values()) {
        owned += count;
    }
    for (const count of state.upgrades.delegation.values()) {
        owned += count;
    }
    return owned;
}

function calculateClickPower(state: SimulationState, config: TuningConfig): number {
    let baseClickPower = 1;
    for (const [level, count] of state.upgrades.vibeCode) {
        baseClickPower += level * count;
    }
    
    // Apply tech tree modifiers
    const effectiveLocMultiplier = 1 + config.techTreeLocMultiplier;
    const locPerClickFlat = baseClickPower * config.techTreeLocPerClickBonus;
    return Math.floor((baseClickPower + locPerClickFlat) * effectiveLocMultiplier);
}

function calculatePassiveLocRate(state: SimulationState, config: TuningConfig): number {
    let baseClickPower = 1;
    for (const [level, count] of state.upgrades.vibeCode) {
        baseClickPower += level * count;
    }
    
    let basePassiveLocRate = 0;
    for (const [level, count] of state.upgrades.delegation) {
        basePassiveLocRate += count * (level + (0.02 * baseClickPower));
    }
    
    // Apply tech tree modifiers
    const effectiveLocMultiplier = 1 + config.techTreeLocMultiplier;
    const passiveLocFlat = basePassiveLocRate * config.techTreePassiveLocBonus;
    return (basePassiveLocRate + passiveLocFlat) * effectiveLocMultiplier;
}

function calculatePassiveIncome(state: SimulationState, config: TuningConfig): number {
    let basePassiveIncome = 0;
    const debtPenaltyFactor = Math.pow(1 - state.techDebt, 2);
    
    for (const [projectId, count] of state.projects.saas) {
        const project = PROJECTS.saas.find(p => p.id === projectId);
        if (project && 'recurring' in project && project.recurring) {
            basePassiveIncome += project.reward * count;
        }
    }
    
    // Apply tech tree modifiers
    const effectiveLocMultiplier = 1 + config.techTreeLocMultiplier;
    const effectiveCashMultiplier = (1 + config.techTreeMoneyMultiplier) * effectiveLocMultiplier;
    return basePassiveIncome * debtPenaltyFactor * effectiveCashMultiplier;
}

function calculateDebtAtTime(state: SimulationState, targetTime: number, config: TuningConfig): number {
    // Simplified debt calculation at a specific time
    // Assumes average click rate and passive generation
    const clicksAtTarget = config.clickRate * targetTime;
    const passiveAtTarget = config.baseDebtPerClick * config.delegationDebtRate * targetTime;
    const projectDebtAtTarget = state.projectsShipped * config.debtPerProject * targetTime;
    
    const totalDebt = (config.baseDebtPerClick * clicksAtTarget) + passiveAtTarget + projectDebtAtTarget;
    return Math.min(totalDebt, config.maxDebt);
}

function calculateTimeToNextUpgrade(state: SimulationState, config: TuningConfig): number | null {
    const maxUpgradeLevel = getMaxUpgradeLevel(state.resources.cred);
    let minCost = Infinity;
    
    for (const type of ['vibeCode', 'delegation'] as const) {
        const upgradeList = UPGRADES[type];
        for (const upgrade of upgradeList) {
            if (upgrade.level <= maxUpgradeLevel) {
                const currentCount = type === 'vibeCode' 
                    ? (state.upgrades.vibeCode.get(upgrade.level) || 0)
                    : (state.upgrades.delegation.get(upgrade.level) || 0);
                const cost = getUpgradeCost(upgrade, currentCount, config.upgradeCostMultiplier);
                if (cost < minCost) {
                    minCost = cost;
                }
            }
        }
    }
    
    if (minCost === Infinity) return null;
    
    // Calculate resource generation rate
    const clickPower = calculateClickPower(state, config);
    const locPerSecond = (clickPower * config.clickRate) + calculatePassiveLocRate(state, config);
    
    if (locPerSecond <= 0) return null;
    
    const remainingLoc = minCost - state.resources.loc;
    if (remainingLoc <= 0) return 0;
    
    return remainingLoc / locPerSecond;
}

function calculateAverageCredRate(state: SimulationState, credMultiplier: number): number {
    // Simplified cred rate calculation
    let avgCredPerProject = 0;
    let projectsPerSecond = 0.1; // Approximate
    
    return projectsPerSecond * avgCredPerProject * credMultiplier;
}

// ============================================
// Preset Configurations for Quick Testing
// ============================================

export const tuningPresets: Record<string, TuningConfig> = {
    baseline: { ...defaultConfig },
    buffed: {
        ...defaultConfig,
        clickRate: 5,
        baseDebtPerClick: defaultConfig.baseDebtPerClick * 0.5,
        startingCashPerPoint: defaultConfig.startingCashPerPoint * 1.5,
        locMultiplierPerPoint: defaultConfig.locMultiplierPerPoint * 1.5
    },
    nerfed: {
        ...defaultConfig,
        clickRate: 2,
        baseDebtPerClick: defaultConfig.baseDebtPerClick * 2,
        prestigeThresholdPercent: 0.8,
        upgradeCostMultiplier: 1.2
    },
    fast: {
        ...defaultConfig,
        clickRate: 8,
        baseDebtPerClick: 0.00002,
        upgradeCostMultiplier: 1.1,
        prestigeThresholdPercent: 0.6
    },
    slow: {
        ...defaultConfig,
        clickRate: 1,
        baseDebtPerClick: 0.0002,
        upgradeCostMultiplier: 1.25,
        prestigeThresholdPercent: 0.8
    }
};

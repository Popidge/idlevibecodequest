// Idle Vibe Code Quest - Game Store (Svelte 5 $state)

import { PROJECTS, UPGRADES, PROMPT_MESSAGES, TECH_DEBT, PRESTIGE, TECH_TREES, TECH_TREE_COSTS, type Upgrade, type Project } from './constants';
import type { GameState, FloatText, Notification, QueuedNotification, OfflineGains, Hint, PrestigePath, PrestigeSummary, TechTreeNode, TechTreePath, SystemModifiers } from './types';
import { getMaxUpgradeLevel, getUnlockedProjects, getUpgradeCost } from './utils';

// Default game state
const defaultState: GameState = {
    resources: {
        money: 0,
        loc: 0,
        cred: 0
    },
    upgrades: {
        vibeCode: {},
        delegation: {}
    },
    projects: {
        standard: {},
        saas: {},
        openSource: {}
    },
    totalClicks: 0,
    activeTab: {
        projects: 'standard',
        upgrades: 'vibeCode'
    },
    // Phase 1: Tech Debt System
    techDebt: 0,
    projectsShipped: 0,
    lastSaveTime: Date.now(),
    // Phase 3: Prestige System
    prestige: {
        prestigePoints: 0,
        totalPrestiges: 0,
        pathHistory: [],
        runStartTime: Date.now(),
        totalCashEarnedThisRun: 0,
        // Phase 4: Tech Tree purchases - bonuses now calculated dynamically from techTrees
        techTrees: {
            buyout: [],
            nirvana: [],
            linus: [],
            learning: []
        }
    }
};

// Default modifiers object
const defaultModifiers: SystemModifiers = {
    moneyMultiplier: 0,
    locMultiplier: 0,
    credMultiplier: 0,
    prestigePointMultiplier: 0,
    startingCashFlat: 0,
    locPerClickFlat: 0,
    passiveLocRateFlat: 0,
    credThresholdReduction: 0,
    debtAccumulationReduction: 0,
    debtPenaltyReduction: 0,
    debtClearingEfficiency: 1,
    unlockLegacyWhisperer: false,
    unlockCodeZen: false
};

// Game state class with reactive properties
class GameStore {
    gameState = $state<GameState>({ ...defaultState });
    currentPrompt = $state<string>(PROMPT_MESSAGES[0]);
    floatTexts = $state<FloatText[]>([]);
    notifications = $state<Notification[]>([]);
    notificationId = 0;
    floatTextId = 0;

    // Unified notification queue for NotificationBar
    notificationQueue = $state<QueuedNotification[]>([]);

    // Phase 1: Offline gains modal state
    offlineGains = $state<OfflineGains | null>(null);
    showOfflineModal = $state(false);
    showDebtModal = $state(false);
    
    // Phase 2: Hint system state
    hints = $state<Hint[]>([]);
    hintCooldowns = $state<Set<number>>(new Set());
    hintId = 0;
    
    // Phase 2: Track if debt low hint has been shown (to prevent repeat showings)
    debtLowHintShown = false;
    private previousDebtState: 'low' | 'high' = 'low';
    
    // Phase 3: Prestige system state
    showPrestigeModal = $state(false);
    showPrestigeSummaryModal = $state(false);
    pendingPrestigePoints = $state(0);
    selectedPrestigePath = $state<PrestigePath | null>(null);

    // Phase 4: Tech Tree system state
    showTechTreeModal = $state(false);
    activeTechTreeTab = $state<TechTreePath>('buyout');

    // ========================================
    // ACTIVE MODIFIERS - Single Source of Truth
    // ========================================
    
    // Derive all modifiers from purchased tech tree nodes
    activeModifiers = $derived.by(() => {
        const mods = { ...defaultModifiers };
        const paths: TechTreePath[] = ['buyout', 'nirvana', 'linus', 'learning'];
        
        for (const path of paths) {
            const purchasedNodes = this.getPurchasedNodes(path);
            const tree = TECH_TREES[path];
            
            for (const nodeIndex of purchasedNodes) {
                const node = tree.nodes[nodeIndex];
                if (node && node.modifiers) {
                    // Sum additive modifiers
                    for (const key of Object.keys(node.modifiers) as (keyof SystemModifiers)[]) {
                        const value = node.modifiers[key];
                        if (typeof value === 'number') {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (mods as any)[key] = (mods as any)[key] + value;
                        } else if (typeof value === 'boolean') {
                            // Boolean flags - set to true if present
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (mods as any)[key] = value;
                        }
                    }
                }
            }
        }
        
        return mods;
    });

    // ========================================
    // BASE STAT Getters (Raw Values - No Modifiers)
    // These are the foundation for all calculations
    // ========================================
    
    get baseClickPower() {
        // Each vibeCode upgrade level adds its level number to LoC per click
        // Level 1 = +1, Level 2 = +2, etc.
        let power = 1; // Base power
        for (const level in this.gameState.upgrades.vibeCode) {
            const count = this.gameState.upgrades.vibeCode[level];
            power += parseInt(level) * count;
        }
        return power;
    }

    get basePassiveLocRate() {
        // LoC/sec from delegation: count × (tier + 0.02 × clickPower)
        // Each copy of an upgrade adds its tier value + 2% of click power
        let locPerSecond = 0;
        for (const level in this.gameState.upgrades.delegation) {
            const count = this.gameState.upgrades.delegation[level];
            locPerSecond += count * (parseInt(level) + (0.02 * this.baseClickPower));
        }
        return locPerSecond;
    }

    get basePassiveIncome() {
        let passive = 0;
        for (const projectId in this.gameState.projects.saas) {
            const project = PROJECTS.saas.find(p => p.id === projectId);
            const count = this.gameState.projects.saas[projectId] || 0;
            if (project && 'recurring' in project && project.recurring) {
                passive += project.reward * count;
            }
        }
        return passive;
    }

    // ========================================
    // TECH DEBT Getters
    // ========================================
    
    get debtPenaltyFactor() {
        // Tech debt affects ONLY cash/cred income, NOT LoC generation
        // Penalty: (1 - debt)²
        return Math.pow(1 - this.gameState.techDebt, 2);
    }
    
    get debtAccumulationPerClick() {
        // Base accumulation + per-project accumulation
        return TECH_DEBT.BASE_ACCUMULATION + (this.gameState.projectsShipped * TECH_DEBT.PER_PROJECT);
    }
    
    get debtAccumulationPerSecond() {
        // Delegation gains: BASE × DELEGATION_DEBT_RATE per second
        return TECH_DEBT.BASE_ACCUMULATION * TECH_DEBT.DELEGATION_DEBT_RATE;
    }

    // ========================================
    // PRESTIGE MULTIPLIER Getters
    // ========================================

    get effectiveCashMultiplier() {
        // Base + tech tree modifiers (includes prestige path bonuses via tech tree nodes)
        const base = 1;
        const techTreeBonus = this.activeModifiers.moneyMultiplier;
        return base + techTreeBonus;
    }

    get effectiveLocMultiplier() {
        // Base + tech tree modifiers (includes prestige path bonuses via tech tree nodes)
        const base = 1;
        const techTreeBonus = this.activeModifiers.locMultiplier;
        return base + techTreeBonus;
    }

    get effectiveCredMultiplier() {
        // Base + tech tree modifiers (includes prestige path bonuses via tech tree nodes)
        const base = 1;
        const techTreeBonus = this.activeModifiers.credMultiplier;
        return base + techTreeBonus;
    }

    // ========================================
    // EFFECTIVE STAT Getters (All Modifiers Applied)
    // Formula: (Base + Flat) * (1 + Sum(Multipliers))
    // ========================================

    get effectiveClickPower() {
        // LoC/click: (base + flat) × loc multiplier
        const base = this.baseClickPower;
        const flatBonus = base * this.activeModifiers.locPerClickFlat;
        // effectiveLocMultiplier already includes (1 + locMultiplier), so no extra multiplier needed
        return Math.floor((base + flatBonus) * this.effectiveLocMultiplier);
    }

    get effectivePassiveLocRate() {
        // LoC/sec: (base + flat) × loc multiplier
        const base = this.basePassiveLocRate;
        const flatBonus = base * this.activeModifiers.passiveLocRateFlat;
        // effectiveLocMultiplier already includes (1 + locMultiplier), so no extra multiplier needed
        return (base + flatBonus) * this.effectiveLocMultiplier;
    }

    get effectivePassiveIncome() {
        // $/sec: base × tech debt penalty × prestige cash multiplier
        return this.basePassiveIncome * this.effectiveDebtPenaltyFactor * this.effectiveCashMultiplier;
    }
    
    // Helper methods for project rewards with ALL modifiers
    getEffectiveProjectReward(baseReward: number): number {
        return baseReward * this.effectiveDebtPenaltyFactor * this.effectiveCashMultiplier;
    }
    
    getEffectiveProjectCred(baseCred: number): number {
        return Math.floor(baseCred * this.effectiveDebtPenaltyFactor * this.effectiveCredMultiplier);
    }

    get unlockedProjects() {
        return getUnlockedProjects(this.gameState.resources.cred, this.effectiveCredThresholdReduction);
    }

    get maxUpgradeLevel() {
        return getMaxUpgradeLevel(this.gameState.resources.cred, this.effectiveCredThresholdReduction);
    }
    
    // ========================================
    // DEBT PENALTY FACTOR with Code Zen/Legacy Whisperer
    // ========================================
    
    get effectiveDebtPenaltyFactor() {
        const mods = this.activeModifiers;
        const basePenalty = Math.pow(1 - this.gameState.techDebt, 2);
        
        // PRIORITY 1: Code Zen
        // Inverts the CURRENT penalty - High Debt = High Bonus
        // If Debt is 0.5 → basePenalty is 0.25 → Result is 4.0x multiplier
        if (mods.unlockCodeZen) {
            // Clamp basePenalty to avoid division by zero (if debt is 1.0)
            const safePenalty = Math.max(0.01, basePenalty);
            return 1.0 / safePenalty;
        }

        // PRIORITY 2: Legacy Whisperer
        // Prevents all tech debt penalty (full income at any debt)
        if (mods.unlockLegacyWhisperer) {
            return 1.0;
        }

        // STANDARD: Apply debtPenaltyReduction to mitigate the penalty
        const mitigation = mods.debtPenaltyReduction;
        return Math.max(0.1, basePenalty + (1 - basePenalty) * mitigation);
    }

    // ========================================
    // OTHER DERIVED VALUES
    // ========================================

    get effectiveDebtAccumulationPerClick() {
        const base = TECH_DEBT.BASE_ACCUMULATION + (this.gameState.projectsShipped * TECH_DEBT.PER_PROJECT);
        const reduction = this.activeModifiers.debtAccumulationReduction;
        return base * (1 - Math.min(reduction, 0.95)); // Cap at 95% reduction
    }

    get effectiveDebtAccumulationPerSecond() {
        const base = TECH_DEBT.BASE_ACCUMULATION * TECH_DEBT.DELEGATION_DEBT_RATE;
        const reduction = this.activeModifiers.debtAccumulationReduction;
        return base * (1 - Math.min(reduction, 0.95));
    }

    get effectiveDebtClearingEfficiency() {
        return this.activeModifiers.debtClearingEfficiency;
    }

    get effectiveCredThresholdReduction() {
        return this.activeModifiers.credThresholdReduction;
    }

    get effectiveStartingCashWithTechTree() {
        // Tech tree modifiers only (prestige path starting cash is applied via tech tree nodes)
        const techTreeBonus = this.activeModifiers.startingCashFlat;
        return techTreeBonus;
    }

    get effectivePrestigePointMultiplier() {
        const base = 1;
        const techTreeBonus = this.activeModifiers.prestigePointMultiplier;
        return base + techTreeBonus;
    }

    get debtPercentage() {
        return (this.gameState.techDebt * 100).toFixed(1) + '%';
    }
    
    // Check if debt is in warning zone (>10%)
    get isDebtWarning() {
        return this.gameState.techDebt > TECH_DEBT.WARNING_THRESHOLD;
    }
    
    // Phase 2: Find cheapest purchasable upgrade
    get cheapestUpgrade() {
        let cheapest: { type: 'vibeCode' | 'delegation'; level: number; cost: number } | null = null;
        let minCost = Infinity;
        
        for (const type of ['vibeCode', 'delegation'] as const) {
            for (const upgrade of UPGRADES[type]) {
                if (upgrade.level <= this.maxUpgradeLevel) {
                    const currentCount = this.gameState.upgrades[type][upgrade.level] || 0;
                    const cost = getUpgradeCost(upgrade, currentCount);
                    if (cost < minCost) {
                        minCost = cost;
                        cheapest = { type, level: upgrade.level, cost };
                    }
                }
            }
        }
        
        return cheapest;
    }
    
    // Phase 2: Calculate upgrade progress percentage
    get upgradeProgress() {
        if (!this.cheapestUpgrade) return 0;
        return Math.min((this.gameState.resources.loc / this.cheapestUpgrade.cost) * 100, 100);
    }
    
    // Phase 3: Prestige System - Total upgrades available (vibeCode 1-10 + delegation 1-10 = 20 total)
    get totalUpgradesAvailable() {
        return UPGRADES.vibeCode.length + UPGRADES.delegation.length;
    }
    
    // Count total upgrades owned
    get totalUpgradesOwned() {
        let owned = 0;
        for (const level in this.gameState.upgrades.vibeCode) {
            owned += this.gameState.upgrades.vibeCode[level];
        }
        for (const level in this.gameState.upgrades.delegation) {
            owned += this.gameState.upgrades.delegation[level];
        }
        return owned;
    }
    
    // Percentage of upgrades owned (0-1)
    get upgradePercentage() {
        return this.totalUpgradesOwned / this.totalUpgradesAvailable;
    }
    
    // Is prestige available at 70% threshold?
    get isPrestigeAvailable() {
        return this.upgradePercentage >= PRESTIGE.THRESHOLD_PERCENT;
    }
    
    // Calculate prestige points to earn
    get prestigePointsToEarn() {
        // Formula: floor(log10(total cash + 1))
        const cash = this.gameState.prestige?.totalCashEarnedThisRun ?? this.gameState.resources.money;
        const rawPoints = Math.floor(Math.log10(cash + 1));
        const basePoints = Math.max(rawPoints, PRESTIGE.MIN_POINTS);
        
        // Apply tech tree multiplier
        return Math.floor(basePoints * this.effectivePrestigePointMultiplier);
    }
    
    // Track total cash earned this run
    get totalCashEarnedThisRun() {
        return this.gameState.prestige?.totalCashEarnedThisRun ?? this.gameState.resources.money;
    }
    
    // Get formatted run duration
    get runDuration() {
        const startTime = this.gameState.prestige?.runStartTime ?? Date.now();
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }
    
    // Generate prestige summary
    get prestigeSummary(): PrestigeSummary {
        return {
            pointsEarned: this.prestigePointsToEarn,
            runDuration: this.runDuration,
            cashEarned: this.totalCashEarnedThisRun,
            projectsShipped: this.gameState.projectsShipped,
            upgradesOwned: this.totalUpgradesOwned
        };
    }
    
    // ========================================
    // TECH TREE Getters
    // ========================================

    // Get total prestige points available
    get totalPrestigePoints() {
        return this.gameState.prestige?.prestigePoints ?? 0;
    }

    // Get purchased nodes for a specific tree
    getPurchasedNodes(path: TechTreePath): number[] {
        return this.gameState.prestige?.techTrees[path] ?? [];
    }

    // Check if a node can be purchased (previous node must be purchased, have enough points)
    canPurchaseNode(path: TechTreePath, nodeIndex: number): boolean {
        const tree = TECH_TREES[path];
        const node = tree.nodes[nodeIndex];
        if (!node) return false;

        // Must have enough prestige points
        if (this.totalPrestigePoints < node.cost) return false;

        // Must have purchased previous node (or be the first node)
        const purchased = this.getPurchasedNodes(path);
        if (nodeIndex > 0 && !purchased.includes(nodeIndex - 1)) return false;

        // Must not already own this node
        if (purchased.includes(nodeIndex)) return false;

        return true;
    }

    // Get the next available node index for a tree (or -1 if all purchased)
    getNextNodeIndex(path: TechTreePath): number {
        const purchased = this.getPurchasedNodes(path);
        const tree = TECH_TREES[path];
        for (let i = 0; i < tree.nodes.length; i++) {
            if (!purchased.includes(i)) return i;
        }
        return -1; // All nodes purchased
    }

    // Check if vertical integration is unlocked (buyout tree node 10, index 9)
    get hasVerticalIntegration() {
        return this.getPurchasedNodes('buyout').includes(9);
    }

    // Purchase a tech tree node
    purchaseTechTreeNode(path: TechTreePath, nodeIndex: number): boolean {
        if (!this.canPurchaseNode(path, nodeIndex)) {
            this.showNotification('Cannot purchase this node!');
            return false;
        }

        const tree = TECH_TREES[path];
        const node = tree.nodes[nodeIndex];

        // Deduct prestige points
        if (this.gameState.prestige) {
            this.gameState.prestige.prestigePoints -= node.cost;
        }

        // Add to purchased nodes - modifiers are now calculated dynamically
        if (this.gameState.prestige) {
            this.gameState.prestige.techTrees[path].push(nodeIndex);
        }

        // Starting cash is applied immediately
        const startingCashBonus = node.modifiers.startingCashFlat;
        if (startingCashBonus && startingCashBonus > 0) {
            this.gameState.resources.money += startingCashBonus;
        }

        this.showNotification(`Tech tree node unlocked: ${node.name}`);
        return true;
    }

    // ========================================
    // ACTIONS
    // ========================================

    // Phase 1: Accumulate tech debt from clicks
    accumulateDebtFromClick() {
        this.gameState.techDebt = Math.min(
            this.gameState.techDebt + this.effectiveDebtAccumulationPerClick,
            TECH_DEBT.MAX_DEBT
        );
    }

    // Phase 1: Accumulate tech debt from passive generation
    accumulateDebtFromPassive() {
        this.gameState.techDebt = Math.min(
            this.gameState.techDebt + this.effectiveDebtAccumulationPerSecond,
            TECH_DEBT.MAX_DEBT
        );
    }

    handlePromptClick(event: MouseEvent) {
        const locGained = this.effectiveClickPower;
        this.gameState.resources.loc += locGained;
        this.gameState.totalClicks++;
        
        // Accumulate tech debt from click
        this.accumulateDebtFromClick();
        
        this.addFloatText(event.clientX, event.clientY, `+${formatNumber(locGained)} LoC`);
        this.currentPrompt = PROMPT_MESSAGES[Math.floor(Math.random() * PROMPT_MESSAGES.length)];
    }

    shipProject(type: 'standard' | 'saas' | 'openSource', projectId: string) {
        const projectList = PROJECTS[type];
        const project = projectList.find(p => p.id === projectId);
        
        if (!project) return;
        
        const currentCount = this.gameState.projects[type][projectId] || 0;
        const scaledLocCost = getProjectLocCost(project, currentCount);
        
        if (this.gameState.resources.loc < scaledLocCost) {
            this.showNotification('Not enough LoC!');
            return;
        }
        
        this.gameState.resources.loc -= scaledLocCost;
        
        const effectiveMoneyReward = this.getEffectiveProjectReward(project.reward);
        const effectiveCredReward = this.getEffectiveProjectCred(project.cred);
        
        this.gameState.resources.money += effectiveMoneyReward;
        this.gameState.resources.cred += effectiveCredReward;
        this.trackCashEarned(effectiveMoneyReward);
        
        this.gameState.projects[type][projectId] = currentCount + 1;
        
        // Phase 1: Track total projects shipped for debt calculation
        this.gameState.projectsShipped++;
        
        const newCount = this.gameState.projects[type][projectId];
        let rewardText = `${formatNumber(effectiveMoneyReward)}`;
        if (effectiveCredReward > 0) {
            rewardText += ` + ${effectiveCredReward} Cred`;
        }
        if ('recurring' in project && project.recurring) {
            rewardText += ` (recurring)`;
        }
        this.showNotification(`Shipped ${project.name}! (${newCount} total) +${rewardText}`);
    }

    buyUpgrade(type: 'vibeCode' | 'delegation', level: number) {
        const upgradeList = UPGRADES[type];
        const upgrade = upgradeList.find(u => u.level === level);

        if (!upgrade) return;

        const currentCount = this.gameState.upgrades[type][level] || 0;
        const currentCost = getUpgradeCost(upgrade, currentCount);

        if (this.gameState.resources.money < currentCost) {
            this.showNotification('Not enough money!');
            return;
        }

        if (level > this.maxUpgradeLevel) {
            this.showNotification('Upgrade locked! Need more Cred.');
            return;
        }

        this.gameState.resources.money -= currentCost;
        this.gameState.upgrades[type][level] = currentCount + 1;

        this.showNotification(`Upgrade purchased! ${upgrade.desc}`);
    }

    // Debug mode: Grant resources for testing
    grantDebugResources() {
        this.gameState.resources.cred += 1000;
        this.gameState.resources.money += 1000000000;
        this.gameState.resources.loc += 1000000;
        
        if (this.gameState.prestige) {
            this.gameState.prestige.prestigePoints += 500;
        }

        console.log('[DEBUG] Resources granted: +1000 Cred, +$1000M, +1M LoC, +500 prestige points');
        this.showNotification('DEBUG: +1000 Cred, +$1000M, +1M LoC, +500 PP');
    }
    
    // Phase 1: Debt Reduction with scaling costs based on projects shipped
    reduceDebt(amount: number, paymentType: 'loc' | 'cash') {
        if (amount <= 0 || amount > this.gameState.techDebt) {
            this.showNotification('Invalid debt reduction amount!');
            return false;
        }
        
        const reductionUnits = amount / 0.01;
        const locCostPerUnit = TECH_DEBT.REDUCTION_BASE_LOC_COST + 
            (this.gameState.projectsShipped * TECH_DEBT.REDUCTION_LOC_MULTIPLIER);
        const cashCostPerUnit = TECH_DEBT.REDUCTION_BASE_CASH_COST + 
            (this.gameState.projectsShipped * TECH_DEBT.REDUCTION_CASH_MULTIPLIER);
        
        const locCost = Math.floor(reductionUnits * locCostPerUnit);
        const cashCost = Math.floor(reductionUnits * cashCostPerUnit);
        
        if (paymentType === 'loc') {
            if (this.gameState.resources.loc < locCost) {
                this.showNotification('Not enough LoC!');
                return false;
            }
            this.gameState.resources.loc -= locCost;
        } else {
            if (this.gameState.resources.money < cashCost) {
                this.showNotification('Not enough cash!');
                return false;
            }
            this.gameState.resources.money -= cashCost;
        }
        
        // Apply debt clearing efficiency modifier
        const effectiveAmount = amount * this.effectiveDebtClearingEfficiency;
        this.gameState.techDebt = Math.max(0, this.gameState.techDebt - effectiveAmount);
        
        this.showNotification(`Reduced tech debt by ${(effectiveAmount * 100).toFixed(1)}%`);
        return true;
    }
    
    // Phase 1: Calculate offline gains
    calculateOfflineGains(): OfflineGains {
        const now = Date.now();
        const lastSave = this.gameState.lastSaveTime;
        const timeDiff = now - lastSave;
        
        if (timeDiff < 10000) {
            return { loc: 0, cash: 0, hoursOffline: 0 };
        }
        
        const hoursOffline = timeDiff / (1000 * 60 * 60);
        
        // Offline rate is 10% of normal passive rates
        const offlineLocRate = this.basePassiveLocRate * TECH_DEBT.OFFLINE_RATE;
        const offlineCashRate = this.effectivePassiveIncome * TECH_DEBT.OFFLINE_RATE;
        
        const locGained = Math.floor(offlineLocRate * hoursOffline * 3600);
        const cashGained = Math.floor(offlineCashRate * hoursOffline * 3600);
        
        return { loc: locGained, cash: cashGained, hoursOffline };
    }
    
    // Phase 1: Apply offline gains
    applyOfflineGains(gains: OfflineGains) {
        if (gains.loc > 0 || gains.cash > 0) {
            this.gameState.resources.loc += gains.loc;
            this.gameState.resources.money += gains.cash;
            this.offlineGains = gains;
            this.showOfflineModal = true;
        }
    }
    
    // Phase 1: Dismiss offline modal
    dismissOfflineModal() {
        this.showOfflineModal = false;
    }

    saveGame() {
        this.gameState.lastSaveTime = Date.now();
        const saveData = JSON.stringify($state.snapshot(this.gameState));
        localStorage.setItem('vibeCodeClicker', saveData);
        this.showNotification('Game saved!');
    }

    loadGame() {
        const savedData = localStorage.getItem('vibeCodeClicker');
        console.log('Loading game, found data:', !!savedData);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Create a fresh default state and merge with saved data
                this.gameState = { ...defaultState, ...parsed };
                // Ensure nested objects are properly merged
                this.gameState.resources = { ...defaultState.resources, ...parsed.resources };
                this.gameState.upgrades = { ...defaultState.upgrades, ...parsed.upgrades };
                this.gameState.projects = { ...defaultState.projects, ...parsed.projects };
                
                // Handle legacy save data with bonuses
                if (this.gameState.prestige && parsed.prestige) {
                    // Preserve tech trees from saved data
                    if (parsed.prestige.techTrees) {
                        this.gameState.prestige.techTrees = parsed.prestige.techTrees;
                    }
                    // Legacy bonuses are no longer used - they're calculated from techTrees
                }
                
                if (!this.gameState.activeTab) {
                    this.gameState.activeTab = { projects: 'standard', upgrades: 'vibeCode' };
                }
                
                // Phase 2: Reset hint tracking on load
                this.debtLowHintShown = false;
                this.previousDebtState = this.gameState.techDebt < 0.1 ? 'low' : 'high';
                
                // Phase 1: Calculate offline gains
                const gains = this.calculateOfflineGains();
                if (gains.loc > 0 || gains.cash > 0) {
                    this.applyOfflineGains(gains);
                }
                
                console.log('Game loaded successfully');
            } catch (e) {
                console.error('Failed to load save:', e);
            }
        }
    }

    resetGame() {
        if (confirm('Are you sure you want to reset the game? All progress will be lost!')) {
            localStorage.removeItem('vibeCodeClicker');
            this.gameState = { ...defaultState };
            this.currentPrompt = PROMPT_MESSAGES[0];
            this.floatTexts = [];
            this.notifications = [];
            this.hints = [];
            this.debtLowHintShown = false;
            this.previousDebtState = 'low';
            this.notificationQueue = []; // Clear notification queue on reset
            this.showNotification('Game reset!');
        }
    }

    switchTab(panel: 'projects' | 'upgrades', tabName: string) {
        if (panel === 'projects') {
            this.gameState.activeTab.projects = tabName as 'standard' | 'saas' | 'openSource';
        } else {
            this.gameState.activeTab.upgrades = tabName as 'vibeCode' | 'delegation';
        }
    }

    startGameLoop() {
        $effect(() => {
            const interval = setInterval(() => {
                if (this.effectivePassiveLocRate > 0) {
                    this.gameState.resources.loc += this.effectivePassiveLocRate;
                    this.accumulateDebtFromPassive();
                }
                
                if (this.basePassiveIncome > 0) {
                    this.gameState.resources.money += this.effectivePassiveIncome;
                    this.trackCashEarned(this.effectivePassiveIncome);
                }
                
                // Phase 4: Vertical Integration - Auto-purchase cheapest upgrade if enabled
                if (this.hasVerticalIntegration && this.cheapestUpgrade) {
                    const upgrade = this.cheapestUpgrade;
                    if (this.gameState.resources.money >= upgrade.cost) {
                        this.buyUpgrade(upgrade.type, upgrade.level);
                    }
                }
                
                // Phase 2: Check for hints every game tick (with rate limiting)
                if (Math.random() < 0.1) {
                    this.checkAndAddHints();
                }
            }, 1000);
            
            return () => clearInterval(interval);
        });
    }

    startAutoSave() {
        $effect(() => {
            const interval = setInterval(() => {
                this.saveGame();
            }, 30000);
            
            return () => clearInterval(interval);
        });
    }

    private addFloatText(x: number, y: number, text: string) {
        const id = this.floatTextId++;
        this.floatTexts.push({ id, text, x, y });
        
        setTimeout(() => {
            this.floatTexts = this.floatTexts.filter(ft => ft.id !== id);
        }, 1000);
    }

    private showNotification(message: string, type: 'success' | 'warning' | 'info' = 'info') {
        // Route notification based on content
        const lowerMessage = message.toLowerCase();

        // Determine category based on content
        const category = lowerMessage.includes('saved') ||
                         lowerMessage.includes('prestige') ||
                         lowerMessage.includes('debt') ||
                         lowerMessage.includes('reset') ? 'footer' : 'title';

        // Add to unified notification queue
        const notification: QueuedNotification = {
            id: this.notificationId++,
            message,
            type,
            category,
            timestamp: Date.now()
        };

        this.notificationQueue.push(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            this.notificationQueue = this.notificationQueue.filter(n => n.id !== notification.id);
        }, 3000);

        // Keep queue trimmed to last 5 notifications
        if (this.notificationQueue.length > 5) {
            this.notificationQueue = this.notificationQueue.slice(-5);
        }
    }
    
    // Phase 2: Hint system - Check conditions and add hints
    private checkAndAddHints() {
        const now = Date.now();

        const isDebtLow = this.gameState.techDebt < 0.1;
        const currentState = isDebtLow ? 'low' : 'high';

        if (this.previousDebtState === 'high' && currentState === 'low') {
            this.debtLowHintShown = false;
        }
        this.previousDebtState = currentState;

        const conditions: { check: () => boolean; condition: Hint['condition']; message: string; useNotification?: boolean; cooldownMinutes?: number }[] = [
            {
                check: () => this.gameState.techDebt > 0.4,
                condition: 'debtHigh',
                message: 'Tech debt high - consider clearing!'
            },
            {
                check: () => isDebtLow && !this.debtLowHintShown,
                condition: 'debtLow',
                message: 'Debt low - good time to save LoC',
                useNotification: true,
                cooldownMinutes: 5
            },
            {
                // Only show if prestige is NOT yet available (button will show when available)
                check: () => !this.isPrestigeAvailable && this.upgradePercentage >= PRESTIGE.THRESHOLD_PERCENT - 0.1,
                condition: 'prestigeSoon',
                message: 'Prestige available soon!',
                useNotification: true,
                cooldownMinutes: 10
            }
        ];

        for (const { check, condition, message, useNotification, cooldownMinutes = 1 } of conditions) {
            if (check() && !this.hints.some(h => h.condition === condition)) {
                // Check if we've shown a similar notification recently (throttle)
                const recentNotification = this.notificationQueue.find(
                    n => n.message.toLowerCase().includes(message.toLowerCase().split(' ').slice(0, 2).join(' '))
                );
                if (recentNotification) continue;

                // Route debt low and prestige hints through notification queue
                if (useNotification) {
                    this.showNotification(message, 'success');
                } else {
                    this.addHint(message, condition);
                }
                if (condition === 'debtLow') {
                    this.debtLowHintShown = true;
                }
            }
        }
    }
    
    private addHint(message: string, condition: Hint['condition']) {
        const id = this.hintId++;
        this.hints.push({ id, message, condition, timestamp: Date.now() });
        
        setTimeout(() => {
            this.dismissHint(id);
        }, 10000);
    }
    
    dismissHint(id: number) {
        this.hints = this.hints.filter(h => h.id !== id);
        const cooldownUntil = Date.now() + 60000;
        this.hintCooldowns = new Set([...this.hintCooldowns, cooldownUntil]);
        
        const now = Date.now();
        this.hintCooldowns = new Set([...this.hintCooldowns].filter(c => c > now));
    }
    
    // Phase 3: Prestige system methods
    openPrestigeConfirmation() {
        this.pendingPrestigePoints = this.prestigePointsToEarn;
        this.showPrestigeSummaryModal = true;
    }
    
    closePrestigeConfirmation() {
        this.showPrestigeSummaryModal = false;
        this.pendingPrestigePoints = 0;
    }
    
    selectPrestigePath(path: PrestigePath) {
        this.selectedPrestigePath = path;
        this.showPrestigeSummaryModal = false;
        this.showPrestigeModal = true;
    }
    
    closePrestigePathModal() {
        this.showPrestigeModal = false;
        this.selectedPrestigePath = null;
    }
    
    performPrestige(path: PrestigePath) {
        const pointsToEarn = this.pendingPrestigePoints;

        // Calculate path-specific bonuses (these are applied via tech tree nodes in future)
        // For now, we calculate starting cash and debt relief immediately
        const startingCash = (path === 'buyout')
            ? pointsToEarn * PRESTIGE.STARTING_CASH_PER_POINT
            : 0;

        // Learning path bonuses (tech debt mitigation)
        const debtRelief = (path === 'learning')
            ? pointsToEarn * PRESTIGE.DEBT_RELIEF_PER_POINT
            : 0;

        // Preserve existing tech trees
        const existingTechTrees = this.gameState.prestige?.techTrees ?? {
            buyout: [],
            nirvana: [],
            linus: [],
            learning: []
        };

        // Reset game state (preserve prestige data)
        this.gameState.resources = { money: 0, loc: 0, cred: 0 };
        this.gameState.upgrades = { vibeCode: {}, delegation: {} };
        this.gameState.projects = { standard: {}, saas: {}, openSource: {} };
        this.gameState.totalClicks = 0;
        this.gameState.techDebt = Math.max(0, this.gameState.techDebt - debtRelief); // Apply debt relief
        this.gameState.projectsShipped = 0;

        // Apply starting cash bonus (from prestige path + accumulated tech tree bonuses)
        this.gameState.resources.money = startingCash + this.activeModifiers.startingCashFlat;

        // Update prestige state
        if (!this.gameState.prestige) {
            this.gameState.prestige = {
                prestigePoints: 0,
                totalPrestiges: 0,
                pathHistory: [],
                runStartTime: Date.now(),
                totalCashEarnedThisRun: 0,
                techTrees: existingTechTrees
            };
        }

        // Set prestige points and path history
        this.gameState.prestige.prestigePoints += pointsToEarn;
        this.gameState.prestige.totalPrestiges += 1;
        this.gameState.prestige.pathHistory.push(path);
        this.gameState.prestige.runStartTime = Date.now();
        this.gameState.prestige.totalCashEarnedThisRun = 0;

        // Preserve tech trees
        this.gameState.prestige.techTrees = existingTechTrees;

        // Close modals and show notification
        this.showPrestigeModal = false;
        this.selectedPrestigePath = null;
        this.pendingPrestigePoints = 0;

        // Clear notification queue on prestige so hints can appear in new run
        this.notificationQueue = [];
        this.showNotification(`PRESTIGE! +${pointsToEarn} prestige points! New run begins...`);
    }
    
    // Track cash earned this run for prestige calculation
    trackCashEarned(amount: number) {
        if (this.gameState.prestige) {
            this.gameState.prestige.totalCashEarnedThisRun += amount;
        }
    }
    
    // Hard reset that clears prestige data too
    hardResetGame() {
        if (confirm('Are you sure? This will wipe ALL progress including prestige!')) {
            localStorage.removeItem('vibeCodeClicker');
            this.gameState = { ...defaultState };
            this.currentPrompt = PROMPT_MESSAGES[0];
            this.floatTexts = [];
            this.notifications = [];
            this.hints = [];
            this.debtLowHintShown = false;
            this.previousDebtState = 'low';
            this.notificationQueue = []; // Clear notification queue on hard reset
            this.showNotification('Full reset complete!');
        }
    }

    // Tech Tree Modal methods
    openTechTree() {
        this.showTechTreeModal = true;
    }

    closeTechTree() {
        this.showTechTreeModal = false;
    }

    setActiveTechTreeTab(tab: TechTreePath) {
        this.activeTechTreeTab = tab;
    }

    init() {
        this.loadGame();
        this.startGameLoop();
        this.startAutoSave();
        console.log('Idle Vibe Code Quest v0.4 initialized!');
    }
}

// Export a singleton instance
export const store = new GameStore();

// Helper functions
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
}

export function getProjectLocCost(project: Project, count: number): number {
    const costMultiplier = Math.pow(1.15, count);
    return Math.floor(project.locCost * costMultiplier);
}

export function formatMoney(amount: number): string {
    if (amount >= 1000000000) {
        return (amount / 1000000000).toFixed(1) + 'B';
    } else if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 10000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toFixed(2);
}

// Idle Vibe Code Quest - Game Store (Svelte 5 $state)

import { PROJECTS, UPGRADES, PROMPT_MESSAGES, TECH_DEBT, PRESTIGE, TECH_TREES, TECH_TREE_COSTS, type Upgrade, type Project } from './constants';
import type { GameState, FloatText, Notification, QueuedNotification, OfflineGains, Hint, PrestigePath, PrestigeSummary, TechTreeNode, TechTreePath, SystemModifiers, RandomEventState } from './types';
import type { ActiveEventState, ActiveBuff, RandomEventConfig } from './event-types';
import { EVENT_REGISTRY, RANDOM_EVENT_CONFIG } from './event-registry';
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
    // Debt Mechanics (Reworked v0.5)
    techTreeDebtMultiplier: 0,
    prestigeDebtModifier: 0,
    unlockCodeZen: false,
    unlockLegacyWhisperer: false
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
    
    // Theme system
    currentTheme = $state<'terminal' | 'ide' | 'vibe-ai'>('terminal');

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

    // v0.5: Random Event System state
    randomEventState = $state<RandomEventState>({
        active: false,
        eventId: null,
        timer: 0,
        cooldown: 0
    });
    showRandomEventModal = $state(false);
    activeRandomEvent = $state<RandomEventConfig | null>(null);
    
    // v0.6: Enhanced Random Event System
    activeEventState = $state<ActiveEventState | null>(null);
    activeBuffs = $state<ActiveBuff[]>([]);

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
    // TECH DEBT Getters (Reworked v0.5)
    // ========================================
    
    // Effective tech tree multiplier from Learning path nodes
    get effectiveTechTreeMultiplier() {
        return this.activeModifiers.techTreeDebtMultiplier;
    }
    
    // Effective prestige modifier from prestige points
    get effectivePrestigeModifier() {
        const points = this.gameState.prestige?.prestigePoints ?? 0;
        return Math.min(points * TECH_DEBT.PRESTIGE_MODIFIER_PER_POINT, 1.0);
    }
    
    // Debt accumulation per LoC generated (applies to both active and passive)
    get effectiveDebtAccumulationPerLoc() {
        return TECH_DEBT.BASE_ACCUMULATION * (1 - this.effectivePrestigeModifier);
    }
    
    // Get current debt level
    get techDebtLevel() {
        return this.gameState.techDebt;
    }
    
    // Get debt as percentage for display (techDebt / 50 = percentage, since MAX_LEVEL=5000)
    get debtPercentageDisplay() {
        return (this.gameState.techDebt / 100).toFixed(2) + '%';
    }
    
    // Check if debt is in warning zone (>= 20% / 1000)
    get isDebtWarning() {
        return this.gameState.techDebt >= TECH_DEBT.WARNING_THRESHOLD;
    }
    
    // Check if debt is in danger zone (>= 80% / 4000)
    get isDebtDanger() {
        return this.gameState.techDebt >= TECH_DEBT.DANGER_THRESHOLD;
    }

    // ========================================
    // PRESTIGE MULTIPLIER Getters
    // ========================================

    get effectiveCashMultiplier() {
        // Base + tech tree modifiers + event buffs
        const base = 1;
        const techTreeBonus = this.activeModifiers.moneyMultiplier;
        const buffMultiplier = this.eventBuffMultipliers.cashMultiplier;
        return (base + techTreeBonus) * buffMultiplier;
    }

    get effectiveLocMultiplier() {
        // Base + tech tree modifiers + event buffs
        const base = 1;
        const techTreeBonus = this.activeModifiers.locMultiplier;
        const buffMultiplier = this.eventBuffMultipliers.locMultiplier;
        return (base + techTreeBonus) * buffMultiplier;
    }

    get effectiveCredMultiplier() {
        // Base + tech tree modifiers + event buffs
        const base = 1;
        const techTreeBonus = this.activeModifiers.credMultiplier;
        const buffMultiplier = this.eventBuffMultipliers.credMultiplier;
        return (base + techTreeBonus) * buffMultiplier;
    }

    // ========================================
    // EFFECTIVE STAT Getters (All Modifiers Applied)
    // Formula: (Base + Flat) * (1 + Sum(Multipliers))
    // ========================================

    get effectiveClickPower() {
        // LoC/click: (base + flat from tech tree + flat from buffs) × loc multiplier
        const base = this.baseClickPower;
        const techTreeFlat = base * this.activeModifiers.locPerClickFlat;
        const buffFlat = this.eventBuffMultipliers.locPerClickFlat;
        // effectiveLocMultiplier already includes (1 + locMultiplier), so no extra multiplier needed
        return Math.floor((base + techTreeFlat + buffFlat) * this.effectiveLocMultiplier);
    }

    get effectivePassiveLocRate() {
        // LoC/sec: (base + flat from tech tree + flat from buffs) × loc multiplier
        const base = this.basePassiveLocRate;
        const techTreeFlat = base * this.activeModifiers.passiveLocRateFlat;
        const buffFlat = this.eventBuffMultipliers.passiveLocRateFlat;
        // effectiveLocMultiplier already includes (1 + locMultiplier), so no extra multiplier needed
        return (base + techTreeFlat + buffFlat) * this.effectiveLocMultiplier;
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
    // DEBT PENALTY FACTOR (Reworked v0.5)
    // ========================================
    
    get effectiveDebtPenaltyFactor() {
        const mods = this.activeModifiers;
        const debtRatio = this.gameState.techDebt / TECH_DEBT.MAX_LEVEL;
        
        // PRIORITY 1: Code Zen
        // Inverts the penalty - High Debt = High Bonus
        // Formula: 1 + [(debtRatio / 2) * (1 - treeMultiplier)]
        if (mods.unlockCodeZen) {
            const treeMod = 1 - (mods.techTreeDebtMultiplier ?? 0);
            return 1 + ((debtRatio / 2) * treeMod);
        }
        
        // STANDARD: Apply tree multiplier to reduce penalty
        // Formula: 1 - [(debtRatio / 2) * (1 - treeMultiplier)]
        // At MAX_LEVEL (5000) with no tree modifier: 1 - (0.5 * 1) = 0.5, capped at 0.5 as a defensive
        const treeMod = 1 - (mods.techTreeDebtMultiplier ?? 0);
        return Math.max(0.5, (1 - ((debtRatio / 2) * treeMod)));
    }

    // ========================================
    // OTHER DERIVED VALUES
    // ========================================

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

    // ========================================
    // EVENT BUFF MULTIPLIERS (v0.6)
    // ========================================
    
    /**
     * Get active buff multipliers from event rewards
     */
    get eventBuffMultipliers() {
        const now = Date.now();
        const activeBuffs = this.activeBuffs.filter(b => b.expiresAt > now);
        
        return {
            cashMultiplier: 1 + activeBuffs
                .filter(b => b.type === 'cashMultiplier')
                .reduce((sum, b) => sum + (b.multiplier * 0.5), 0), // 50% of base per buff
            locMultiplier: 1 + activeBuffs
                .filter(b => b.type === 'locMultiplier')
                .reduce((sum, b) => sum + (b.multiplier * 0.3), 0), // 30% of base per buff
            credMultiplier: 1 + activeBuffs
                .filter(b => b.type === 'credMultiplier')
                .reduce((sum, b) => sum + (b.multiplier * 0.5), 0), // 50% of base per buff
            locPerClickFlat: activeBuffs
                .filter(b => b.type === 'locPerClick')
                .reduce((sum, b) => sum + (b.multiplier * 2), 0), // +2 LoC per click per buff
            passiveLocRateFlat: activeBuffs
                .filter(b => b.type === 'passiveLocRate')
                .reduce((sum, b) => sum + (b.multiplier * 5), 0), // +5 LoC/sec per buff
            delegationMultiplier: 1 + activeBuffs
                .filter(b => b.type === 'delegationMultiplier')
                .reduce((sum, b) => sum + (b.multiplier * 0.4), 0) // 40% of base per buff
        };
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
    
    // Phase 3: Prestige System - Total upgrade points available (level sum × 2)
    // Sum of levels 1-10 for each upgrade type: (1+2+...+10) × 2 = 55 × 2 = 110
    get totalUpgradesAvailable() {
        const sum1to10 = (10 * 11) / 2; // 55
        return sum1to10 * 2; // 110 total (vibeCode + delegation)
    }
    
    // Calculate total upgrade points owned (weighted by level)
    // Each copy of an upgrade contributes its level number
    // Example: 5×L1 + 3×L2 vibeCode = (5×1) + (3×2) = 11 points
    get totalUpgradesOwned() {
        let owned = 0;
        for (const level in this.gameState.upgrades.vibeCode) {
            const count = this.gameState.upgrades.vibeCode[level];
            owned += parseInt(level) * count;
        }
        for (const level in this.gameState.upgrades.delegation) {
            const count = this.gameState.upgrades.delegation[level];
            owned += parseInt(level) * count;
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
    
    // Calculate prestige points to earn based on upgrade investment
    // Formula: floor(totalUpgradesOwned / (totalUpgradesAvailable × threshold))
    // Minimum of PRESTIGE.MIN_POINTS (1)
    get prestigePointsToEarn() {
        const thresholdValue = this.totalUpgradesAvailable * PRESTIGE.THRESHOLD_PERCENT;
        const rawPoints = Math.floor(this.totalUpgradesOwned / thresholdValue);
        return Math.max(rawPoints, PRESTIGE.MIN_POINTS);
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
            cashEarned: this.gameState.resources.money,
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

    // Accumulate tech debt from LoC generated (active or passive)
    accumulateDebt(locGenerated: number) {
        const debtToAdd = (locGenerated * this.effectiveDebtAccumulationPerLoc) * 0.1;
        this.gameState.techDebt = Math.min(
            this.gameState.techDebt + debtToAdd,
            TECH_DEBT.MAX_LEVEL
        );
    }

    handlePromptClick(event: MouseEvent) {
        const locGained = this.effectiveClickPower;
        this.gameState.resources.loc += locGained;
        this.gameState.totalClicks++;
        
        // Accumulate tech debt from click
        this.accumulateDebt(locGained);
        
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
    
    // Phase 1: Debt Reduction (Reworked v0.5)
    // LoC Cost: debt / 2
    // Cash Cost: calculated based on cheapest project's LoC value
    reduceDebt(amount: number, paymentType: 'loc' | 'cash') {
        if (amount <= 0 || amount > this.gameState.techDebt) {
            this.showNotification('Invalid debt reduction amount!');
            return false;
        }
        
        // LoC cost: debtAmount / 2
        const locCost = Math.floor(amount / 20);
        
        // Cash cost: LoC cost × (cheapest project LoC cost / reward)
        const cheapestProject = PROJECTS.standard[0]; // Todo App
        const locValue = cheapestProject.locCost / cheapestProject.reward;
        const cashCost = Math.floor(locCost * locValue);
        
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
        
        this.gameState.techDebt = Math.max(0, this.gameState.techDebt - amount);
        
        this.showNotification(`Reduced tech debt by ${(amount / 100).toFixed(2)}%`);
        return true;
    }
    
    // Phase 1: Calculate offline gains (simplified for v0.5)
    calculateOfflineGains(): OfflineGains {
        const now = Date.now();
        const lastSave = this.gameState.lastSaveTime;
        const timeDiff = now - lastSave;
        
        if (timeDiff < 10000) {
            return { loc: 0, cash: 0, hoursOffline: 0 };
        }
        
        const hoursOffline = timeDiff / (1000 * 60 * 60);
        
        // Offline: 10% of passive rates
        const offlineLocRate = this.basePassiveLocRate * 0.1;
        const offlineCashRate = this.basePassiveIncome * 0.1 * this.effectiveDebtPenaltyFactor;
        
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

    // Load game with migration support for tech debt scale change
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
                // Migration: convert old 0-0.5 scale to new 0-5000 scale
                if (typeof this.gameState.techDebt === 'number' && this.gameState.techDebt <= 0.5) {
                    this.gameState.techDebt = this.gameState.techDebt * 10000;
                }
                this.previousDebtState = this.gameState.techDebt < 1000 ? 'low' : 'high';
                
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
                    const locGenerated = this.effectivePassiveLocRate;
                    this.gameState.resources.loc += locGenerated;
                    this.accumulateDebt(locGenerated);
                }
                
                if (this.basePassiveIncome > 0) {
                    this.gameState.resources.money += this.effectivePassiveIncome;
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

                // v0.5: Random Event System - check every tick
                if (this.randomEventState.active) {
                    // Event is active - countdown the notification timer
                    this.randomEventState.timer--;
                    if (this.randomEventState.timer === 0) {
                        // Timer expired - treat as ignore, start cooldown
                        this.ignoreRandomEvent();
                    }
                } else if (this.randomEventState.cooldown > 0) {
                    // No event active, countdown cooldown
                    this.randomEventState.cooldown--;
                } else {
                    // No event, no cooldown - check for new event trigger
                    if (Math.floor(Math.random() * RANDOM_EVENT_CONFIG.TRIGGER_CHANCE) === 1) {
                        this.triggerRandomEvent();
                    }
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
    
    // Phase 2: Hint system - Check conditions and add hints (Reworked v0.5)
    private checkAndAddHints() {
        const now = Date.now();

        const isDebtLow = this.gameState.techDebt < 1000;
        const currentState = isDebtLow ? 'low' : 'high';

        if (this.previousDebtState === 'high' && currentState === 'low') {
            this.debtLowHintShown = false;
        }
        this.previousDebtState = currentState;

        const conditions: { check: () => boolean; condition: Hint['condition']; message: string; useNotification?: boolean; cooldownMinutes?: number }[] = [
            {
                check: () => this.gameState.techDebt >= TECH_DEBT.DANGER_THRESHOLD,
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

        // Calculate starting cash (buyout path)
        const startingCash = (path === 'buyout')
            ? pointsToEarn * PRESTIGE.STARTING_CASH_PER_POINT
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
        this.gameState.techDebt = 0; // Reset debt on prestige
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
                techTrees: existingTechTrees
            };
        }

        // Set prestige points and path history
        this.gameState.prestige.prestigePoints += pointsToEarn;
        this.gameState.prestige.totalPrestiges += 1;
        this.gameState.prestige.pathHistory.push(path);
        this.gameState.prestige.runStartTime = Date.now();

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

    // ========================================
    // v0.5: Random Event System Methods
    // ========================================

    /**
     * Trigger a random event - shows notification for 30 seconds
     */
    triggerRandomEvent() {
        // Get random event from registry
        const event = EVENT_REGISTRY.getRandomEvent();

        this.randomEventState = {
            active: true,
            eventId: event.id,
            timer: event.notificationDuration,
            cooldown: 0
        };
        this.activeRandomEvent = event;

        this.showNotification(`⚡ RANDOM EVENT: ${event.name}! Click to Engage or Ignore.`, 'warning');
    }

    /**
     * Ignore the current random event - starts cooldown
     */
    ignoreRandomEvent() {
        if (!this.randomEventState.active) return;

        this.randomEventState = {
            active: false,
            eventId: null,
            timer: 0,
            cooldown: RANDOM_EVENT_CONFIG.COOLDOWN_DURATION
        };
        this.activeRandomEvent = null;

        this.showNotification('Event ignored.', 'info');
    }

    /**
     * Engage with the current random event - opens modal, starts cooldown
     */
    engageRandomEvent() {
        if (!this.randomEventState.active || !this.activeRandomEvent) return;

        // Hide notification but keep event data for modal
        this.randomEventState = {
            active: false,
            eventId: this.randomEventState.eventId,
            timer: 0,
            cooldown: RANDOM_EVENT_CONFIG.COOLDOWN_DURATION
        };

        // Show the event modal
        this.showRandomEventModal = true;
    }

    /**
     * Complete the random event - grant rewards and close modal
     * @param score Player's score from the mini-game
     * @param maxScore Maximum possible score
     */
    completeRandomEvent(score: number = 0, maxScore: number = 0) {
        if (!this.activeRandomEvent) return;

        // Calculate performance percentage
        const performance = maxScore > 0 ? score / maxScore : 1.0;

        // Grant all rewards based on performance
        const event = this.activeRandomEvent;
        let totalCashReward = 0;
        let totalLocReward = 0;
        let totalCredReward = 0;
        let rewardMessage = '';

        for (const reward of event.rewards) {
            // Calculate actual reward amount based on scaling mode
            let amount = reward.baseAmount;
            
            switch (reward.scalingMode) {
                case 'performance':
                    amount = reward.baseAmount * performance;
                    break;
                case 'tiered':
                    // Tiered rewards: 90%+ = 2x, 70-89% = 1x, 50-69% = 0.5x, <50% = 0.25x
                    if (performance >= 0.9) amount = reward.baseAmount * 2;
                    else if (performance >= 0.7) amount = reward.baseAmount * 1;
                    else if (performance >= 0.5) amount = reward.baseAmount * 0.5;
                    else amount = reward.baseAmount * 0.25;
                    break;
                case 'flat':
                default:
                    // Flat amount, no scaling
                    break;
            }
            
            switch (reward.type) {
                case 'cash':
                    this.gameState.resources.money += Math.floor(amount);
                    totalCashReward += Math.floor(amount);
                    break;
                case 'loc':
                    this.gameState.resources.loc += Math.floor(amount);
                    totalLocReward += Math.floor(amount);
                    break;
                case 'cred':
                    this.gameState.resources.cred += Math.floor(amount);
                    totalCredReward += Math.floor(amount);
                    break;
                // Temporary buffs - apply with performance multiplier
                default:
                    this.addBuff(event.id, reward, performance);
                    break;
            }
        }

        // Build reward message
        const rewards: string[] = [];
        if (totalCashReward > 0) rewards.push(`$${totalCashReward.toLocaleString()}`);
        if (totalLocReward > 0) rewards.push(`${totalLocReward.toLocaleString()} LoC`);
        if (totalCredReward > 0) rewards.push(`${totalCredReward} Cred`);
        
        if (rewards.length > 0) {
            rewardMessage = rewards.join(', ');
        }

        // Performance indicator
        let performanceEmoji = '✅';
        if (performance >= 0.9) performanceEmoji = '🏆';
        else if (performance >= 0.7) performanceEmoji = '✨';
        else if (performance >= 0.5) performanceEmoji = '👍';
        else if (performance < 0.3) performanceEmoji = '💪';

        this.showNotification(
            rewardMessage 
                ? `${performanceEmoji} ${event.name}: ${rewardMessage} (${Math.round(performance * 100)}%)` 
                : `${performanceEmoji} Completed ${event.name}! (${Math.round(performance * 100)}%)`,
            'success'
        );

        // Close modal and clear event
        this.showRandomEventModal = false;
        this.activeRandomEvent = null;
        this.activeEventState = null;
        this.randomEventState = {
            active: false,
            eventId: null,
            timer: 0,
            cooldown: RANDOM_EVENT_CONFIG.COOLDOWN_DURATION
        };
    }

    /**
     * Close random event modal without completing
     */
    closeRandomEventModal() {
        this.showRandomEventModal = false;
        // Event was already ended by engageRandomEvent, cooldown is set
    }

    /**
     * Abandon an active event - cancel it without rewards
     */
    abandonRandomEvent() {
        this.activeEventState = null;
        this.showRandomEventModal = false;
        this.activeRandomEvent = null;
        this.randomEventState = {
            active: false,
            eventId: null,
            timer: 0,
            cooldown: RANDOM_EVENT_CONFIG.COOLDOWN_DURATION
        };
        this.showNotification('Event abandoned.', 'info');
    }

    // ========================================
    // v0.6: Buff System Methods
    // ========================================

    /**
     * Add a temporary buff from an event reward
     */
    addBuff(sourceEventId: string, reward: import('./event-types').EventReward, performanceMultiplier: number) {
        const duration = reward.duration || 300; // Default 5 minutes
        const expiresAt = Date.now() + (duration * 1000);
        
        const buff: ActiveBuff = {
            id: `buff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sourceEventId,
            type: reward.type,
            multiplier: performanceMultiplier,
            expiresAt,
            name: this.getBuffDisplayName(reward.type)
        };
        
        this.activeBuffs = [...this.activeBuffs, buff];
        
        // Set up automatic expiration
        setTimeout(() => {
            this.removeBuff(buff.id);
        }, duration * 1000);
    }

    /**
     * Remove a buff by ID
     */
    removeBuff(buffId: string) {
        this.activeBuffs = this.activeBuffs.filter(b => b.id !== buffId);
    }

    /**
     * Get active buffs that haven't expired
     */
    getActiveBuffs(): ActiveBuff[] {
        const now = Date.now();
        return this.activeBuffs.filter(b => b.expiresAt > now);
    }

    /**
     * Get display name for buff type
     */
    private getBuffDisplayName(type: import('./event-types').RewardType): string {
        const names: Record<import('./event-types').RewardType, string> = {
            'cash': 'Cash Bonus',
            'loc': 'LoC Bonus',
            'cred': 'Cred Bonus',
            'cashMultiplier': 'Cash Multiplier',
            'locMultiplier': 'LoC Multiplier',
            'credMultiplier': 'Cred Multiplier',
            'locPerClick': 'Click Power',
            'passiveLocRate': 'Passive Generation',
            'delegationMultiplier': 'Delegation Efficiency'
        };
        return names[type] || 'Unknown Buff';
    }

    // ========================================
    // v0.6: Debug Event Trigger
    // ========================================

    /**
     * Debug method to trigger a specific random event by ID
     */
    debugTriggerEvent(eventId: string): boolean {
        const event = EVENT_REGISTRY.getEvent(eventId);
        if (!event) {
            console.warn(`[DEBUG] Event '${eventId}' not found`);
            return false;
        }

        // Clear any existing event/cooldown
        this.randomEventState = {
            active: true,
            eventId: event.id,
            timer: event.notificationDuration,
            cooldown: 0
        };
        this.activeRandomEvent = event;

        this.showNotification(`⚡ DEBUG EVENT: ${event.name}!`, 'warning');
        return true;
    }

    /**
     * Get all available event IDs for debug selection
     */
    getDebugEventList(): { id: string; name: string; mechanic: string }[] {
        return EVENT_REGISTRY.getAllEvents().map(e => ({
            id: e.id,
            name: e.name,
            mechanic: e.mechanic
        }));
    }

    // Theme management
    setTheme(theme: 'terminal' | 'ide' | 'vibe-ai') {
        this.currentTheme = theme;
        this.applyTheme();
        this.saveTheme();
    }
    
    private applyTheme() {
        // Apply theme to document root for CSS to pick up
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
    
    private saveTheme() {
        localStorage.setItem('vibeCodeClicker_theme', this.currentTheme);
    }
    
    private loadTheme() {
        const savedTheme = localStorage.getItem('vibeCodeClicker_theme');
        if (savedTheme && ['terminal', 'ide', 'vibe-ai'].includes(savedTheme)) {
            this.currentTheme = savedTheme as 'terminal' | 'ide' | 'vibe-ai';
        }
        this.applyTheme();
    }

    init() {
        this.loadTheme();
        this.loadGame();
        this.startGameLoop();
        this.startAutoSave();
        console.log('Idle Vibe Code Quest v0.5 initialized!');
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

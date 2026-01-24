// Idle Vibe Code Quest - Game Store (Svelte 5 $state)

import { PROJECTS, UPGRADES, PROMPT_MESSAGES, TECH_DEBT, PRESTIGE, type Upgrade, type Project } from './constants';
import type { GameState, FloatText, Notification, OfflineGains, Hint, PrestigePath, PrestigeSummary } from './types';
import { getMaxUpgradeLevel, getUnlockedProjects } from './utils';

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
    lastSaveTime: Date.now()
};

// Game state class with reactive properties
class GameStore {
    gameState = $state<GameState>({ ...defaultState });
    currentPrompt = $state<string>(PROMPT_MESSAGES[0]);
    floatTexts = $state<FloatText[]>([]);
    notifications = $state<Notification[]>([]);
    notificationId = 0;
    floatTextId = 0;
    
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

    // Computed values
    get clickPower() {
        // Each vibeCode upgrade level adds its level number to LoC per click
        // Level 1 = +1, Level 2 = +2, etc.
        let power = 1; // Base power
        for (const level in this.gameState.upgrades.vibeCode) {
            const count = this.gameState.upgrades.vibeCode[level];
            power += parseInt(level) * count;
        }
        return power;
    }

    get autoClickRate() {
        // Legacy: still track for display purposes
        // Returns "clicks per second" from delegation upgrades
        // Each delegation upgrade level N adds N clicks/sec
        let clicksPerSecond = 0;
        for (const level in this.gameState.upgrades.delegation) {
            const count = this.gameState.upgrades.delegation[level];
            clicksPerSecond += parseInt(level) * count;
        }
        return clicksPerSecond;
    }

    get passiveLocRate() {
        // LoC/sec from delegation: count × (tier + 0.02 × clickPower)
        // Each copy of an upgrade adds its tier value + 2% of click power
        let locPerSecond = 0;
        for (const level in this.gameState.upgrades.delegation) {
            const count = this.gameState.upgrades.delegation[level];
            locPerSecond += count * (parseInt(level) + (0.02 * this.clickPower));
        }
        return locPerSecond;
    }

    get passiveIncome() {
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

    get unlockedProjects() {
        return getUnlockedProjects(this.gameState.resources.cred);
    }

    get maxUpgradeLevel() {
        return getMaxUpgradeLevel(this.gameState.resources.cred);
    }
    
    // Phase 1: Tech Debt System - Effective rates with debt penalty
    // Tech debt affects ONLY cash/cred income, NOT LoC generation (per user request)
    // effectiveIncome = rawIncome × (1 - debt)²
    
    // Click power is NOT affected by tech debt
    get effectiveClickPower() {
        return this.clickPower;
    }
    
    // Delegation upgrades NOT affected by tech debt
    get effectivePassiveLocRate() {
        return this.passiveLocRate;
    }
    
    get effectivePassiveIncome() {
        const penaltyFactor = Math.pow(1 - this.gameState.techDebt, 2);
        return this.passiveIncome * penaltyFactor;
    }
    
    // Helper to format debt as percentage
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
        const points = Math.floor(Math.log10(cash + 1));
        return Math.max(points, PRESTIGE.MIN_POINTS);
    }
    
    // Effective multipliers with prestige bonuses
    get effectiveCashMultiplier() {
        const base = 1;
        const prestigeBonus = this.gameState.prestige?.bonuses.cashMultiplier ?? 0;
        return base + prestigeBonus;
    }
    
    get effectiveLocMultiplier() {
        const base = 1;
        const prestigeBonus = this.gameState.prestige?.bonuses.locMultiplier ?? 0;
        return base + prestigeBonus;
    }
    
    get effectiveCredMultiplier() {
        const base = 1;
        const prestigeBonus = this.gameState.prestige?.bonuses.credMultiplier ?? 0;
        return base + prestigeBonus;
    }
    
    get effectiveStartingCash() {
        return this.gameState.prestige?.bonuses.startingCash ?? 0;
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
    
    // Phase 1: Accumulate tech debt (shared by manual and delegation clicks)
    private accumulateDebt() {
        const debtIncrease = TECH_DEBT.BASE_ACCUMULATION + 
            (this.gameState.projectsShipped * TECH_DEBT.PER_PROJECT);
        this.gameState.techDebt = Math.min(
            this.gameState.techDebt + debtIncrease,
            TECH_DEBT.MAX_DEBT
        );
    }

    // Actions
    handlePromptClick(event: MouseEvent) {
        const locGained = this.clickPower;
        this.gameState.resources.loc += locGained;
        this.gameState.totalClicks++;
        
        // Phase 1: Accumulate tech debt
        this.accumulateDebt();
        
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
        
        // Phase 1: Apply tech debt penalty to cash and cred rewards
        const penaltyFactor = Math.pow(1 - this.gameState.techDebt, 2);
        const effectiveMoneyReward = Math.floor(project.reward * penaltyFactor);
        const effectiveCredReward = Math.floor(project.cred * penaltyFactor);
        
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
    
    // Phase 1: Debt Reduction with scaling costs based on projects shipped
    reduceDebt(amount: number, paymentType: 'loc' | 'cash') {
        if (amount <= 0 || amount > this.gameState.techDebt) {
            this.showNotification('Invalid debt reduction amount!');
            return false;
        }
        
        // Calculate cost based on amount and projects shipped
        // LoC Cost per 0.01 debt = 200 + (projectsShipped × 4)
        // Cash Cost per 0.01 debt = 1000 + (projectsShipped × 20)
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
        
        this.gameState.techDebt -= amount;
        this.showNotification(`Reduced tech debt by ${(amount * 100).toFixed(1)}%`);
        return true;
    }
    
    // Phase 1: Calculate offline gains
    calculateOfflineGains(): OfflineGains {
        const now = Date.now();
        const lastSave = this.gameState.lastSaveTime;
        const timeDiff = now - lastSave;
        
        // If less than 10 seconds since save, no offline gains
        if (timeDiff < 10000) {
            return { loc: 0, cash: 0, hoursOffline: 0 };
        }
        
        const hoursOffline = timeDiff / (1000 * 60 * 60);
        
        // Offline rate is 10% of normal passive rates
        // Tech debt does NOT increase while offline
        const offlineLocRate = this.passiveLocRate * TECH_DEBT.OFFLINE_RATE;
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
        // Update timestamp before saving
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
                if (!this.gameState.activeTab) {
                    this.gameState.activeTab = { projects: 'standard', upgrades: 'vibeCode' };
                }
                
                // Phase 1: Ensure tech debt fields exist (for backwards compatibility)
                if (typeof this.gameState.techDebt !== 'number') {
                    this.gameState.techDebt = 0;
                }
                if (typeof this.gameState.projectsShipped !== 'number') {
                    this.gameState.projectsShipped = 0;
                }
                if (typeof this.gameState.lastSaveTime !== 'number') {
                    this.gameState.lastSaveTime = Date.now();
                }
                
                // Phase 3: Ensure prestige fields exist (for backwards compatibility)
                if (!this.gameState.prestige) {
                    this.gameState.prestige = {
                        prestigePoints: 0,
                        totalPrestiges: 0,
                        pathHistory: [],
                        runStartTime: Date.now(),
                        totalCashEarnedThisRun: this.gameState.resources.money,
                        bonuses: {
                            startingCash: 0,
                            cashMultiplier: 0,
                            locMultiplier: 0,
                            credMultiplier: 0
                        }
                    };
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
            // Create a completely fresh state object
            this.gameState = { ...defaultState };
            this.currentPrompt = PROMPT_MESSAGES[0];
            this.floatTexts = [];
            this.notifications = [];
            // Phase 2: Reset hint tracking
            this.hints = [];
            this.debtLowHintShown = false;
            this.previousDebtState = 'low';
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
                // Delegation generates LoC/sec
                if (this.passiveLocRate > 0) {
                    this.gameState.resources.loc += this.passiveLocRate;
                    // Phase 1: Delegation accumulates passive tech debt (0.1× single-click rate per second)
                    this.gameState.techDebt = Math.min(
                        this.gameState.techDebt + (TECH_DEBT.BASE_ACCUMULATION * TECH_DEBT.DELEGATION_DEBT_RATE),
                        TECH_DEBT.MAX_DEBT
                    );
                }
                
                if (this.passiveIncome > 0) {
                    this.gameState.resources.money += this.effectivePassiveIncome;
                    this.trackCashEarned(this.effectivePassiveIncome);
                }
                
                // Phase 2: Check for hints every game tick (with rate limiting)
                if (Math.random() < 0.1) { // 10% chance per tick to reduce overhead
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

    private showNotification(message: string) {
        const id = this.notificationId++;
        this.notifications.push({ id, message });
        
        setTimeout(() => {
            this.notifications = this.notifications.filter(n => n.id !== id);
        }, 2000);
    }
    
    // Phase 2: Hint system - Check conditions and add hints
    private checkAndAddHints() {
        const now = Date.now();
        
        // Track debt state transitions to reset hint tracking
        const isDebtLow = this.gameState.techDebt < 0.1;
        const currentState = isDebtLow ? 'low' : 'high';
        
        // Reset debtLowHintShown when transitioning from high to low
        if (this.previousDebtState === 'high' && currentState === 'low') {
            this.debtLowHintShown = false;
        }
        this.previousDebtState = currentState;
        
        const conditions: { check: () => boolean; condition: Hint['condition']; message: string }[] = [
            { 
                check: () => this.gameState.techDebt > 0.4, 
                condition: 'debtHigh', 
                message: 'Tech debt high - consider clearing!' 
            },
            { 
                check: () => isDebtLow && !this.debtLowHintShown, 
                condition: 'debtLow', 
                message: 'Debt low - good time to save LoC' 
            },
            { 
                check: () => this.upgradePercentage >= PRESTIGE.THRESHOLD_PERCENT - 0.1, 
                condition: 'prestigeSoon', 
                message: 'Prestige available soon!' 
            }
        ];
        
        for (const { check, condition, message } of conditions) {
            if (check() && !this.hints.some(h => h.condition === condition)) {
                this.addHint(message, condition);
                // Mark debtLow as shown so it doesn't appear again until next high->low transition
                if (condition === 'debtLow') {
                    this.debtLowHintShown = true;
                }
            }
        }
    }
    
    private addHint(message: string, condition: Hint['condition']) {
        const id = this.hintId++;
        this.hints.push({ id, message, condition, timestamp: Date.now() });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            this.dismissHint(id);
        }, 10000);
    }
    
    dismissHint(id: number) {
        this.hints = this.hints.filter(h => h.id !== id);
        // Add to cooldown so it doesn't reappear for 60 seconds
        const cooldownUntil = Date.now() + 60000;
        this.hintCooldowns = new Set([...this.hintCooldowns, cooldownUntil]);
        
        // Clean up old cooldowns
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
        
        // Calculate bonuses based on path
        const startingCash = (path === 'buyout')
            ? pointsToEarn * PRESTIGE.STARTING_CASH_PER_POINT
            : 0;
        
        const cashMultiplier = (path === 'buyout')
            ? pointsToEarn * PRESTIGE.CASH_MULTIPLIER_PER_POINT
            : 0;
        
        const locMultiplier = (path === 'nirvana')
            ? pointsToEarn * PRESTIGE.LOC_MULTIPLIER_PER_POINT
            : 0;
        
        const credMultiplier = (path === 'linus')
            ? pointsToEarn * PRESTIGE.CRED_MULTIPLIER_PER_POINT
            : 0;
        
        // Reset game state (preserve prestige data)
        this.gameState.resources = { money: 0, loc: 0, cred: 0 };
        this.gameState.upgrades = { vibeCode: {}, delegation: {} };
        this.gameState.projects = { standard: {}, saas: {}, openSource: {} };
        this.gameState.totalClicks = 0;
        this.gameState.techDebt = 0;
        this.gameState.projectsShipped = 0;
        
        // Apply starting cash bonus
        this.gameState.resources.money = startingCash;
        
        // Update prestige state
        if (!this.gameState.prestige) {
            this.gameState.prestige = {
                prestigePoints: 0,
                totalPrestiges: 0,
                pathHistory: [],
                runStartTime: Date.now(),
                totalCashEarnedThisRun: 0,
                bonuses: {
                    startingCash: 0,
                    cashMultiplier: 0,
                    locMultiplier: 0,
                    credMultiplier: 0
                }
            };
        }
        
        this.gameState.prestige.prestigePoints += pointsToEarn;
        this.gameState.prestige.totalPrestiges += 1;
        this.gameState.prestige.pathHistory.push(path);
        this.gameState.prestige.runStartTime = Date.now();
        this.gameState.prestige.totalCashEarnedThisRun = 0;
        
        // Accumulate bonuses (additive stacking)
        this.gameState.prestige.bonuses.startingCash += startingCash;
        this.gameState.prestige.bonuses.cashMultiplier += cashMultiplier;
        this.gameState.prestige.bonuses.locMultiplier += locMultiplier;
        this.gameState.prestige.bonuses.credMultiplier += credMultiplier;
        
        // Close modals and show notification
        this.showPrestigeModal = false;
        this.selectedPrestigePath = null;
        this.pendingPrestigePoints = 0;
        
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
            this.showNotification('Full reset complete!');
        }
    }

    init() {
        this.loadGame();
        this.startGameLoop();
        this.startAutoSave();
        console.log('Idle Vibe Code Quest v0.3.3 initialized!');
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

export function getUpgradeCost(upgrade: Upgrade, count: number): number {
    const costMultiplier = Math.pow(1.15, count);
    return Math.floor(upgrade.cost * costMultiplier);
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

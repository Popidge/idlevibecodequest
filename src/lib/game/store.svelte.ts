// Idle Vibe Code Quest - Game Store (Svelte 5 $state)

import { PROJECTS, UPGRADES, PROMPT_MESSAGES, TECH_DEBT, type Upgrade } from './constants';
import type { GameState, FloatText, Notification, OfflineGains } from './types';
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
        // Actual LoC/sec after applying clickPower to auto-clicks
        return this.autoClickRate * this.clickPower;
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
        
        if (this.gameState.resources.loc < project.locCost) {
            this.showNotification('Not enough LoC!');
            return;
        }
        
        this.gameState.resources.loc -= project.locCost;
        
        // Phase 1: Apply tech debt penalty to cash and cred rewards
        const penaltyFactor = Math.pow(1 - this.gameState.techDebt, 2);
        const effectiveMoneyReward = Math.floor(project.reward * penaltyFactor);
        const effectiveCredReward = Math.floor(project.cred * penaltyFactor);
        
        this.gameState.resources.money += effectiveMoneyReward;
        this.gameState.resources.cred += effectiveCredReward;
        
        const currentCount = this.gameState.projects[type][projectId] || 0;
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
        const offlineCashRate = this.passiveIncome * TECH_DEBT.OFFLINE_RATE;
        
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
                if (this.autoClickRate > 0) {
                    // Delegation generates "clicks" - each click affected by vibeCode upgrades
                    this.gameState.resources.loc += this.passiveLocRate;
                    // Phase 1: Delegation clicks also accumulate tech debt
                    this.accumulateDebt();
                }
                
                if (this.passiveIncome > 0) {
                    this.gameState.resources.money += this.passiveIncome;
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

    init() {
        this.loadGame();
        this.startGameLoop();
        this.startAutoSave();
        console.log('Idle Vibe Code Quest v0.3 initialized!');
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

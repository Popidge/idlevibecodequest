// Vibe Code Guru - Game Store (Svelte 5 $state)

import { PROJECTS, UPGRADES, PROMPT_MESSAGES, type Upgrade } from './constants';
import type { GameState, FloatText, Notification } from './types';
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
    }
};

// Game state class with reactive properties
class GameStore {
    gameState = $state<GameState>({ ...defaultState });
    currentPrompt = $state<string>(PROMPT_MESSAGES[0]);
    floatTexts = $state<FloatText[]>([]);
    notifications = $state<Notification[]>([]);
    notificationId = 0;
    floatTextId = 0;

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

    // Actions
    handlePromptClick(event: MouseEvent) {
        const locGained = this.clickPower;
        this.gameState.resources.loc += locGained;
        this.gameState.totalClicks++;
        
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
        this.gameState.resources.money += project.reward;
        this.gameState.resources.cred += project.cred;
        
        const currentCount = this.gameState.projects[type][projectId] || 0;
        this.gameState.projects[type][projectId] = currentCount + 1;
        
        const newCount = this.gameState.projects[type][projectId];
        let rewardText = `$${formatNumber(project.reward)}`;
        if (project.cred > 0) {
            rewardText += ` + ${project.cred} Cred`;
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

    saveGame() {
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
        console.log('Vibe Code Guru v0.3 initialized!');
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

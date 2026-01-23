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

// Reactive game state
let gameState = $state<GameState>({ ...defaultState });

// UI state
let currentPrompt = $state<string>(PROMPT_MESSAGES[0]);
let floatTexts = $state<FloatText[]>([]);
let notifications = $state<Notification[]>([]);
let notificationId = 0;
let floatTextId = 0;

// Delegation values for auto LOC calculation
const DELEGATION_VALUES = [1, 3, 8, 20, 50, 125, 300, 750, 1800, 4500];

// Computed values using $derived
let clickPower = $derived.by(() => {
    let totalLevels = 0;
    for (const level in gameState.upgrades.vibeCode) {
        totalLevels += gameState.upgrades.vibeCode[level];
    }
    return Math.pow(2, totalLevels);
});

let autoClickRate = $derived.by(() => {
    let rate = 0;
    for (const level in gameState.upgrades.delegation) {
        const count = gameState.upgrades.delegation[level];
        const index = (parseInt(level) - 1) % DELEGATION_VALUES.length;
        rate += DELEGATION_VALUES[index] * count;
    }
    return rate;
});

let passiveIncome = $derived.by(() => {
    let passive = 0;
    for (const projectId in gameState.projects.saas) {
        const project = PROJECTS.saas.find(p => p.id === projectId);
        const count = gameState.projects.saas[projectId] || 0;
        // recurring only exists on saas projects
        if (project && 'recurring' in project && project.recurring) {
            passive += project.reward * count;
        }
    }
    return passive;
});

let unlockedProjects = $derived(getUnlockedProjects(gameState.resources.cred));
let maxUpgradeLevel = $derived(getMaxUpgradeLevel(gameState.resources.cred));

// Actions
export function handlePromptClick(event: MouseEvent) {
    const locGained = clickPower;
    gameState.resources.loc += locGained;
    gameState.totalClicks++;
    
    // Add float text
    addFloatText(event.clientX, event.clientY, `+${formatNumber(locGained)} LoC`);
    
    // Random prompt
    currentPrompt = PROMPT_MESSAGES[Math.floor(Math.random() * PROMPT_MESSAGES.length)];
}

export function shipProject(type: 'standard' | 'saas' | 'openSource', projectId: string) {
    const projectList = PROJECTS[type];
    const project = projectList.find(p => p.id === projectId);
    
    if (!project) return;
    
    if (gameState.resources.loc < project.locCost) {
        showNotification('Not enough LoC!');
        return;
    }
    
    gameState.resources.loc -= project.locCost;
    gameState.resources.money += project.reward;
    gameState.resources.cred += project.cred;
    
    const currentCount = gameState.projects[type][projectId] || 0;
    gameState.projects[type][projectId] = currentCount + 1;
    
    const newCount = gameState.projects[type][projectId];
    let rewardText = `$${formatNumber(project.reward)}`;
    if (project.cred > 0) {
        rewardText += ` + ${project.cred} Cred`;
    }
    if ('recurring' in project && project.recurring) {
        rewardText += ` (recurring)`;
    }
    showNotification(`Shipped ${project.name}! (${newCount} total) +${rewardText}`);
}

export function buyUpgrade(type: 'vibeCode' | 'delegation', level: number) {
    const upgradeList = UPGRADES[type];
    const upgrade = upgradeList.find(u => u.level === level);
    
    if (!upgrade) return;
    
    const currentCount = gameState.upgrades[type][level] || 0;
    const currentCost = getUpgradeCost(upgrade, currentCount);
    
    if (gameState.resources.money < currentCost) {
        showNotification('Not enough money!');
        return;
    }
    
    if (level > maxUpgradeLevel) {
        showNotification('Upgrade locked! Need more Cred.');
        return;
    }
    
    gameState.resources.money -= currentCost;
    gameState.upgrades[type][level] = currentCount + 1;
    
    showNotification(`Upgrade purchased! ${upgrade.desc}`);
}

export function saveGame() {
    const saveData = JSON.stringify(gameState);
    localStorage.setItem('vibeCodeClicker', saveData);
    showNotification('Game saved!');
}

export function loadGame() {
    const savedData = localStorage.getItem('vibeCodeClicker');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            gameState = { ...gameState, ...parsed };
            // Ensure activeTab exists
            if (!gameState.activeTab) {
                gameState.activeTab = { projects: 'standard', upgrades: 'vibeCode' };
            }
        } catch (e) {
            console.error('Failed to load save:', e);
        }
    }
}

export function resetGame() {
    if (confirm('Are you sure you want to reset the game? All progress will be lost!')) {
        localStorage.removeItem('vibeCodeClicker');
        gameState = { ...defaultState };
        showNotification('Game reset!');
    }
}

export function switchTab(panel: 'projects' | 'upgrades', tabName: string) {
    if (panel === 'projects') {
        gameState.activeTab.projects = tabName as 'standard' | 'saas' | 'openSource';
    } else {
        gameState.activeTab.upgrades = tabName as 'vibeCode' | 'delegation';
    }
}

// Game loop
export function startGameLoop() {
    $effect(() => {
        const interval = setInterval(() => {
            if (autoClickRate > 0) {
                gameState.resources.loc += autoClickRate;
            }
            
            if (passiveIncome > 0) {
                gameState.resources.money += passiveIncome;
            }
        }, 1000);
        
        return () => clearInterval(interval);
    });
}

export function startAutoSave() {
    $effect(() => {
        const interval = setInterval(() => {
            saveGame();
        }, 30000);
        
        return () => clearInterval(interval);
    });
}

// UI helpers
function addFloatText(x: number, y: number, text: string) {
    const id = floatTextId++;
    floatTexts.push({ id, text, x, y });
    
    setTimeout(() => {
        floatTexts = floatTexts.filter(ft => ft.id !== id);
    }, 1000);
}

function showNotification(message: string) {
    const id = notificationId++;
    notifications.push({ id, message });
    
    setTimeout(() => {
        notifications = notifications.filter(n => n.id !== id);
    }, 2000);
}

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

// Initialize game
export function initGame() {
    loadGame();
    startGameLoop();
    startAutoSave();
    console.log('Vibe Code Guru v0.3 initialized!');
}

// Export state for components
export { 
    gameState, 
    currentPrompt, 
    floatTexts, 
    notifications,
    clickPower, 
    autoClickRate, 
    passiveIncome,
    unlockedProjects,
    maxUpgradeLevel
};

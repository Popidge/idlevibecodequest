// Idle Vibe Code Quest - TypeScript Interfaces

export interface Resources {
    money: number;
    loc: number;
    cred: number;
}

export interface GameState {
    resources: Resources;
    upgrades: {
        vibeCode: Record<number, number>;
        delegation: Record<number, number>;
    };
    projects: {
        standard: Record<string, number>;
        saas: Record<string, number>;
        openSource: Record<string, number>;
    };
    totalClicks: number;
    activeTab: {
        projects: 'standard' | 'saas' | 'openSource';
        upgrades: 'vibeCode' | 'delegation';
    };
    // Phase 1: Tech Debt System
    techDebt: number;
    projectsShipped: number;
    lastSaveTime: number;
    // Phase 3: Prestige System
    prestige?: PrestigeState;
}

export interface FloatText {
    id: number;
    text: string;
    x: number;
    y: number;
}

export interface Notification {
    id: number;
    message: string;
}

export interface OfflineGains {
    loc: number;
    cash: number;
    hoursOffline: number;
}

// Phase 2: Strategic Hint System
export interface Hint {
    id: number;
    message: string;
    condition: 'debtHigh' | 'debtLow' | 'prestigeSoon';
    timestamp: number;
}

// Phase 3: Prestige System
export type PrestigePath = 'buyout' | 'nirvana' | 'linus' | 'learning';

export interface PrestigeBonuses {
    startingCash: number;
    cashMultiplier: number;
    locMultiplier: number;
    credMultiplier: number;
    // Tech tree bonus accumulators
    totalStartingCash: number;
    totalCashMultiplier: number;
    totalLocMultiplier: number;
    totalCredMultiplier: number;
    debtAccumulationReduction: number;
    debtPenaltyMitigation: number;
    debtClearingMultiplier: number;
    credThresholdReduction: number;
    prestigePointMultiplier: number;
    autoPurchaseThreshold: number;
}

export interface PrestigeState {
    prestigePoints: number;
    totalPrestiges: number;
    pathHistory: PrestigePath[];
    runStartTime: number;
    totalCashEarnedThisRun: number;
    bonuses: PrestigeBonuses;
    // Phase 4: Tech tree purchases
    techTrees: {
        buyout: number[];      // Array of purchased node indices (0-9)
        nirvana: number[];
        linus: number[];
        learning: number[];
    };
}

export interface PrestigeSummary {
    pointsEarned: number;
    runDuration: string;
    cashEarned: number;
    projectsShipped: number;
    upgradesOwned: number;
}

// Phase 4: Tech Tree System
export type TechTreePath = 'buyout' | 'nirvana' | 'linus' | 'learning';

export interface TechTreeNode {
    id: string;
    name: string;
    description: string;
    cost: number;
    effect: TechTreeEffect;
    effectValue: number;
}

export type TechTreeEffect = 
    | 'startingCash'
    | 'cashMultiplier'
    | 'locMultiplier'
    | 'credMultiplier'
    | 'debtAccumulationReduction'
    | 'debtPenaltyMitigation'
    | 'debtClearingMultiplier'
    | 'credThresholdReduction'
    | 'prestigePointMultiplier'
    | 'verticalIntegration'
    | 'locPerClick'
    | 'passiveLocRate';

export interface TechTree {
    path: TechTreePath;
    name: string;
    icon: string;
    color: string;
    description: string;
    nodes: TechTreeNode[];
}

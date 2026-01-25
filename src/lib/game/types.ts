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

// Queued notification for NotificationBar - includes metadata for display
export interface QueuedNotification {
    id: number;
    message: string;
    type: 'success' | 'warning' | 'info';
    category: 'footer' | 'title';
    timestamp: number;
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
    credThresholdReduction: number;
    prestigePointMultiplier: number;
    autoPurchaseThreshold: number;
    // Legacy fields - no longer used but kept for migration
    debtAccumulationReduction?: number;
    debtPenaltyMitigation?: number;
    debtClearingMultiplier?: number;
}

export interface PrestigeState {
    prestigePoints: number;
    totalPrestiges: number;
    pathHistory: PrestigePath[];
    runStartTime: number;
    totalCashEarnedThisRun: number;
    bonuses?: PrestigeBonuses; // Optional - deprecated, now calculated from techTrees
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

// System Modifiers - Single Source of Truth for all economy calculations
// Final = (Base + Flat) * (1 + Sum(Multipliers))
export interface SystemModifiers {
    // Multipliers (Additive)
    moneyMultiplier: number;        // e.g., 0.5 = +50%
    locMultiplier: number;          // e.g., 0.5 = +50%
    credMultiplier: number;         // e.g., 0.5 = +50%
    prestigePointMultiplier: number; // e.g., 0.5 = +50%

    // Flat Bonuses
    startingCashFlat: number;       // Flat cash bonus on prestige
    locPerClickFlat: number;        // Flat LoC per click (additive with base)
    passiveLocRateFlat: number;     // Flat LoC/sec bonus (additive with base)
    credThresholdReduction: number; // Cred requirement reduction

    // Debt Mechanics (Reworked v0.5)
    techTreeDebtMultiplier: number;        // 0-1 range from Learning tree nodes (accumulates from nodes)
    prestigeDebtModifier: number;           // 0-1 range from prestige points
    unlockCodeZen: boolean;                 // Inverts penalty to bonus

    // Special Flags (for boolean logic)
    unlockLegacyWhisperer: boolean; // Legacy - no longer used, kept for compatibility
}

export interface TechTreeNode {
    id: string;
    name: string;
    description: string;
    cost: number;
    modifiers: Partial<SystemModifiers>;
}

export interface TechTree {
    path: TechTreePath;
    name: string;
    icon: string;
    color: string;
    description: string;
    nodes: TechTreeNode[];
}

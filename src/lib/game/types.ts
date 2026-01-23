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

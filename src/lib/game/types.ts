// Vibe Code Guru - TypeScript Interfaces

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

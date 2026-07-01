import type { GameState, PrestigePath, SaveEnvelope } from './types';
import { TECH_DEBT } from './constants';

export const SAVE_VERSION = 1;

const PRESTIGE_PATHS: PrestigePath[] = ['buyout', 'nirvana', 'linus', 'learning'];

export function createDefaultGameState(now = Date.now()): GameState {
    return {
        resources: { money: 0, loc: 0, cred: 0 },
        upgrades: { vibeCode: {}, delegation: {} },
        projects: { standard: {}, saas: {}, openSource: {} },
        totalClicks: 0,
        activeTab: { projects: 'standard', upgrades: 'vibeCode' },
        techDebt: 0,
        projectsShipped: 0,
        lastSaveTime: now,
        prestige: {
            prestigePoints: 0,
            totalPrestiges: 0,
            pathHistory: [],
            pathPoints: { buyout: 0, nirvana: 0, linus: 0, learning: 0 },
            runStartTime: now,
            techTrees: { buyout: [], nirvana: [], linus: [], learning: [] }
        }
    };
}

function object(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};
}

function nonNegativeNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function integer(value: unknown, fallback: number): number {
    return Math.floor(nonNegativeNumber(value, fallback));
}

function numericRecord(value: unknown): Record<string, number> {
    return Object.fromEntries(Object.entries(object(value)).flatMap(([key, count]) =>
        typeof count === 'number' && Number.isFinite(count) && count >= 0
            ? [[key, Math.floor(count)]]
            : []
    ));
}

function nodeIndices(value: unknown): number[] {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter(item => Number.isInteger(item) && item >= 0 && item < 10))] as number[];
}

export function hydrateGameState(value: unknown, now = Date.now()): GameState {
    const fallback = createDefaultGameState(now);
    const candidate = object(value);
    const resources = object(candidate.resources);
    const upgrades = object(candidate.upgrades);
    const projects = object(candidate.projects);
    const activeTab = object(candidate.activeTab);
    const prestige = object(candidate.prestige);
    const techTrees = object(prestige.techTrees);
    const pathPoints = object(prestige.pathPoints);

    const rawDebt = nonNegativeNumber(candidate.techDebt, 0);
    const migratedDebt = rawDebt > 0 && rawDebt <= 0.5 ? rawDebt * 10000 : rawDebt;

    return {
        resources: {
            money: nonNegativeNumber(resources.money, 0),
            loc: nonNegativeNumber(resources.loc, 0),
            cred: nonNegativeNumber(resources.cred, 0)
        },
        upgrades: {
            vibeCode: numericRecord(upgrades.vibeCode),
            delegation: numericRecord(upgrades.delegation)
        },
        projects: {
            standard: numericRecord(projects.standard),
            saas: numericRecord(projects.saas),
            openSource: numericRecord(projects.openSource)
        },
        totalClicks: integer(candidate.totalClicks, 0),
        activeTab: {
            projects: ['standard', 'saas', 'openSource'].includes(String(activeTab.projects))
                ? activeTab.projects as GameState['activeTab']['projects']
                : fallback.activeTab.projects,
            upgrades: ['vibeCode', 'delegation'].includes(String(activeTab.upgrades))
                ? activeTab.upgrades as GameState['activeTab']['upgrades']
                : fallback.activeTab.upgrades
        },
        techDebt: Math.min(migratedDebt, TECH_DEBT.MAX_LEVEL),
        projectsShipped: integer(candidate.projectsShipped, 0),
        lastSaveTime: nonNegativeNumber(candidate.lastSaveTime, now),
        prestige: {
            prestigePoints: integer(prestige.prestigePoints, 0),
            totalPrestiges: integer(prestige.totalPrestiges, 0),
            pathHistory: Array.isArray(prestige.pathHistory)
                ? prestige.pathHistory.filter((path): path is PrestigePath => PRESTIGE_PATHS.includes(path as PrestigePath))
                : [],
            pathPoints: {
                buyout: integer(pathPoints.buyout, 0),
                nirvana: integer(pathPoints.nirvana, 0),
                linus: integer(pathPoints.linus, 0),
                learning: integer(pathPoints.learning, 0)
            },
            runStartTime: nonNegativeNumber(prestige.runStartTime, now),
            techTrees: {
                buyout: nodeIndices(techTrees.buyout),
                nirvana: nodeIndices(techTrees.nirvana),
                linus: nodeIndices(techTrees.linus),
                learning: nodeIndices(techTrees.learning)
            }
        }
    };
}

export function parseSave(raw: string, now = Date.now()): GameState {
    const parsed: unknown = JSON.parse(raw);
    const record = object(parsed);
    return hydrateGameState('state' in record ? record.state : record, now);
}

export function createSaveEnvelope(state: GameState, savedAt = Date.now()): SaveEnvelope {
    return { version: SAVE_VERSION, savedAt, state };
}

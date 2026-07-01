import { describe, expect, it } from 'vitest';
import { createDefaultGameState, createSaveEnvelope, hydrateGameState, parseSave, SAVE_VERSION } from './state';

describe('game state creation', () => {
    it('returns fully independent nested defaults', () => {
        const first = createDefaultGameState(100);
        const second = createDefaultGameState(200);
        first.resources.money = 10;
        first.prestige!.techTrees.buyout.push(1);
        expect(second.resources.money).toBe(0);
        expect(second.prestige!.techTrees.buyout).toEqual([]);
        expect(second.prestige!.runStartTime).toBe(200);
    });
});

describe('save migration', () => {
    it('round-trips the versioned envelope', () => {
        const state = createDefaultGameState(100);
        state.resources.money = 42;
        state.prestige!.pathPoints.buyout = 3;
        const envelope = createSaveEnvelope(state, 200);
        expect(envelope.version).toBe(SAVE_VERSION);
        expect(parseSave(JSON.stringify(envelope), 300)).toMatchObject({
            resources: { money: 42 },
            prestige: { pathPoints: { buyout: 3 } }
        });
    });

    it('loads legacy direct-state saves and migrates the old debt scale', () => {
        const migrated = parseSave(JSON.stringify({
            resources: { money: 12 },
            techDebt: 0.25,
            prestige: { pathHistory: ['buyout'], techTrees: { buyout: [0] } }
        }), 500);
        expect(migrated.techDebt).toBe(2500);
        expect(migrated.prestige!.pathHistory).toEqual(['buyout']);
        expect(migrated.prestige!.pathPoints).toEqual({ buyout: 0, nirvana: 0, linus: 0, learning: 0 });
    });

    it('sanitizes partial and malformed fields', () => {
        const hydrated = hydrateGameState({
            resources: { money: -1, loc: Number.NaN, cred: 8 },
            upgrades: { vibeCode: { 1: 2, bad: -4 } },
            activeTab: { projects: 'invalid' },
            prestige: { pathHistory: ['linus', 'invalid'], techTrees: { linus: [1, 1, 99, 'x'] } }
        }, 700);
        expect(hydrated.resources).toEqual({ money: 0, loc: 0, cred: 8 });
        expect(hydrated.upgrades.vibeCode).toEqual({ 1: 2 });
        expect(hydrated.activeTab.projects).toBe('standard');
        expect(hydrated.prestige!.pathHistory).toEqual(['linus']);
        expect(hydrated.prestige!.techTrees.linus).toEqual([1]);
    });

    it('reads known fields from future envelopes without trusting unknown fields', () => {
        const future = JSON.stringify({ version: SAVE_VERSION + 10, savedAt: 1, state: { resources: { money: 9 }, surprise: true } });
        expect(parseSave(future, 800).resources.money).toBe(9);
    });
});

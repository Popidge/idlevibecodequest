import { describe, expect, it } from 'vitest';
import { PRESTIGE, PROJECTS } from './constants';
import type { EventReward } from './event-types';
import {
    calculateDebtPenaltyFactor,
    calculateDebtReductionCosts,
    calculateEffectivePassiveLocRate,
    calculateEventRewardAmount,
    calculatePrestigePoints,
    getPrestigePathModifiers
} from './economy';

describe('debt calculations', () => {
    it('progressively mitigates the standard debt penalty', () => {
        expect(calculateDebtPenaltyFactor(5000, 0, false)).toBe(0.5);
        expect(calculateDebtPenaltyFactor(5000, 0.5, false)).toBe(0.75);
        expect(calculateDebtPenaltyFactor(5000, 1, false)).toBe(1);
        for (let step = 0; step <= 10; step++) {
            expect(calculateDebtPenaltyFactor(5000, step / 10, false)).toBeCloseTo(0.5 + step * 0.05);
        }
    });

    it('makes Code Zen a bounded debt bonus', () => {
        expect(calculateDebtPenaltyFactor(0, 1, true)).toBe(1);
        expect(calculateDebtPenaltyFactor(5000, 1, true)).toBe(1.5);
        expect(calculateDebtPenaltyFactor(10000, 0, true)).toBe(1.5);
    });

    it('uses the same debt reduction prices as the UI', () => {
        expect(calculateDebtReductionCosts(1000, PROJECTS.standard[0])).toEqual({ loc: 500, cash: 1000 });
    });
});

describe('prestige calculations', () => {
    it('derives each persistent path modifier from assigned points', () => {
        expect(getPrestigePathModifiers({ buyout: 2, nirvana: 3, linus: 4, learning: 5 })).toEqual({
            moneyMultiplier: 2 * PRESTIGE.CASH_MULTIPLIER_PER_POINT,
            locMultiplier: 3 * PRESTIGE.LOC_MULTIPLIER_PER_POINT,
            credMultiplier: 4 * PRESTIGE.CRED_MULTIPLIER_PER_POINT,
            prestigeDebtModifier: 5 * PRESTIGE.DEBT_PENALTY_REDUCTION
        });
    });

    it('applies tech-tree prestige multipliers before rounding', () => {
        expect(calculatePrestigePoints(220, 110, 1, 1.5, 1)).toBe(3);
        expect(calculatePrestigePoints(0, 110, 1, 2, 1)).toBe(1);
    });
});

describe('event and passive bonuses', () => {
    it('uses configured reward amounts and clamps performance', () => {
        const performanceReward = { type: 'locPerClick', baseAmount: 3, scalingMode: 'performance', duration: 60 } as const;
        expect(calculateEventRewardAmount(performanceReward, 0.5)).toBe(1.5);
        expect(calculateEventRewardAmount(performanceReward, 1.5)).toBe(3);
    });

    it('honours configured tier tables', () => {
        const reward: EventReward = {
            type: 'cash', baseAmount: 100, scalingMode: 'tiered',
            tiers: [{ threshold: 0.8, multiplier: 3 }, { threshold: 0, multiplier: 0.1 }]
        };
        expect(calculateEventRewardAmount(reward, 0.9)).toBe(300);
        expect(calculateEventRewardAmount(reward, 0.2)).toBe(10);
    });

    it('applies delegation buffs to passive LoC', () => {
        expect(calculateEffectivePassiveLocRate(10, 0.25, 2, 1.4, 1.5)).toBe(27.75);
    });
});

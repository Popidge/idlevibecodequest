import { describe, expect, it } from 'vitest';
import { defaultConfig, simulateGameplay } from './tuning-sim';

describe('tuning simulator', () => {
    it('uses the live debt bounds and never reports an immediate second prestige', () => {
        const result = simulateGameplay(defaultConfig, 600);
        expect(result.finalDebtPenaltyFactor).toBeGreaterThanOrEqual(0.5);
        expect(result.finalDebtPenaltyFactor).toBeLessThanOrEqual(1);
        if (result.timeToSecondPrestige !== null) {
            expect(result.timeToSecondPrestige).toBeGreaterThan(0);
        }
    });

    it('keeps zero tuning denominators finite', () => {
        const result = simulateGameplay({
            ...defaultConfig,
            maxDebt: 0,
            prestigeThresholdPercent: 0
        }, 1);
        expect(Number.isFinite(result.finalDebtPenaltyFactor)).toBe(true);
        expect(result.finalDebtPenaltyFactor).toBe(1);
    });
});

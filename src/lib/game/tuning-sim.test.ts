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
});

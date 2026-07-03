import { PRESTIGE, TECH_DEBT, type Project } from './constants';
import type { EventReward } from './event-types';
import type { PrestigePath, SystemModifiers } from './types';

const DEFAULT_REWARD_TIERS: NonNullable<EventReward['tiers']> = [
    { threshold: 0.9, multiplier: 2 },
    { threshold: 0.7, multiplier: 1 },
    { threshold: 0.5, multiplier: 0.5 },
    { threshold: 0, multiplier: 0.25 }
];

export function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), maximum);
}

export function calculateDebtPenaltyFactor(
    techDebt: number,
    mitigation: number,
    codeZen: boolean
): number {
    const debtRatio = clamp(techDebt / TECH_DEBT.MAX_LEVEL, 0, 1);
    if (codeZen) return 1 + debtRatio / 2;
    return 1 - (debtRatio / 2) * (1 - clamp(mitigation, 0, 1));
}

export function calculateDebtAccumulation(locGenerated: number, accumulationPerLoc: number): number {
    const generated = Math.max(0, locGenerated);
    const linearLoc = Math.min(generated, TECH_DEBT.LINEAR_LOC_THRESHOLD);
    const excessLoc = Math.max(0, generated - TECH_DEBT.LINEAR_LOC_THRESHOLD);
    const softenedExcess = excessLoc / Math.pow(
        1 + excessLoc / 100,
        TECH_DEBT.HIGH_RATE_SOFTENING
    );

    return (linearLoc + softenedExcess) * accumulationPerLoc * TECH_DEBT.ACCUMULATION_SCALE;
}

export function calculateDebtReductionCosts(amount: number, project: Project): { loc: number; cash: number } {
    const loc = Math.floor(Math.max(0, amount) / 2);
    return { loc, cash: Math.floor(loc * (project.locCost / project.reward)) };
}

export function calculateEventRewardAmount(reward: EventReward, rawPerformance: number): number {
    const performance = clamp(rawPerformance, 0, 1);
    if (reward.scalingMode === 'performance') return reward.baseAmount * performance;
    if (reward.scalingMode === 'tiered') {
        const tiers = reward.tiers ?? DEFAULT_REWARD_TIERS;
        const tier = [...tiers].sort((a, b) => b.threshold - a.threshold)
            .find(candidate => performance >= candidate.threshold);
        return reward.baseAmount * (tier?.multiplier ?? 0);
    }
    return reward.baseAmount;
}

export function getPrestigePathModifiers(pathPoints: Record<PrestigePath, number>): Partial<SystemModifiers> {
    return {
        moneyMultiplier: pathPoints.buyout * PRESTIGE.CASH_MULTIPLIER_PER_POINT,
        locMultiplier: pathPoints.nirvana * PRESTIGE.LOC_MULTIPLIER_PER_POINT,
        credMultiplier: pathPoints.linus * PRESTIGE.CRED_MULTIPLIER_PER_POINT,
        prestigeDebtModifier: pathPoints.learning * PRESTIGE.DEBT_PENALTY_REDUCTION
    };
}

export function calculatePrestigePoints(
    upgradesOwned: number,
    upgradesAvailable: number,
    threshold: number,
    multiplier: number,
    minimum: number
): number {
    const thresholdValue = upgradesAvailable * threshold;
    if (thresholdValue <= 0) return minimum;
    return Math.max(Math.floor((upgradesOwned / thresholdValue) * multiplier), minimum);
}

export function calculateEffectivePassiveLocRate(
    baseRate: number,
    techTreePercent: number,
    buffFlat: number,
    delegationMultiplier: number,
    locMultiplier: number
): number {
    return ((baseRate * delegationMultiplier) + (baseRate * techTreePercent) + buffFlat) * locMultiplier;
}

# Prestige Calculation Rework Plan

## Problem Statement

The current prestige calculation system has a fundamental design flaw: **all upgrade copies are counted equally regardless of their level**, despite massive cost differences between levels.

### Current Implementation

```typescript
// store.svelte.ts lines 365-384
totalUpgradesAvailable = UPGRADES.vibeCode.length + UPGRADES.delegation.length; // = 20
totalUpgradesOwned = sum of all upgrade copies owned; // Each copy = 1
upgradePercentage = totalUpgradesOwned / totalUpgradesAvailable;
isPrestigeAvailable = upgradePercentage >= PRESTIGE.THRESHOLD_PERCENT; // 0.7 (70%)
```

### The Cost Scaling Problem

| Vibe Code Level | Cost | Multiplier | Delegation Level | Cost | Multiplier |
|-----------------|------|------------|------------------|------|------------|
| 1 | $50 | 1x | 1 | $100 | 1x |
| 2 | $200 | 4x | 2 | $500 | 5x |
| 3 | $800 | 4x | 3 | $2,000 | 4x |
| 4 | $3,200 | 4x | 4 | $8,000 | 4x |
| 5 | $12,800 | 4x | 5 | $32,000 | 4x |
| 6 | $51,200 | 4x | 6 | $128,000 | 4x |
| 7 | $204,800 | 4x | 7 | $512,000 | 4x |
| 8 | $819,200 | 4x | 8 | $2,048,000 | 4x |
| 9 | $3,276,800 | 4x | 9 | $8,192,000 | 4x |
| 10 | $13,107,200 | 4x | 10 | $32,768,000 | 4x |

**The disparity:**
- A level 10 upgrade costs **262,144x** more than level 1 (vibeCode)
- Yet both count as "1 upgrade" toward prestige
- This causes players to reach 70% (14 upgrades) very early by stacking cheap level 1s

### Current Prestige Experience

At 70% threshold (14 upgrades owned):
- Player could have: 14 × level 1 upgrades = ~$700 invested
- Or: 1 × level 10 upgrade = ~$13M invested
- **Both count the same toward prestige!**

This means:
- Players can prestige within ~10-15 minutes
- The prestige system doesn't reflect actual investment
- Subsequent runs feel similar (not enough progression)

---

## Proposed Solutions

### Option A: Level Sum Weighting (User's Proposal)

**Concept:** Weight each upgrade copy by its level number.

```typescript
// New calculations
totalUpgradesAvailable = (1+2+3+...+10) × 2 = 55 × 2 = 110;
totalUpgradesOwned = sum(level × count for all owned upgrades);
// Example: 5×L1 + 3×L2 + 1×L3 vibeCode = (5×1) + (3×2) + (1×3) = 14 points
// Same for delegation
upgradePercentage = totalUpgradesOwned / 110;
```

**At 70% threshold:** 110 × 0.7 = **77 points needed**

**What 77 points looks like:**
- 14×L1 vibeCode + 14×L1 delegation = 28 points ❌ (too easy)
- Need strategic mid-level purchases
- ~7-8 total upgrades at various levels

**Prestige timing:** ~30-60 minutes (depending on strategy)

### Option B: Cost-Based Weighting

**Concept:** Weight upgrades proportional to their cost relative to level 1.

```typescript
// Calculate cost multiplier for each level
vibeCodeMultipliers = [1, 4, 16, 64, 256, 1024, 4096, 16384, 65536, 262144];
delegationMultipliers = [1, 5, 20, 80, 320, 1280, 5120, 20480, 81920, 327680];

totalUpgradesAvailable = sum of all multipliers for all levels;
totalUpgradesOwned = sum(multiplier × count for all owned upgrades);
```

**Calculation:**
```
VibeCode total = 1+4+16+64+256+1024+4096+16384+65536+262144 = ~349,525
Delegation total = 1+5+20+80+320+1280+5120+20480+81920+327680 = ~437,906
Total available = ~787,431 points
70% threshold = ~551,202 points
```

**What 551K points looks like:**
- 1×L10 vibeCode + 1×L10 delegation = 590,170 points ✅
- Just barely makes 70%!
- Or 100×L1 upgrades = 200 points ❌ (now worthless for prestige)

**Prestige timing:** ~2-4 hours (significant investment required)

### Option C: Tiered Progress (Simplified Cost Weighting)

**Concept:** Divide upgrades into tiers and weight each tier.

```typescript
const TIER_WEIGHTS = {
    tier1: [1, 2],      // x1 weight
    tier2: [3, 4],      // x2 weight  
    tier3: [5, 6],      // x4 weight
    tier4: [7, 8],      // x8 weight
    tier5: [9, 10]      // x16 weight
};
```

**Simplified approach:** Use 3 tiers
```typescript
const TIER_WEIGHTS = {
    low: [1, 2, 3, 4],     // levels 1-4, weight 1
    mid: [5, 6, 7],        // levels 5-7, weight 4
    high: [8, 9, 10]       // levels 8-10, weight 16
};
```

**At 70%:** More nuanced progression, still rewards high levels

### Option D: Hybrid Approach (Recommended)

**Concept:** Combine level sum with a cost floor to prevent low-level stacking.

```typescript
// Level sum, but each copy has minimum weight of 2 (instead of 1)
totalUpgradesAvailable = (2+3+4+...+11) × 2 = 65 × 2 = 130;
// Or: use actual level but with minimum contribution
```

**Alternative hybrid:**
```typescript
// Use cost multiplier but cap it (prevent one L10 dominating)
const cappedMultiplier = Math.min(16, baseMultiplier); // Max 16x
```

---

## New Prestige Points Formula

### User-Defined Formula

**Key Insight:** Prestige points should be tied to upgrade investment, not cash earned. This creates a cleaner progression system.

```typescript
// New formula
const thresholdValue = totalUpgradesAvailable * PRESTIGE.THRESHOLD_PERCENT; // 110 × 0.7 = 77
const prestigePoints = Math.floor(totalUpgradesOwned / thresholdValue);
const minimumPoints = Math.max(prestigePoints, PRESTIGE.MIN_POINTS);
```

**Points progression:**
| Upgrade Points | Threshold Multiplier | Prestige Points |
|----------------|---------------------|-----------------|
| 77 | 1× | 1 |
| 154 | 2× | 2 |
| 231 | 3× | 3 |
| 308 | 4× | 4 |
| 385 | 5× | 5 |

### Implementation

```typescript
// store.svelte.ts - New prestigePointsToEarn getter
get prestigePointsToEarn() {
    const thresholdValue = this.totalUpgradesAvailable * PRESTIGE.THRESHOLD_PERCENT;
    const rawPoints = Math.floor(this.totalUpgradesOwned / thresholdValue);
    return Math.max(rawPoints, PRESTIGE.MIN_POINTS);
}
```

### Why This Works

1. **Predictable:** Points = "how many thresholds have you exceeded"
2. **Minimum guarantee:** Always at least 1 point at threshold
3. **Scales with progression:** Early runs = 1 point, later runs = more points needed
4. **Tied to investment:** Upgrades directly determine points
5. **Tech tree synergy:** Players wait for 2+ points to unlock better tech tree nodes

### Migration: Removing Cash Tracking

Since prestige points are no longer based on cash:
- ✅ Remove `totalCashEarnedThisRun` tracking from prestige state
- ✅ Remove `trackCashEarned()` calls in game loop
- Simplifies code and removes unnecessary calculations

---

## Approved Solution

### Level Sum Weighting + Upgrade-Based Prestige Points

**Approach:** User-approved formula combining both changes.

**Key formulas:**

```typescript
// 1. Total available = (1+2+...+10) × 2 = 110
get totalUpgradesAvailable() {
    const sum1to10 = (10 * 11) / 2; // 55
    return sum1to10 * 2; // 110
}

// 2. Total owned = sum(level × count) for all upgrades
get totalUpgradesOwned() {
    let owned = 0;
    for (const level in this.gameState.upgrades.vibeCode) {
        owned += parseInt(level) * this.gameState.upgrades.vibeCode[level];
    }
    for (const level in this.gameState.upgrades.delegation) {
        owned += parseInt(level) * this.gameState.upgrades.delegation[level];
    }
    return owned;
}

// 3. Prestige points = floor(owned / threshold) with minimum 1
get prestigePointsToEarn() {
    const threshold = this.totalUpgradesAvailable * PRESTIGE.THRESHOLD_PERCENT; // 77
    const rawPoints = Math.floor(this.totalUpgradesOwned / threshold);
    return Math.max(rawPoints, PRESTIGE.MIN_POINTS); // Minimum 1
}
```

**Why this works:**
- Early game: Prestige at 77 upgrade-points → 1 point → Unlock tech tree
- Mid game: Wait for 154 upgrade-points → 2 points → Better nodes
- Late game: Aim for 231+ upgrade-points → 3+ points → Max efficiency
- Progression: Each run requires more investment for same points

---

## Migration Considerations

### Save Game Compatibility

The change affects derived values (`totalUpgradesOwned`), not stored state:
- ✅ No save migration needed
- ✅ Existing upgrades will automatically calculate with new formula
- ⚠️ Players who were close to prestige may need a few more upgrades

### Display Updates

- Update prestige UI to show new metric (e.g., "77 / 110 upgrade points")
- Consider renaming from "upgrades" to "upgrade investment" or similar

---

## Alternative: Cost-Sum Weighting (Advanced Option)

If you want even more realistic weighting, consider cost-based:

```typescript
// Calculate total cost to max all upgrades (one copy each)
const vibeCodeTotal = UPGRADES.vibeCode.reduce((sum, u) => sum + u.cost, 0); // ~20M
const delegationTotal = UPGRADES.delegation.reduce((sum, u) => sum + u.cost, 0); // ~50M
const totalMaxCost = vibeCodeTotal + delegationTotal; // ~70M

// Player's progress as percentage of max investment
const playerUpgradeCost = calculateTotalUpgradeCost();
const upgradePercentage = playerUpgradeCost / totalMaxCost;
```

**Pros:** Most accurate reflection of investment
**Cons:** Complex to display/understand; L10 dominates even more

**Not recommended for initial implementation.**

---

## Summary

| Aspect | Current | New (Approved) |
|--------|---------|----------------|
| Total value | 20 (count) | 110 (level sum) |
| Threshold | 14 upgrades | 77 upgrade-points |
| Prestige points | Cash-based (log10) | Upgrade-based (floor(points/threshold)) |
| Minimum points | 1 | 1 |
| Extra points | N/A | Every threshold beyond first |
| Prestige timing | ~10-15 min | ~30-60 min |

### New Prestige Points Formula

```
Points = floor(totalUpgradesOwned / (totalUpgradesAvailable × 0.7))
         Minimum 1

Examples:
- 77 upgrade-points = 1 point (first prestige)
- 154 upgrade-points = 2 points
- 231 upgrade-points = 3 points
```

### Key Changes Summary

1. **totalUpgradesAvailable:** `20` → `110` (sum of levels 1-10 × 2)
2. **totalUpgradesOwned:** Count of copies → Sum of (level × count)
3. **prestigePointsToEarn:** `log10(cash)` → `floor(upgrades / threshold)`
4. **Remove:** `totalCashEarnedThisRun` tracking (no longer needed)

### Next Steps

1. ✅ Plan reviewed and approved
2. Implement level sum weighting in [`store.svelte.ts`](src/lib/game/store.svelte.ts:365)
3. Update prestige points formula in [`store.svelte.ts`](src/lib/game/store.svelte.ts:392)
4. Remove `trackCashEarned()` calls and `totalCashEarnedThisRun`
5. Update prestige UI to show "upgrade-points" metric
6. Test and tune threshold percentage if needed

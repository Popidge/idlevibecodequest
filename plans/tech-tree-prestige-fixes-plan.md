# Implementation Plan: Tech Tree & Prestige Fixes

## Overview
This plan covers 6 main changes:
1. Fix UI display for debt-related tech tree effects
2. Fix connector color CSS variable inheritance
3. Fix effectiveDebtPenaltyFactor calculation with Code Zen precedence
4. Remove dead debt relief code
5. Apply prestige point multiplier to earned points
6. Apply starting cash bonus immediately and on new runs

---

## Change 1: TechTreeModal.svelte - Format Debt Effects as Negative

**File:** `src/lib/components/TechTreeModal.svelte`  
**Lines:** 37-39

### Current Code
```typescript
case 'debtAccumulationReduction':
case 'debtPenaltyMitigation':
    return `+${(value * 100).toFixed(0)}%`;
```

### New Code
```typescript
case 'debtAccumulationReduction':
case 'debtPenaltyMitigation':
    return `-${(value * 100).toFixed(0)}%`;
```

### Why
Debt reduction and mitigation effects reduce penalties, so displaying them as negative percentages (e.g., `-20%`) is clearer than `+20%`.

---

## Change 2: TechTreeModal.svelte - Fix Connector Color CSS Variable

**File:** `src/lib/components/TechTreeModal.svelte`  
**Lines:** 97-106

### Current Code
```svelte
<div class="node-wrapper">
    {#if index > 0}
        <div class="connector" class:purchased={previousPurchased}></div>
    {/if}
    <button
        class="node"
        class:purchased={isPurchased}
        class:available={canPurchase && !isPurchased}
        class:locked={isLocked}
        style="--node-color: {activeTree.color}"
        onclick={() => handlePurchase(activeTree.id, index)}
        disabled={isLocked || isPurchased}
    >
```

### New Code
```svelte
<div class="node-wrapper" style="--node-color: {activeTree.color}">
    {#if index > 0}
        <div class="connector" class:purchased={previousPurchased}></div>
    {/if}
    <button
        class="node"
        class:purchased={isPurchased}
        class:available={canPurchase && !isPurchased}
        class:locked={isLocked}
        onclick={() => handlePurchase(activeTree.id, index)}
        disabled={isLocked || isPurchased}
    >
```

### Why
The `--node-color` CSS variable was set on `.node` element but `.connector.purchased` tried to use it via `var(--node-color)`. CSS custom properties don't inherit from sibling elements, so the connector fell back to `#00ff00`. Moving the style to `.node-wrapper` parent ensures the variable is available to both the node and connector children.

---

## Change 3: store.svelte.ts - Fix effectiveDebtPenaltyFactor

**File:** `src/lib/game/store.svelte.ts`  
**Lines:** 1004-1037

### Current Code
```typescript
get effectiveDebtPenaltyFactor() {
    const basePenalty = Math.pow(1 - this.gameState.techDebt, 2);
    const mitigation = this.gameState.prestige?.bonuses.debtPenaltyMitigation ?? 0;

    // Legacy Whisperer and Code Zen: at high debt, penalty becomes bonus
    if (this.gameState.techDebt > 0.3 && mitigation > 0.3) {
        // Convert penalty to small bonus at high debt levels
        const bonusAtHighDebt = (this.gameState.techDebt - 0.3) * mitigation * 0.5;
        return Math.max(0.1, basePenalty - bonusAtHighDebt);
    }

    // Normal mitigation reduces the penalty
    return Math.max(0.1, basePenalty + (1 - basePenalty) * mitigation);
}
```

### New Code
```typescript
get effectiveDebtPenaltyFactor() {
    const basePenalty = Math.pow(1 - this.gameState.techDebt, 2);
    const mitigation = this.gameState.prestige?.bonuses.debtPenaltyMitigation ?? 0;

    // Check if Code Zen is purchased (learning tree node index 9)
    const hasCodeZen = this.getPurchasedNodes('learning').includes(9);

    // Check if Legacy Whisperer is purchased (learning tree node index 8)
    const hasLegacyWhisperer = this.getPurchasedNodes('learning').includes(8);

    // Code Zen: Takes reciprocal of penalty multiplier (turns penalty into bonus)
    // This takes precedence when both Code Zen and Legacy Whisperer are purchased
    if (hasCodeZen) {
        // If mitigation is 0.5, effective multiplier becomes 2.0
        return 1 / (1 - Math.min(mitigation, 0.99));
    }

    // Legacy Whisperer: Prevents all tech debt penalty (full income at any debt)
    if (hasLegacyWhisperer) {
        return 1.0;
    }

    // Normal mitigation reduces the penalty
    return Math.max(0.1, basePenalty + (1 - basePenalty) * mitigation);
}
```

### Why
- **Legacy Whisperer**: Prevents all debt penalty, allowing full income at any debt level
- **Code Zen**: Inverts the penalty mitigation into a bonus (higher debt = higher income)

---

## Change 4: store.svelte.ts - Remove Dead Debt Relief Code

**File:** `src/lib/game/store.svelte.ts`  
**Lines:** 764-774

### Current Code
```typescript
// Apply learning path debt relief BEFORE resetting techDebt
if (path === 'learning' && debtRelief > 0) {
    this.gameState.techDebt = Math.max(0, this.gameState.techDebt - debtRelief);
}

// Reset game state (preserve prestige data)
this.gameState.resources = { money: 0, loc: 0, cred: 0 };
this.gameState.upgrades = { vibeCode: {}, delegation: {} };
this.gameState.projects = { standard: {}, saas: {}, openSource: {} };
this.gameState.totalClicks = 0;
this.gameState.techDebt = 0;  // <-- Overwrites the debt relief above
this.gameState.projectsShipped = 0;
```

### New Code
```typescript
// Reset game state (preserve prestige data)
this.gameState.resources = { money: 0, loc: 0, cred: 0 };
this.gameState.upgrades = { vibeCode: {}, delegation: {} };
this.gameState.projects = { standard: {}, saas: {}, openSource: {} };
this.gameState.totalClicks = 0;
this.gameState.techDebt = 0;
this.gameState.projectsShipped = 0;
```

### Why
The debt relief calculation was dead code because it was immediately overwritten by `this.gameState.techDebt = 0`. Since the learning path already provides debt accumulation reduction and debt penalty mitigation bonuses, this pre-reset debt relief code was redundant.

---

## Change 5: store.svelte.ts - Apply Prestige Point Multiplier

### Current Code
```typescript
get prestigePointsToEarn() {
    // Formula: floor(log10(total cash + 1))
    const cash = this.gameState.prestige?.totalCashEarnedThisRun ?? this.gameState.resources.money;
    const points = Math.floor(Math.log10(cash + 1));
    return Math.max(points, PRESTIGE.MIN_POINTS);
}
```

### New Code
```typescript
get prestigePointsToEarn() {
    // Formula: floor(log10(total cash + 1))
    const cash = this.gameState.prestige?.totalCashEarnedThisRun ?? this.gameState.resources.money;
    const rawPoints = Math.floor(Math.log10(cash + 1));
    const basePoints = Math.max(rawPoints, PRESTIGE.MIN_POINTS);
    
    // Apply tech tree multiplier
    return Math.floor(basePoints * this.effectivePrestigePointMultiplier);
}
```

### Why
The `effectivePrestigePointMultiplier` getter exists but wasn't being used. This applies the tech tree bonus to actually increase earned prestige points.

---

## Change 6: store.svelte.ts - Starting Cash Immediate Application

**File:** `src/lib/game/store.svelte.ts`  
**Line:** ~927-970 (`applyTechTreeNodeEffect` method)

### Current Code
```typescript
case 'startingCash':
    bonuses.totalStartingCash += node.effectValue;
    break;
```

### New Code
```typescript
case 'startingCash':
    bonuses.totalStartingCash += node.effectValue;
    // Apply immediately to current resources if in a run
    if (this.gameState.prestige) {
        this.gameState.resources.money += node.effectValue;
    }
    break;
```

### Why
Tech tree nodes that give starting cash should immediately grant that cash during an active run, not just on prestige.

---

## Change 7: store.svelte.ts - Use effectiveStartingCashWithTechTree in performPrestige

**File:** `src/lib/game/store.svelte.ts`  
**Line:** ~774-775 (in `performPrestige` method)

### Current Code
```typescript
// Apply starting cash bonus
this.gameState.resources.money = startingCash;
```

### New Code
```typescript
// Apply starting cash bonus (prestige + tech tree accumulated bonuses)
this.gameState.resources.money = this.effectiveStartingCashWithTechTree;
```

### Why
The `effectiveStartingCashWithTechTree` getter sums prestige bonus + tech tree bonuses, but wasn't being used when seeding new runs. This ensures accumulated tech tree starting cash is applied.

---

## Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| TechTreeModal.svelte | Move --node-color to .node-wrapper | Connector uses active tree color |
| TechTreeModal.svelte | Debt effects show `-X%` | Better UI clarity |
| store.svelte.ts | effectiveDebtPenaltyFactor with node handling | Code Zen takes precedence over Legacy Whisperer |
| store.svelte.ts | prestigePointsToEarn uses multiplier | Tech tree prestige bonus actually works |
| store.svelte.ts | startingCash applies immediately | Players get cash when buying tech nodes |
| store.svelte.ts | performPrestige uses effectiveStartingCashWithTechTree | Tech tree starting cash carried to new runs |
| store.svelte.ts | Remove dead debt relief code | Cleanup unreachable code |

---

## Files to Modify

1. `src/lib/components/TechTreeModal.svelte`
2. `src/lib/game/store.svelte.ts`

## Testing Checklist

- [ ] Tech tree connector color matches active tree color
- [ ] Tech tree modal shows `-20%` for debt reduction effects
- [ ] Code Zen inverts penalty to bonus at high debt
- [ ] Legacy Whisperer prevents income penalty at high debt (when Code Zen not purchased)
- [ ] Prestige points are multiplied by tech tree bonus
- [ ] Starting cash tech nodes apply immediately
- [ ] New runs include accumulated starting cash from tech trees

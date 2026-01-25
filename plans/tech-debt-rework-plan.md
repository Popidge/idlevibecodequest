# Tech Debt Rework Implementation Plan

## Overview

Replace the complex exponential debt system with a simplified linear model that's easier to understand and balance.

## New Tech Debt Model

### Scale Change
- **Old**: `techDebt` as 0.00-0.50 (percentage as decimal)
- **New**: `techDebt` as 0.00-5000.00 (arbitrary units)
- **Display**: `(techDebt / 100).toFixed(2)%` → e.g., 2500 → "25.00%"

### Multiplier Formula

**Standard (non-Code Zen):**
```
debtMultiplier = 1 - [(techDebt / 10000) * (1 - techTreeMultiplier)]
```

| Tech Debt | Tree Multiplier | Multiplier |
|-----------|-----------------|------------|
| 0 | 0 | 1.00 |
| 2500 (25%) | 0 | 0.75 |
| 5000 (50%) | 0 | 0.50 |
| 2500 (25%) | 0.5 | 0.875 |
| 5000 (50%) | 1.0 | 1.00 (no penalty) |

**Code Zen (inverts):**
```
debtMultiplier = 1 + [(techDebt / 10000) * (1 - techTreeMultiplier)]
```

At 5000 debt with no tree: `1 + (0.5 * 1) = 1.50` → +50% bonus

### Accumulation Formula

**Per LoC generated (both active and passive):**
```
debtAccumulation = 1 * (1 - prestigeModifier)
```

Where `prestigeModifier = prestigePoints * 0.01` (max 1.0 at 100 points)

### Tech Tree Learning Path (10 nodes)

| Node | Index | Modifier Value | Cumulative | Effect |
|------|-------|----------------|------------|--------|
| Read the Docs | 0 | 0.1 | 0.1 | -10% accumulation |
| Rubber Duck | 1 | 0.1 | 0.2 | -20% accumulation |
| Pair Programming | 2 | 0.1 | 0.3 | -30% accumulation |
| Code Review | 3 | 0.1 | 0.4 | -40% accumulation |
| Tech Debt Sprint | 4 | 0.1 | 0.5 | -50% accumulation |
| Refactoring | 5 | 0.1 | 0.6 | -60% accumulation |
| Writing Tests | 6 | 0.1 | 0.7 | -70% accumulation |
| Architecture Patterns | 7 | 0.1 | 0.8 | -80% accumulation |
| Legacy Whisperer | 8 | 0.2 | 1.0 | Penalty = 0 (full income) |
| Code Zen | 9 | SPECIAL | SPECIAL | Inverts penalty to bonus |

**Node 9 (Code Zen) Logic:**
- If unlocked: `techTreeMultiplier = 0` (negates Node 8)
- Applies "Zen Mode" where high debt = bonus instead of penalty

### Debt Reduction (Clearing)

**LoC Cost:**
```
locCost = debtToRemove / 2
```
- Remove 1000 debt → costs 500 LoC

**Cash Cost:**
1. Find cheapest standard project (base LoC cost / reward)
2. Calculate LoC value: `locValue = loCost / reward`
3. Cash cost: `locCost * locValue`

**Example:**
- Todo App: 10 LoC → $5 reward → LoC value = 2
- Clear 1000 debt: 500 LoC cost → 500 × 2 = $1000

### Thresholds

| Threshold | Tech Debt Level | Display | Action |
|-----------|-----------------|---------|--------|
| Warning | 1000 | 10.00% | Show CLEAR button |
| Danger | 4000 | 40.00% | Red warning notification |

---

## Implementation Steps

### Step 1: Update Constants (`constants.ts`)

```typescript
export const TECH_DEBT = {
    MAX_LEVEL: 5000,              // New max debt level
    WARNING_THRESHOLD: 1000,      // Show clear button
    DANGER_THRESHOLD: 4000,       // Show warning
    BASE_ACCUMULATION: 1,         // 1 debt per LoC (before modifiers)
    PRESTIGE_MODIFIER_PER_POINT: 0.01,  // Each PP adds 0.01 to prestige modifier
    // Legacy Whisperer: techTreeMultiplier reaches 1.0
    // Code Zen: special flag that inverts penalty to bonus
} as const;
```

### Step 2: Update Types (`types.ts`)

```typescript
// Replace the old SystemModifiers debt fields
export interface SystemModifiers {
    // ... existing fields ...
    
    // New debt modifiers
    techTreeDebtMultiplier: number;     // 0-1 range from Learning tree
    prestigeDebtModifier: number;        // 0-1 range from prestige points
    unlockCodeZen: boolean;              // Inverts to bonus
}
```

### Step 3: Update Tech Tree Learning Path (`constants.ts`)

Replace the 10 nodes with new values:

```typescript
learning: {
    nodes: [
        { id: 'read_docs', modifiers: { techTreeDebtMultiplier: 0.1 } },
        { id: 'rubber_duck', modifiers: { techTreeDebtMultiplier: 0.2 } },
        { id: 'pair_prog', modifiers: { techTreeDebtMultiplier: 0.3 } },
        { id: 'code_review', modifiers: { techTreeDebtMultiplier: 0.4 } },
        { id: 'debt_sprint', modifiers: { techTreeDebtMultiplier: 0.5 } },
        { id: 'refactoring', modifiers: { techTreeDebtMultiplier: 0.6 } },
        { id: 'tests', modifiers: { techTreeDebtMultiplier: 0.7 } },
        { id: 'architecture', modifiers: { techTreeDebtMultiplier: 0.8 } },
        { id: 'legacy_whisperer', modifiers: { techTreeDebtMultiplier: 1.0 } },
        { id: 'code_zen', modifiers: { unlockCodeZen: true } }
    ]
}
```

### Step 4: Update Store (`store.svelte.ts`)

#### New getters:

```typescript
// Effective tech tree multiplier from purchased nodes
get effectiveTechTreeMultiplier() {
    return this.activeModifiers.techTreeDebtMultiplier;
}

// Effective prestige modifier from points spent
get effectivePrestigeModifier() {
    const points = this.gameState.prestige?.prestigePoints ?? 0;
    return Math.min(points * TECH_DEBT.PRESTIGE_MODIFIER_PER_POINT, 1.0);
}

// Debt accumulation per LoC generated
get effectiveDebtAccumulationPerLoc() {
    return TECH_DEBT.BASE_ACCUMULATION * (1 - this.effectivePrestigeModifier);
}

// Debt penalty multiplier (applies to cash/cred income)
get effectiveDebtMultiplier() {
    const mods = this.activeModifiers;
    
    if (mods.unlockCodeZen) {
        // Zen mode: high debt = bonus
        const debtRatio = this.gameState.techDebt / TECH_DEBT.MAX_LEVEL;
        const treeMod = 1 - (mods.techTreeDebtMultiplier ?? 0);
        return 1 + (debtRatio * treeMod);
    }
    
    const debtRatio = this.gameState.techDebt / TECH_DEBT.MAX_LEVEL;
    const treeMod = 1 - (mods.techTreeDebtMultiplier ?? 0);
    return 1 - (debtRatio * treeMod);
}

// LoC cost to reduce debt by given amount
getLocReductionCost(debtAmount: number) {
    return Math.floor(debtAmount / 2);
}

// Cash cost to reduce debt by given amount
getCashReductionCost(debtAmount: number) {
    // Find cheapest standard project's LoC value
    const cheapestProject = PROJECTS.standard[0]; // Todo App
    const locValue = cheapestProject.locCost / cheapestProject.reward;
    return Math.floor(this.getLocReductionCost(debtAmount) * locValue);
}
```

#### New accumulation methods:

```typescript
accumulateDebt(locGenerated: number) {
    const debtToAdd = locGenerated * this.effectiveDebtAccumulationPerLoc;
    this.gameState.techDebt = Math.min(
        this.gameState.techDebt + debtToAdd,
        TECH_DEBT.MAX_LEVEL
    );
}

// Call this in handlePromptClick and game loop
accumulateDebt(this.effectiveClickPower);
accumulateDebt(this.effectivePassiveLocRate);
```

#### Updated reduction method:

```typescript
reduceDebt(amount: number, paymentType: 'loc' | 'cash') {
    if (amount <= 0 || amount > this.gameState.techDebt) return false;
    
    const locCost = this.getLocReductionCost(amount);
    const cashCost = this.getCashReductionCost(amount);
    
    if (paymentType === 'loc') {
        if (this.gameState.resources.loc < locCost) return false;
        this.gameState.resources.loc -= locCost;
    } else {
        if (this.gameState.resources.money < cashCost) return false;
        this.gameState.resources.money -= cashCost;
    }
    
    this.gameState.techDebt -= amount;
    return true;
}
```

### Step 5: Update UI Components

#### StatsPanel.svelte

```svelte
<script>
    function formatDebtDisplay(debt: number): string {
        return (debt / 100).toFixed(2) + '%';
    }
    
    function getDebtClass(debt: number): string {
        if (debt >= 4000) return 'danger';
        if (debt >= 1000) return 'warning';
        return '';
    }
</script>

<div class="stat-row tech-debt-row" class:warning={debt >= 1000} class:danger={debt >= 4000}>
    <span class="stat-label">Tech Debt:</span>
    <div class="debt-container">
        <span class="debt-value">{formatDebtDisplay(store.gameState.techDebt)}</span>
        <span class="debt-multiplier">
            ×{(store.effectiveDebtMultiplier * 100).toFixed(0)}%
        </span>
    </div>
</div>
{#if store.gameState.techDebt >= 1000}
    <button class="clear-btn" onclick={openDebtModal}>CLEAR</button>
{/if}
```

#### DebtReductionModal.svelte

- Update to work with new scale (0-5000)
- Show reduction in "debt level" units
- Update quick select buttons
- Calculate costs using new formulas

---

## Migration Notes

### Save Compatibility

The new system uses a different scale for `techDebt`:
- Old saves: `techDebt` is 0-0.5 → multiply by 10000 for new scale
- Example: 0.25 → 2500

```typescript
// In loadGame():
if (typeof this.gameState.techDebt === 'number' && this.gameState.techDebt <= 0.5) {
    this.gameState.techDebt = this.gameState.techDebt * 10000;
}
```

### Preserving Projects Shipped

The old `projectsShipped` counter is no longer needed for debt calculations. Keep it for:
- Achievement tracking
- Potential future features

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/game/constants.ts` | Update TECH_DEBT, Learning tree nodes |
| `src/lib/game/types.ts` | Update SystemModifiers |
| `src/lib/game/store.svelte.ts` | All debt logic |
| `src/lib/components/StatsPanel.svelte` | Display updates |
| `src/lib/components/DebtReductionModal.svelte` | New reduction UI |
| `src/lib/components/HintsContainer.svelte` | Update thresholds |

---

## Testing Checklist

- [ ] Accumulation works per LoC (active)
- [ ] Accumulation works per LoC (passive/delegation)
- [ ] Prestige modifier reduces accumulation
- [ ] Tech tree nodes reduce accumulation
- [ ] Legacy Whisperer eliminates penalty
- [ ] Code Zen inverts to bonus
- [ ] Debt reduction costs are correct
- [ ] Cash cost calculation matches LoC value
- [ ] Display shows correct percentage
- [ ] Clear button appears at 1000
- [ ] Warning notification at 4000
- [ ] Save migration works correctly
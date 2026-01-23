# Phase 2: UI/UX Engagement Layer - Implementation Plan

## Overview
Phase 2 adds visual feedback and strategic guidance. Step 2.2 is already implemented. This plan covers Steps 2.1 and 2.3.

---

## Step 2.1: Progress Bar System

### Files to Create/Modify:
1. **`src/lib/components/ProgressBar.svelte`** (new component)
2. **`src/lib/components/StatsPanel.svelte`** (add progress bar)
3. **`src/lib/game/store.svelte.ts`** (add computed property for cheapest upgrade)

### Implementation Details:

#### 1. New Component: `ProgressBar.svelte`
```svelte
<script lang="ts">
  let { current, max, label } = $props();
  
  const progress = $derived(Math.min((current / max) * 100, 100));
</script>

<div class="progress-bar-container">
  <div class="progress-bar" style="width: {progress}%"></div>
  <span class="progress-text">{label}</span>
</div>

<style>
  .progress-bar-container {
    width: 130px;
    height: 16px;
    background: #1a1a1a;
    border: 1px solid #008800;
    position: relative;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #004400, #00ff00);
    transition: width 0.3s ease;
  }
  
  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 10px;
    font-family: 'Courier New', monospace;
    color: #00ff00;
    white-space: nowrap;
  }
</style>
```

#### 2. Store Updates
Add to `store.svelte.ts`:
```typescript
get cheapestUpgradeCost() {
  // Find the cheapest upgrade that the player can afford
  let cheapest = null;
  let minCost = Infinity;
  
  for (const type of ['vibeCode', 'delegation'] as const) {
    for (const upgrade of UPGRADES[type]) {
      if (upgrade.level <= this.maxUpgradeLevel) {
        const currentCount = this.gameState.upgrades[type][upgrade.level] || 0;
        const cost = getUpgradeCost(upgrade, currentCount);
        if (cost < minCost) {
          minCost = cost;
          cheapest = { type, level: upgrade.level, cost };
        }
      }
    }
  }
  
  return cheapest;
}
```

#### 3. StatsPanel Integration
Add progress bar below the tech debt section in StatsPanel.svelte, showing LoC progress toward the cheapest upgrade.

---

## Step 2.3: Strategic Hint System

### Files to Create/Modify:
1. **`src/lib/components/HintsContainer.svelte`** (new component)
2. **`src/lib/game/types.ts`** (add Hint type)
3. **`src/lib/game/store.svelte.ts`** (add hint state and logic)
4. **`src/App.svelte`** (include HintsContainer)

### Implementation Details:

#### 1. New Type in `types.ts`
```typescript
export interface Hint {
  id: number;
  message: string;
  condition: 'debtHigh' | 'debtLow' | 'prestigeSoon';
}
```

#### 2. Store Updates in `store.svelte.ts`
```typescript
hints = $state<Hint[]>([]);
hintCooldowns = $state<Set<number>>(new Set());

private checkAndAddHints() {
  // Check conditions and add hints if appropriate
  // - Debt >40%: "Tech debt high - consider clearing!"
  // - Debt <10%: "Debt low - good time to save LoC"
  // - Unlocks >60%: "Prestige available soon!"
}

dismissHint(id: number) {
  // Remove hint and set cooldown
}
```

#### 3. New Component: `HintsContainer.svelte`
```svelte
<script lang="ts">
  import { store } from '$lib/game/store.svelte';
  
  function dismissHint(id: number) {
    store.dismissHint(id);
  }
</script>

<div class="hints-container">
  {#each store.hints.slice(0, 2) as hint (hint.id)}
    <div class="hint" onclick={() => dismissHint(hint.id)}>
      💡 {hint.message}
    </div>
  {/each}
</div>

<style>
  .hints-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 100;
  }
  
  .hint {
    background: #1a1a1a;
    border: 1px solid #ffb000;
    color: #ffb000;
    padding: 8px 12px;
    font-size: 11px;
    font-family: 'Courier New', monospace;
    cursor: pointer;
    animation: slideIn 0.3s ease-out;
    max-width: 250px;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
</style>
```

---

## Implementation Order

1. **Create `ProgressBar.svelte`** component
2. **Update `store.svelte.ts`** with `cheapestUpgradeCost` computed property
3. **Add progress bar to `StatsPanel.svelte`**
4. **Add `Hint` type to `types.ts`**
5. **Update `store.svelte.ts`** with hint system logic
6. **Create `HintsContainer.svelte`** component
7. **Update `App.svelte`** to include HintsContainer
8. **Test both features**

---

## Acceptance Criteria Checklist

### Step 2.1: Progress Bars
- [ ] Progress bar appears below core stats
- [ ] Automatically tracks cheapest available upgrade
- [ ] Fills smoothly as LoC increases
- [ ] Reaches 100% when upgrade is affordable
- [ ] Updates target immediately after purchase

### Step 2.3: Strategic Hint System
- [ ] Hints appear based on game state conditions
- [ ] Maximum 2 hints visible simultaneously
- [ ] Hints are dismissible (click to hide)
- [ ] Auto-dismiss after 10 seconds
- [ ] Do not reappear for 60 seconds after dismissal

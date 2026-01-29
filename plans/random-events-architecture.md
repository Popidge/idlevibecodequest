# Random Event System Architecture Plan

## Overview

This document outlines the architectural design for expanding the random event system from simple "click-to-collect" rewards to interactive mini-games with various mechanics (reaction, timing, memory, typing, etc.).

---

## Current State Analysis

The existing system (`v0.5`) supports:
- Static event definitions (name, description, flat reward)
- Simple notification → modal → reward flow
- No interactivity or player skill component

**Goal**: Support 10+ distinct mini-game mechanics with a unified interface.

---

## 1. Event Type Taxonomy

Based on the event ideas, we can categorize mechanics into 6 core types:

| Category | Events | Core Input Pattern |
|----------|--------|-------------------|
| **Reaction** | Tweet Goes Viral, npm Speedrun, Context Window Crisis | Click targets as they appear |
| **Decision** | Merge Conflict Showdown, Dependabot PR Flood, Vercel Build Queue | Binary/categorical choices under time pressure |
| **Memory** | Rubber Duck Debugging | Sequence recall and reproduction |
| **Typing** | Mechanical Keyboard | Text input with accuracy/speed requirements |
| **Spotting** | Hallucination Hunt | Find and select specific items in content |
| **Pattern** | Live Pair Programming | Complete logical/coding patterns |

---

## 2. Type System Architecture

### 2.1 Base Event Types

```typescript
// src/lib/game/event-types.ts

// Discriminator for event mechanic types
export type EventMechanicType = 
  | 'reaction'      // Click targets as they appear
  | 'decision'      // Make quick binary/categorical choices
  | 'memory'        // Recall and reproduce sequences
  | 'typing'        // Type text accurately
  | 'spotting'      // Find items in content
  | 'pattern';      // Complete logical patterns

// Event difficulty tiers (affects rewards)
export type EventTier = 'common' | 'rare' | 'epic';

// Base interface shared by all events
export interface BaseRandomEvent {
  id: string;
  name: string;
  description: string;
  flavorText: string;        // Context/story text
  mechanic: EventMechanicType;
  tier: EventTier;
  duration: number;          // Time limit in seconds
  baseReward: EventReward;
}
```

### 2.2 Mechanic-Specific Configurations

Each mechanic has its own configuration shape:

```typescript
// REACTION: Click targets as they appear
export interface ReactionEvent extends BaseRandomEvent {
  mechanic: 'reaction';
  config: {
    spawnRate: number;       // Items per second
    spawnDuration: number;   // How long event lasts
    targetTypes: Array<{
      id: string;
      icon: string;
      score: number;         // Points for clicking
      isBad: boolean;        // Negative targets to avoid
    }>;
    targetRatio?: {          // Optional: spawn ratios
      good: number;
      bad: number;
    };
  };
}

// DECISION: Make quick choices
export interface DecisionEvent extends BaseRandomEvent {
  mechanic: 'decision';
  config: {
    rounds: number;          // Number of decisions
    timePerDecision: number; // Seconds per round
    decisions: Array<{
      prompt: string;
      options: Array<{
        id: string;
        label: string;
        icon?: string;
        isCorrect: boolean;
      }>;
    }>;
  };
}

// MEMORY: Recall sequences
export interface MemoryEvent extends BaseRandomEvent {
  mechanic: 'memory';
  config: {
    sequenceLength: number;  // Items to remember (5-7)
    displayTime: number;     // Seconds to show sequence
    items: string[];         // Pool of possible items (emojis/icons)
  };
}

// TYPING: Type text accurately
export interface TypingEvent extends BaseRandomEvent {
  mechanic: 'typing';
  config: {
    phrases: string[];       // Pool of phrases to type
    timeLimit: number;       // Seconds allowed
    accuracyThreshold: number; // 0-1, required accuracy %
  };
}

// SPOTTING: Find items in content
export interface SpottingEvent extends BaseRandomEvent {
  mechanic: 'spotting';
  config: {
    content: string;         // Text content to display
    targets: Array<{
      text: string;
      lineIndex: number;     // Which line it's on
      isHallucination: boolean;
    }>;
    timeLimit: number;
  };
}

// PATTERN: Complete logical patterns
export interface PatternEvent extends BaseRandomEvent {
  mechanic: 'pattern';
  config: {
    rounds: number;
    timePerRound: number;
    patterns: Array<{
      display: string;       // e.g., "[1, 2, 4, 8, ?]"
      options: string[];     // 3 choices
      correctIndex: number;
    }>;
  };
}

// Union type for all event configurations
export type RandomEventConfig = 
  | ReactionEvent 
  | DecisionEvent 
  | MemoryEvent 
  | TypingEvent 
  | SpottingEvent 
  | PatternEvent;
```

### 2.3 Reward System

```typescript
// Reward types that can be granted
export type RewardType = 
  | 'cash'           // Flat money
  | 'loc'            // Flat LoC
  | 'cred'           // Flat cred
  | 'cashMultiplier' // Temporary multiplier
  | 'locMultiplier'  // Temporary multiplier  
  | 'credMultiplier' // Temporary multiplier
  | 'locPerClick'    // Temporary boost
  | 'passiveLoc';    // Temporary boost

export interface EventReward {
  type: RewardType;
  baseValue: number;
  scaling: 'flat' | 'performance' | 'tiered';
  duration?: number;  // For temporary buffs (seconds)
}

// Performance-based reward calculation
export interface EventOutcome {
  score: number;           // Raw score from gameplay
  maxPossible: number;     // Perfect score
  percentage: number;      // 0-1 performance
  reward: {
    type: RewardType;
    value: number;
    duration?: number;
  };
}
```

### 2.4 Event State Management

```typescript
// State for the event system
export interface ActiveEventState {
  // Event identification
  eventId: string;
  mechanic: EventMechanicType;
  startTime: number;
  
  // Timer
  timeRemaining: number;
  isPaused: boolean;
  
  // Gameplay state (mechanic-specific)
  gameplay: ReactionState | DecisionState | MemoryState | TypingState | SpottingState | PatternState;
  
  // Outcome
  outcome: EventOutcome | null;
  status: 'active' | 'completed' | 'failed' | 'abandoned';
}

// Example: Reaction mechanic state
export interface ReactionState {
  targets: Array<{
    id: string;
    type: string;
    x: number;           // Position %
    y: number;
    spawnedAt: number;
    clicked?: boolean;
  }>;
  score: number;
  clicksGood: number;
  clicksBad: number;
  missed: number;
}

// Example: Memory mechanic state
export interface MemoryState {
  phase: 'showing' | 'input' | 'complete';
  sequence: string[];      // The correct sequence
  playerSequence: string[]; // What player has entered
  attempts: number;
}
```

---

## 3. Component Architecture

### 3.1 Event Modal Router

Replace the single `RandomEventModal` with a router pattern:

```
RandomEventContainer (manages lifecycle, timer, rewards)
├── EventHeader (name, description, timer display)
├── EventContent (dynamic based on mechanic)
│   ├── ReactionGame
│   ├── DecisionGame
│   ├── MemoryGame
│   ├── TypingGame
│   ├── SpottingGame
│   └── PatternGame
└── EventFooter (abandon button, score display)
```

### 3.2 Generic Event Handler Interface

```typescript
// All mini-game components implement this
export interface EventHandler {
  // Initialize with event config
  initialize(config: RandomEventConfig): void;
  
  // Get current score/state
  getState(): EventGameplayState;
  
  // Called when timer expires
  onTimeUp(): void;
  
  // Calculate final outcome
  calculateOutcome(): EventOutcome;
}

// Props for all game components
export interface EventGameProps {
  config: RandomEventConfig;
  timeRemaining: number;
  onScoreUpdate: (score: number) => void;
  onComplete: (outcome: EventOutcome) => void;
}
```

### 3.3 Component Inventory

| Component | Responsibility | Key Features |
|-----------|---------------|--------------|
| `EventContainer` | Lifecycle, timer, reward calc | Pause on blur, cleanup, outcome routing |
| `ReactionGame` | Spawn/animate targets, track clicks | CSS animations, collision detection |
| `DecisionGame` | Present choices, validate answers | Progress through rounds, visual feedback |
| `MemoryGame` | Show/hide sequence, validate input | Animation timing, attempt tracking |
| `TypingGame` | Text input, accuracy calc | Real-time validation, WPM tracking |
| `SpottingGame` | Highlightable text, target tracking | Line-based layout, selection state |
| `PatternGame` | Display patterns, option selection | Code-themed visuals, instant feedback |

---

## 4. Store Integration

### 4.1 Event Store Module

Extend `store.svelte.ts` with event management:

```typescript
// Event-related state (add to GameStore)
class GameStore {
  // Existing...
  
  // Event system state
  activeEvent = $state<ActiveEventState | null>(null);
  showEventModal = $state(false);
  
  // Temporary buffs (for reward application)
  activeBuffs = $state<Array<{
    id: string;
    type: RewardType;
    value: number;
    expiresAt: number;
  }}>();
  
  // Computed: Current multipliers from buffs
  eventMultipliers = $derived.by(() => {
    const now = Date.now();
    const active = this.activeBuffs.filter(b => b.expiresAt > now);
    
    return {
      cash: 1 + active.filter(b => b.type === 'cashMultiplier').reduce((s, b) => s + b.value, 0),
      loc: 1 + active.filter(b => b.type === 'locMultiplier').reduce((s, b) => s + b.value, 0),
      cred: 1 + active.filter(b => b.type === 'credMultiplier').reduce((s, b) => s + b.value, 0),
      locPerClick: active.filter(b => b.type === 'locPerClick').reduce((s, b) => s + b.value, 0),
      passiveLoc: active.filter(b => b.type === 'passiveLoc').reduce((s, b) => s + b.value, 0),
    };
  });
  
  // Methods
  triggerEvent(): void;
  startEvent(eventId: string): void;
  completeEvent(outcome: EventOutcome): void;
  abandonEvent(): void;
  cleanupExpiredBuffs(): void;
}
```

### 4.2 Reward Integration

Modify existing getters to include event buffs:

```typescript
// In GameStore
get effectiveClickPower() {
  const base = this.baseClickPower;
  const flatBonus = base * this.activeModifiers.locPerClickFlat;
  const locMultiplier = this.effectiveLocMultiplier * this.eventMultipliers.loc;
  const eventClickBonus = this.eventMultipliers.locPerClick;
  
  return Math.floor((base + flatBonus + eventClickBonus) * locMultiplier);
}
```

---

## 5. Event Configuration Data

### 5.1 Event Registry

```typescript
// src/lib/game/events/index.ts
export const EVENT_REGISTRY: RandomEventConfig[] = [
  // === REACTION EVENTS ===
  {
    id: 'viral-tweet',
    name: 'Tweet Goes Viral',
    description: 'Your hot take is blowing up! Ride the engagement wave.',
    flavorText: '"why tests are just vibes" - 12.5K likes and climbing...',
    mechanic: 'reaction',
    tier: 'rare',
    duration: 20,
    baseReward: { type: 'credMultiplier', baseValue: 0.5, scaling: 'performance', duration: 60 },
    config: {
      spawnRate: 2,
      spawnDuration: 20,
      targetTypes: [
        { id: 'heart', icon: '❤️', score: 10, isBad: false },
        { id: 'retweet', icon: '🔁', score: 15, isBad: false },
        { id: 'ratio', icon: '💀', score: -20, isBad: true },
      ],
      targetRatio: { good: 0.7, bad: 0.3 }
    }
  },
  
  {
    id: 'npm-speedrun',
    name: 'npm install Speedrun',
    description: 'Someone deleted node_modules. Reinstall everything!',
    flavorText: 'The team is watching. No pressure.',
    mechanic: 'reaction',
    tier: 'common',
    duration: 15,
    baseReward: { type: 'passiveLoc', baseValue: 5, scaling: 'performance', duration: 60 },
    config: {
      spawnRate: 3,
      spawnDuration: 15,
      targetTypes: [
        { id: 'package', icon: '📦', score: 10, isBad: false },
      ]
    }
  },
  
  // === DECISION EVENTS ===
  {
    id: 'merge-conflict',
    name: 'Merge Conflict Showdown',
    description: 'Git says you and an AI agent both edited the same file.',
    flavorText: 'Only one version survives.',
    mechanic: 'decision',
    tier: 'rare',
    duration: 18,
    baseReward: { type: 'locMultiplier', baseValue: 0.3, scaling: 'tiered', duration: 45 },
    config: {
      rounds: 5,
      timePerDecision: 3,
      decisions: [
        {
          prompt: 'Choose the cleaner implementation:',
          options: [
            { id: 'head', label: 'HEAD: if (x === true)', isCorrect: true },
            { id: 'theirs', label: 'THEIRS: if (!!x == true)', isCorrect: false }
          ]
        },
        // More decisions...
      ]
    }
  },
  
  // === MEMORY EVENTS ===
  {
    id: 'rubber-duck',
    name: 'Rubber Duck Debugging',
    description: 'Explain the problem to the duck. Remember your thought process.',
    flavorText: "The duck said nothing, but you're starting to understand...",
    mechanic: 'memory',
    tier: 'epic',
    duration: 20,
    baseReward: { type: 'loc', baseValue: 1000, scaling: 'performance' },
    config: {
      sequenceLength: 6,
      displayTime: 3,
      items: ['💭', '🐛', '🔍', '⚡', '💡', '🎯', '🧩']
    }
  },
  
  // === TYPING EVENTS ===
  {
    id: 'mech-keyboard',
    name: 'Mechanical Keyboard Arrived',
    description: 'Your new Keychron just landed. Test those tactile browns!',
    flavorText: 'Clacky keys, happy fingers.',
    mechanic: 'typing',
    tier: 'common',
    duration: 10,
    baseReward: { type: 'locPerClick', baseValue: 2, scaling: 'performance', duration: 60 },
    config: {
      phrases: [
        'console.log("it works on my machine")',
        'git push --force-with-lease',
        'npm install --legacy-peer-deps',
        'TODO: fix this later'
      ],
      timeLimit: 10,
      accuracyThreshold: 0.9
    }
  },
  
  // === PATTERN EVENTS ===
  {
    id: 'pair-programming',
    name: 'Live Pair Programming',
    description: "A YouTuber invited you on stream. Don't fumble the bag.",
    flavorText: '300K viewers are watching you code.',
    mechanic: 'pattern',
    tier: 'epic',
    duration: 25,
    baseReward: { type: 'cash', baseValue: 5000, scaling: 'tiered' },
    config: {
      rounds: 4,
      timePerRound: 5,
      patterns: [
        {
          display: '[1, 2, 4, 8, ?]',
          options: ['12', '16', '10'],
          correctIndex: 1
        },
        {
          display: 'const [a, b] = [1, ?]',
          options: ['2', 'null', 'undefined'],
          correctIndex: 0
        }
      ]
    }
  }
];
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Infrastructure)
1. Create `src/lib/game/event-types.ts` with all type definitions
2. Create `src/lib/game/events/index.ts` with event registry
3. Extend store with event state management
4. Create base `EventContainer` component

### Phase 2: Core Mechanics
1. Implement `ReactionGame` component (supports Tweet, npm, Context Window)
2. Implement `DecisionGame` component (supports Merge Conflict, Dependabot, Vercel)
3. Add reward calculation and buff system

### Phase 3: Advanced Mechanics
1. Implement `MemoryGame` (Rubber Duck)
2. Implement `TypingGame` (Mechanical Keyboard)
3. Implement `PatternGame` (Pair Programming)
4. Implement `SpottingGame` (Hallucination Hunt)

### Phase 4: Polish
1. Add animations and visual feedback
2. Mobile responsiveness for all mini-games
3. Sound effects (optional)
4. Event statistics tracking

---

## 7. File Structure

```
src/lib/
├── game/
│   ├── event-types.ts          # All event type definitions
│   ├── events/
│   │   ├── index.ts            # Event registry + lookup
│   │   ├── reaction.ts         # Reaction event configs
│   │   ├── decision.ts         # Decision event configs
│   │   ├── memory.ts           # Memory event configs
│   │   ├── typing.ts           # Typing event configs
│   │   ├── spotting.ts         # Spotting event configs
│   │   └── pattern.ts          # Pattern event configs
│   └── store.svelte.ts         # Extended with event state
└── components/events/
    ├── EventContainer.svelte   # Main modal container
    ├── EventTimer.svelte       # Countdown timer display
    ├── EventScore.svelte       # Score/combo display
    ├── games/
    │   ├── ReactionGame.svelte
    │   ├── DecisionGame.svelte
    │   ├── MemoryGame.svelte
    │   ├── TypingGame.svelte
    │   ├── SpottingGame.svelte
    │   └── PatternGame.svelte
    └── shared/
        ├── GameButton.svelte
        ├── Target.svelte
        └── TimerBar.svelte
```

---

## 8. Key Design Decisions

### 8.1 Discriminated Unions for Type Safety
Using `mechanic` as a discriminant allows TypeScript to narrow types:

```typescript
function handleEvent(event: RandomEventConfig) {
  switch (event.mechanic) {
    case 'reaction':
      // TypeScript knows event.config has targetTypes
      return renderReactionGame(event.config);
    case 'memory':
      // TypeScript knows event.config has sequenceLength
      return renderMemoryGame(event.config);
  }
}
```

### 8.2 Centralized Reward Calculation
Rewards are calculated in the store, not individual components, ensuring consistency:

```typescript
// In store
calculateReward(outcome: EventOutcome, baseReward: EventReward): number {
  switch (baseReward.scaling) {
    case 'flat': return baseReward.baseValue;
    case 'performance': return baseReward.baseValue * outcome.percentage;
    case 'tiered': 
      if (outcome.percentage >= 0.9) return baseReward.baseValue * 2;
      if (outcome.percentage >= 0.7) return baseReward.baseValue;
      return baseReward.baseValue * 0.5;
  }
}
```

### 8.3 Buff Expiration
Buffs are stored with `expiresAt` timestamps and cleaned up periodically:

```typescript
// Called in game loop
cleanupExpiredBuffs() {
  const now = Date.now();
  this.activeBuffs = this.activeBuffs.filter(b => b.expiresAt > now);
}
```

---

## 9. Summary

This architecture provides:

1. **Type Safety**: Discriminated unions ensure correct config shapes per mechanic
2. **Extensibility**: New events = add to registry + config file
3. **Reusability**: Shared components for common UI patterns
4. **Testability**: Pure calculation functions separate from UI
5. **Performance**: Svelte 5 runes for reactive state management

The unified interface allows any developer to add new events by:
1. Defining the event in the appropriate config file
2. (Optional) Creating a new mechanic component if needed
3. Registering the event in the registry

All existing events (Bug Bounty, etc.) can be migrated to the new system as simple `decision` or `reaction` events with minimal configuration.

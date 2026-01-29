// Idle Vibe Code Quest - Random Event System Types (v0.6)
// Interactive mini-game event system with unified architecture

import type { Resources } from './types';

// ========================================
// Core Event Mechanic Types
// ========================================

export type EventMechanicType = 'decision' | 'reaction' | 'memory' | 'typing' | 'spotting' | 'pattern';

// Lifecycle states for an active event
export type EventLifecycleState = 'notifying' | 'active' | 'completed' | 'failed' | 'abandoned';

// ========================================
// Reward System
// ========================================

export type RewardType =
    | 'cash'           // Immediate cash grant
    | 'loc'            // Immediate LoC grant
    | 'cred'           // Immediate cred grant
    | 'cashMultiplier'      // Temporary cash multiplier buff
    | 'locMultiplier'       // Temporary LoC multiplier buff
    | 'credMultiplier'      // Temporary cred multiplier buff
    | 'locPerClick'         // Temporary LoC/click boost
    | 'passiveLocRate'      // Temporary passive LoC/sec boost
    | 'delegationMultiplier'; // Temporary delegation efficiency

export type RewardScalingMode = 'flat' | 'performance' | 'tiered';

export interface EventReward {
    type: RewardType;
    baseAmount: number;           // Base reward amount
    scalingMode: RewardScalingMode;
    // For tiered rewards: thresholds [0.9, 0.7, 0.5] = 2x, 1x, 0.5x
    tiers?: { threshold: number; multiplier: number }[];
    // Duration in seconds for temporary buffs (0 = permanent/immediate)
    duration?: number;
}

// Active buff tracking
export interface ActiveBuff {
    id: string;                   // Unique buff instance ID
    sourceEventId: string;        // Which event granted this
    type: RewardType;
    multiplier: number;           // Actual multiplier applied
    expiresAt: number;            // Timestamp when buff expires
    name: string;                 // Display name
}

// ========================================
// Event Configuration - Base Interface
// ========================================

export interface BaseRandomEvent {
    id: string;
    name: string;
    description: string;
    mechanic: EventMechanicType;
    // Notification settings
    notificationDuration: number;  // Seconds to show notification before auto-dismiss
    // Rewards configuration
    rewards: EventReward[];
    // Metadata
    difficulty: 'easy' | 'medium' | 'hard';
    cooldownAfterComplete: number;  // Seconds before another event can trigger
    tags: string[];  // For filtering/categorization
}

// ========================================
// Mechanic-Specific Configurations
// ========================================

// DECISION: Simple choice-based events (legacy events fit here)
export interface DecisionEvent extends BaseRandomEvent {
    mechanic: 'decision';
    config: {
        // Legacy events have no interaction - just accept/decline
        isLegacy: boolean;
        // For future: multiple choice questions
        choices?: {
            id: string;
            text: string;
            isCorrect: boolean;
        }[];
        // Time limit to make decision (0 = no limit)
        timeLimit?: number;
    };
}

// REACTION: Click targets as they appear
export interface ReactionEvent extends BaseRandomEvent {
    mechanic: 'reaction';
    config: {
        duration: number;           // Total game duration in seconds
        spawnRate: number;          // Items per second spawn rate
        targetTypes: {
            id: string;
            emoji: string;
            score: number;          // Points for clicking
            isGood: boolean;        // Good targets give points, bad ones subtract
            weight: number;         // Spawn weight (relative frequency)
        }[];
        spawnArea: {
            width: number;          // Percentage of container width (0-100)
            height: number;         // Percentage of container height (0-100)
        };
    };
}

// MEMORY: Sequence recall games
export interface MemoryEvent extends BaseRandomEvent {
    mechanic: 'memory';
    config: {
        sequenceLength: number;     // Number of items to remember
        displayTime: number;        // Seconds to show sequence
        itemPool: {
            id: string;
            emoji: string;
            label: string;
        }[];
    };
}

// TYPING: Text input challenges
export interface TypingEvent extends BaseRandomEvent {
    mechanic: 'typing';
    config: {
        phrases: {
            text: string;
            difficulty: 'easy' | 'medium' | 'hard';
        }[];
        timeLimit: number;          // Seconds to type
        accuracyThreshold: number;  // Required accuracy (0-1)
        speedBonusThreshold?: number; // WPM for speed bonus
    };
}

// SPOTTING: Find items in content
export interface SpottingEvent extends BaseRandomEvent {
    mechanic: 'spotting';
    config: {
        content: string;            // The text/code to display
        hallucinations: {
            line: number;           // Line number (1-indexed)
            text: string;           // The text that appears on that line
            isHallucination: boolean;
        }[];
        timeLimit: number;
    };
}

// PATTERN: Complete logical patterns
export interface PatternEvent extends BaseRandomEvent {
    mechanic: 'pattern';
    config: {
        rounds: number;
        timePerRound: number;
        patterns: {
            sequence: string[];     // Visual sequence
            options: string[];      // Answer options
            correctIndex: number;
        }[];
    };
}

// Union type for all event configurations
export type RandomEventConfig =
    | DecisionEvent
    | ReactionEvent
    | MemoryEvent
    | TypingEvent
    | SpottingEvent
    | PatternEvent;

// ========================================
// Active Event State (Runtime)
// ========================================

export interface ActiveEventState {
    eventId: string;
    config: RandomEventConfig;
    state: EventLifecycleState;
    startedAt: number;            // Timestamp
    expiresAt: number;            // When notification expires
    
    // Game-specific state (populated when state becomes 'active')
    gameState?: {
        score: number;
        maxPossibleScore: number;
        timeRemaining: number;
        // Mechanic-specific data
        data: unknown;
    };
    
    // Results (populated when completed/failed)
    results?: {
        success: boolean;
        score: number;
        maxScore: number;
        percentage: number;
        rewardsEarned: { reward: EventReward; actualAmount: number }[];
    };
}

// ========================================
// Event Registry
// ========================================

export interface EventRegistry {
    events: Map<string, RandomEventConfig>;
    getEvent(id: string): RandomEventConfig | undefined;
    getAllEvents(): RandomEventConfig[];
    getEventsByMechanic(mechanic: EventMechanicType): RandomEventConfig[];
    getRandomEvent(): RandomEventConfig;
}

// ========================================
// Component Props Interfaces
// ========================================

export interface EventContainerProps {
    eventState: ActiveEventState;
    onComplete: (results: ActiveEventState['results']) => void;
    onFail: (reason: string) => void;
    onAbandon: () => void;
}

export interface EventGameProps {
    config: RandomEventConfig;
    onScoreUpdate: (score: number, maxScore: number) => void;
    onComplete: (score: number, maxScore: number, data?: unknown) => void;
    onFail: (reason: string) => void;
}

// ========================================
// Legacy Migration Support
// ========================================

// Old event format (v0.5)
export interface LegacyRandomEvent {
    id: string;
    name: string;
    description: string;
    reward: number;
}

// Helper to convert legacy events to new format
export function migrateLegacyEvent(legacy: LegacyRandomEvent): DecisionEvent {
    return {
        id: legacy.id,
        name: legacy.name,
        description: legacy.description,
        mechanic: 'decision',
        notificationDuration: 30,
        rewards: [
            {
                type: 'cash',
                baseAmount: legacy.reward,
                scalingMode: 'flat'
            }
        ],
        difficulty: 'easy',
        cooldownAfterComplete: 60,
        tags: ['legacy', 'simple'],
        config: {
            isLegacy: true
        }
    };
}

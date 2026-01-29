// Idle Vibe Code Quest - Random Event Registry
// Event definitions migrated from constants.ts with new interactive system

import type {
    RandomEventConfig,
    DecisionEvent,
    EventReward,
    RewardType
} from './event-types';

import {
    VIRAL_TWEET_EVENT,
    NPM_SPEEDRUN_EVENT,
    CONTEXT_WINDOW_EVENT
} from './events/reaction';

import {
    MERGE_CONFLICT_EVENT,
    DEPENDABOT_FLOOD_EVENT,
    VERCEL_BUILD_QUEUE_EVENT
} from './events/decision';

import { RUBBER_DUCK_EVENT } from './events/memory';

import { MECH_KEYBOARD_EVENT, STACK_OVERFLOW_EVENT } from './events/typing';

import { PAIR_PROGRAMMING_EVENT, ALGORITHM_CHALLENGE_EVENT } from './events/pattern';

import { HALLUCINATION_HUNT_EVENT, CODE_REVIEW_EVENT } from './events/spotting';

// ========================================
// Legacy Events (Migrated from v0.5)
// Keeping ONE legacy event as requested - "Bug Bounty" fits best as it's thematic
// ========================================

const LEGACY_EVENT: DecisionEvent = {
    id: 'bounty',
    name: 'Bug Bounty',
    description: 'A critical bug was found in production! The client is offering a bounty for a quick fix.',
    mechanic: 'decision',
    notificationDuration: 30,
    difficulty: 'easy',
    cooldownAfterComplete: 60,
    tags: ['legacy', 'simple', 'cash'],
    rewards: [
        {
            type: 'cash',
            baseAmount: 1000,
            scalingMode: 'flat'
        }
    ],
    config: {
        isLegacy: true
    }
};

// ========================================
// Event Registry
// ========================================

class EventRegistryImpl {
    private events = new Map<string, RandomEventConfig>();

    constructor() {
        // Register all events
        this.registerEvent(LEGACY_EVENT);
        
        // === REACTION EVENTS ===
        this.registerEvent(VIRAL_TWEET_EVENT);
        this.registerEvent(NPM_SPEEDRUN_EVENT);
        this.registerEvent(CONTEXT_WINDOW_EVENT);
        
        // === DECISION EVENTS ===
        this.registerEvent(MERGE_CONFLICT_EVENT);
        this.registerEvent(DEPENDABOT_FLOOD_EVENT);
        this.registerEvent(VERCEL_BUILD_QUEUE_EVENT);
        
        // === MEMORY EVENTS ===
        this.registerEvent(RUBBER_DUCK_EVENT);
        
        // === TYPING EVENTS ===
        this.registerEvent(MECH_KEYBOARD_EVENT);
        this.registerEvent(STACK_OVERFLOW_EVENT);
        
        // === PATTERN EVENTS ===
        this.registerEvent(PAIR_PROGRAMMING_EVENT);
        this.registerEvent(ALGORITHM_CHALLENGE_EVENT);
        
        // === SPOTTING EVENTS ===
        this.registerEvent(HALLUCINATION_HUNT_EVENT);
        this.registerEvent(CODE_REVIEW_EVENT);
    }

    registerEvent(event: RandomEventConfig): void {
        if (this.events.has(event.id)) {
            console.warn(`Event with id '${event.id}' already exists. Overwriting.`);
        }
        this.events.set(event.id, event);
    }

    getEvent(id: string): RandomEventConfig | undefined {
        return this.events.get(id);
    }

    getAllEvents(): RandomEventConfig[] {
        return Array.from(this.events.values());
    }

    getEventsByTag(tag: string): RandomEventConfig[] {
        return this.getAllEvents().filter(e => e.tags.includes(tag));
    }

    getEventsByMechanic(mechanic: string): RandomEventConfig[] {
        return this.getAllEvents().filter(e => e.mechanic === mechanic);
    }

    getRandomEvent(): RandomEventConfig {
        const allEvents = this.getAllEvents();
        const index = Math.floor(Math.random() * allEvents.length);
        return allEvents[index];
    }

    // Debug method to trigger specific event
    triggerEventById(id: string): RandomEventConfig | null {
        const event = this.getEvent(id);
        if (!event) {
            console.warn(`Event '${id}' not found in registry`);
            return null;
        }
        return event;
    }
}

// Singleton instance
export const EVENT_REGISTRY = new EventRegistryImpl();

// ========================================
// Legacy Export (for backward compatibility during migration)
// ========================================

// Empty array - legacy events now in registry
export const RANDOM_EVENTS: RandomEventConfig[] = [];

// Event configuration constants
export const RANDOM_EVENT_CONFIG = {
    TRIGGER_CHANCE: 300,       // 1 in 300 chance per second
    NOTIFICATION_DURATION: 30, // Show notification for 30 seconds (legacy default)
    COOLDOWN_DURATION: 60      // Cooldown for 60 seconds after event ends
} as const;

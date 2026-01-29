// Reaction Event Configurations
// Click targets as they appear - for Tweet Goes Viral, npm Speedrun, etc.

import type { ReactionEvent } from '../event-types';

export const VIRAL_TWEET_EVENT: ReactionEvent = {
    id: 'viral-tweet',
    name: 'Tweet Goes Viral',
    description: 'Your hot take on "why tests are just vibes" is blowing up. Ride the engagement wave!',
    mechanic: 'reaction',
    notificationDuration: 20,
    difficulty: 'medium',
    cooldownAfterComplete: 120,
    tags: ['viral', 'social', 'cred'],
    rewards: [
        {
            type: 'credMultiplier',
            baseAmount: 0.5,  // +50% cred for duration
            scalingMode: 'performance',
            duration: 60
        }
    ],
    config: {
        duration: 20,  // 20 seconds
        spawnRate: 2.5,  // 2.5 items per second
        targetTypes: [
            { id: 'heart', emoji: '❤️', score: 10, isGood: true, weight: 40 },
            { id: 'retweet', emoji: '🔁', score: 15, isGood: true, weight: 25 },
            { id: 'reply', emoji: '💬', score: 5, isGood: true, weight: 20 },
            { id: 'ratio', emoji: '💀', score: -20, isGood: false, weight: 15 }
        ],
        spawnArea: {
            width: 90,
            height: 80
        }
    }
};

export const NPM_SPEEDRUN_EVENT: ReactionEvent = {
    id: 'npm-speedrun',
    name: 'npm install Speedrun',
    description: 'Someone deleted node_modules. Again. Reinstall everything before the team notices!',
    mechanic: 'reaction',
    notificationDuration: 15,
    difficulty: 'easy',
    cooldownAfterComplete: 90,
    tags: ['npm', 'speedrun', 'passive'],
    rewards: [
        {
            type: 'passiveLocRate',
            baseAmount: 5,  // +5 LoC/sec for duration
            scalingMode: 'performance',
            duration: 60
        }
    ],
    config: {
        duration: 15,  // 15 seconds
        spawnRate: 3,  // 3 packages per second (faster!)
        targetTypes: [
            { id: 'package', emoji: '📦', score: 10, isGood: true, weight: 70 },
            { id: 'large-package', emoji: '📦', score: 25, isGood: true, weight: 20 },  // Bigger packages
            { id: 'error', emoji: '❌', score: -15, isGood: false, weight: 10 }  // Network errors
        ],
        spawnArea: {
            width: 95,
            height: 85
        }
    }
};

export const CONTEXT_WINDOW_EVENT: ReactionEvent = {
    id: 'context-window',
    name: 'Context Window Crisis',
    description: 'Your AI assistant is running out of context. Compress the prompt before it forgets everything!',
    mechanic: 'reaction',
    notificationDuration: 15,
    difficulty: 'medium',
    cooldownAfterComplete: 100,
    tags: ['ai', 'compression', 'efficiency'],
    rewards: [
        {
            type: 'locPerClick',
            baseAmount: 3,  // +3 LoC per click for duration
            scalingMode: 'performance',
            duration: 45
        }
    ],
    config: {
        duration: 15,
        spawnRate: 2,
        targetTypes: [
            { id: 'redundant', emoji: '🗑️', score: 15, isGood: true, weight: 50 },  // Remove redundant words
            { id: 'verbose', emoji: '✂️', score: 10, isGood: true, weight: 35 },    // Cut verbose phrases
            { id: 'essential', emoji: '🔒', score: -25, isGood: false, weight: 15 }  // Don't remove essential context!
        ],
        spawnArea: {
            width: 85,
            height: 75
        }
    }
};

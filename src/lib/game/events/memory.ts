// Memory Event Configurations
// Sequence recall games - for Rubber Duck Debugging

import type { MemoryEvent } from '../event-types';

export const RUBBER_DUCK_EVENT: MemoryEvent = {
    id: 'rubber-duck',
    name: 'Rubber Duck Debugging',
    description: 'Explain the problem to the duck. Remember your thought process in the right order!',
    mechanic: 'memory',
    notificationDuration: 20,
    difficulty: 'medium',
    cooldownAfterComplete: 120,
    tags: ['debugging', 'memory', 'focus'],
    rewards: [
        {
            type: 'loc',
            baseAmount: 500,
            scalingMode: 'performance'
        },
        {
            type: 'credMultiplier',
            baseAmount: 0.3,
            scalingMode: 'tiered',
            duration: 60
        }
    ],
    config: {
        sequenceLength: 5,
        displayTime: 3,
        itemPool: [
            { id: 'thought', emoji: '💭', label: 'thought' },
            { id: 'bug', emoji: '🐛', label: 'bug' },
            { id: 'search', emoji: '🔍', label: 'search' },
            { id: 'spark', emoji: '⚡', label: 'insight' },
            { id: 'idea', emoji: '💡', label: 'idea' },
            { id: 'target', emoji: '🎯', label: 'target' },
            { id: 'puzzle', emoji: '🧩', label: 'solution' },
            { id: 'code', emoji: '💻', label: 'code' }
        ]
    }
};

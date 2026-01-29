// Decision Event Configurations
// Quick choices under time pressure - for Merge Conflicts, Dependabot, Vercel Queue

import type { DecisionEvent } from '../event-types';

export const MERGE_CONFLICT_EVENT: DecisionEvent = {
    id: 'merge-conflict',
    name: 'Merge Conflict Showdown',
    description: 'Git says you and an AI agent both edited the same file. Only one version survives.',
    mechanic: 'decision',
    notificationDuration: 20,
    difficulty: 'medium',
    cooldownAfterComplete: 120,
    tags: ['git', 'merge', 'conflict'],
    rewards: [
        {
            type: 'locMultiplier',
            baseAmount: 0.3,  // +30% LoC for duration
            scalingMode: 'tiered',
            duration: 45
        }
    ],
    config: {
        isLegacy: false,
        timePerDecision: 3,  // 3 seconds per decision
        choices: [
            {
                prompt: 'Choose the cleaner implementation:',
                choices: [
                    { id: 'head', text: 'HEAD: if (x === true)', isCorrect: true },
                    { id: 'theirs', text: 'THEIRS: if (!!x == true)', isCorrect: false }
                ]
            },
            {
                prompt: 'Which error handling is better?',
                choices: [
                    { id: 'theirs', text: 'THEIRS: try { foo() } catch(e) { /* ignore */ }', isCorrect: false },
                    { id: 'head', text: 'HEAD: try { foo() } catch(e) { console.error(e) }', isCorrect: true }
                ]
            },
            {
                prompt: 'Pick the modern syntax:',
                choices: [
                    { id: 'head', text: 'HEAD: const result = await fetch()', isCorrect: true },
                    { id: 'theirs', text: 'THEIRS: fetch().then(r => r.json())', isCorrect: false }
                ]
            },
            {
                prompt: 'Which variable name is clearer?',
                choices: [
                    { id: 'theirs', text: 'THEIRS: const d = new Date()', isCorrect: false },
                    { id: 'head', text: 'HEAD: const currentDate = new Date()', isCorrect: true }
                ]
            },
            {
                prompt: 'Choose the type-safe approach:',
                choices: [
                    { id: 'theirs', text: 'THEIRS: function process(data: any)', isCorrect: false },
                    { id: 'head', text: 'HEAD: function process(data: UserData)', isCorrect: true }
                ]
            }
        ]
    }
};

export const DEPENDABOT_FLOOD_EVENT: DecisionEvent = {
    id: 'dependabot-flood',
    name: 'Dependabot PR Flood',
    description: 'Dependabot opened 23 PRs overnight. Approve the safe ones, close the breaking changes.',
    mechanic: 'decision',
    notificationDuration: 25,
    difficulty: 'medium',
    cooldownAfterComplete: 150,
    tags: ['dependencies', 'security', 'delegation'],
    rewards: [
        {
            type: 'delegationMultiplier',
            baseAmount: 0.4,  // +40% delegation efficiency
            scalingMode: 'performance',
            duration: 90
        }
    ],
    config: {
        isLegacy: false,
        timePerDecision: 4,  // 4 seconds per decision
        choices: [
            {
                prompt: 'lodash 4.17.20 → 4.17.21 (patch - security fix)',
                choices: [
                    { id: 'merge', text: '✓ Merge (patch - safe)', isCorrect: true },
                    { id: 'close', text: '✗ Close', isCorrect: false }
                ]
            },
            {
                prompt: 'react 17.0.0 → 18.0.0 (major - breaking changes)',
                choices: [
                    { id: 'merge', text: '✓ Merge', isCorrect: false },
                    { id: 'close', text: '✗ Close (major - risky)', isCorrect: true }
                ]
            },
            {
                prompt: 'typescript 4.8.0 → 4.8.1 (patch - bug fixes)',
                choices: [
                    { id: 'merge', text: '✓ Merge (patch - safe)', isCorrect: true },
                    { id: 'close', text: '✗ Close', isCorrect: false }
                ]
            },
            {
                prompt: 'eslint 7.0.0 → 8.0.0 (major - new rules)',
                choices: [
                    { id: 'merge', text: '✓ Merge', isCorrect: false },
                    { id: 'close', text: '✗ Close (major - will break build)', isCorrect: true }
                ]
            },
            {
                prompt: 'axios 0.27.0 → 0.27.1 (patch - fix)',
                choices: [
                    { id: 'merge', text: '✓ Merge (patch - safe)', isCorrect: true },
                    { id: 'close', text: '✗ Close', isCorrect: false }
                ]
            },
            {
                prompt: 'next 12.0.0 → 13.0.0 (major - app router)',
                choices: [
                    { id: 'merge', text: '✓ Merge', isCorrect: false },
                    { id: 'close', text: '✗ Close (major - needs migration)', isCorrect: true }
                ]
            }
        ]
    }
};

export const VERCEL_BUILD_QUEUE_EVENT: DecisionEvent = {
    id: 'vercel-queue',
    name: 'The Vercel Build Queue',
    description: 'Deploy is stuck behind 47 other builds. Skip the queue by correctly guessing which projects will fail.',
    mechanic: 'decision',
    notificationDuration: 20,
    difficulty: 'easy',
    cooldownAfterComplete: 90,
    tags: ['deploy', 'prediction', 'income'],
    rewards: [
        {
            type: 'cashMultiplier',
            baseAmount: 0.25,  // +25% income for duration
            scalingMode: 'performance',
            duration: 60
        }
    ],
    config: {
        isLegacy: false,
        timePerDecision: 3,  // 3 seconds per prediction
        choices: [
            {
                prompt: 'Project: "final-final-v3-ACTUAL" - Will it build?',
                choices: [
                    { id: 'fail', text: '🔥 Will Fail (suspicious name)', isCorrect: true },
                    { id: 'pass', text: '✓ Will Pass', isCorrect: false }
                ]
            },
            {
                prompt: 'Project: "production-app-v2.1.0" - Will it build?',
                choices: [
                    { id: 'pass', text: '✓ Will Pass (semantic version)', isCorrect: true },
                    { id: 'fail', text: '🔥 Will Fail', isCorrect: false }
                ]
            },
            {
                prompt: 'Project: "test123-blah" - Will it build?',
                choices: [
                    { id: 'fail', text: '🔥 Will Fail (test project)', isCorrect: true },
                    { id: 'pass', text: '✓ Will Pass', isCorrect: false }
                ]
            },
            {
                prompt: 'Project: "client-portal-main" - Will it build?',
                choices: [
                    { id: 'pass', text: '✓ Will Pass (professional name)', isCorrect: true },
                    { id: 'fail', text: '🔥 Will Fail', isCorrect: false }
                ]
            },
            {
                prompt: 'Project: "untitled-42-copy" - Will it build?',
                choices: [
                    { id: 'fail', text: '🔥 Will Fail (untitled + copy)', isCorrect: true },
                    { id: 'pass', text: '✓ Will Pass', isCorrect: false }
                ]
            }
        ]
    }
};

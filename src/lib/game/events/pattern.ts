// Pattern Event Configurations
// Complete logical patterns - for Live Pair Programming

import type { PatternEvent } from '../event-types';

export const PAIR_PROGRAMMING_EVENT: PatternEvent = {
    id: 'pair-programming',
    name: 'Live Pair Programming',
    description: 'A YouTuber with 300K viewers invited you on stream. Complete the patterns - do not fumble!',
    mechanic: 'pattern',
    notificationDuration: 25,
    difficulty: 'hard',
    cooldownAfterComplete: 150,
    tags: ['pattern', 'logic', 'streaming'],
    rewards: [
        {
            type: 'cash',
            baseAmount: 3000,
            scalingMode: 'tiered'
        },
        {
            type: 'credMultiplier',
            baseAmount: 0.5,
            scalingMode: 'performance',
            duration: 90
        }
    ],
    config: {
        rounds: 4,
        timePerRound: 6,
        patterns: [
            {
                sequence: ['1', '2', '4', '8', '?'],
                options: ['12', '16', '10'],
                correctIndex: 1
            },
            {
                sequence: ['[', ']', '{', '}', '?'],
                options: ['(', ')', '<', '>'],
                correctIndex: 0
            },
            {
                sequence: ['true', 'false', 'true', 'false', '?'],
                options: ['true', 'false', 'null', 'undefined'],
                correctIndex: 0
            },
            {
                sequence: ['1', '1', '2', '3', '5', '?'],
                options: ['6', '7', '8', '13'],
                correctIndex: 2
            },
            {
                sequence: ['const', 'let', 'var', '?'],
                options: ['const', 'let', 'var', 'function'],
                correctIndex: 2
            },
            {
                sequence: ['GET', 'POST', 'PUT', '?'],
                options: ['DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
                correctIndex: 0
            },
            {
                sequence: ['200', '404', '500', '?'],
                options: ['301', '403', '418', '503'],
                correctIndex: 1
            },
            {
                sequence: ['git', 'add', 'commit', '?'],
                options: ['pull', 'push', 'merge', 'branch'],
                correctIndex: 1
            }
        ]
    }
};

export const ALGORITHM_CHALLENGE_EVENT: PatternEvent = {
    id: 'algorithm-challenge',
    name: 'LeetCode Daily Challenge',
    description: 'The daily problem just dropped. Identify the algorithm pattern before the leaderboard fills up.',
    mechanic: 'pattern',
    notificationDuration: 20,
    difficulty: 'medium',
    cooldownAfterComplete: 120,
    tags: ['algorithm', 'pattern', 'learning'],
    rewards: [
        {
            type: 'locMultiplier',
            baseAmount: 0.4,
            scalingMode: 'tiered',
            duration: 75
        }
    ],
    config: {
        rounds: 3,
        timePerRound: 5,
        patterns: [
            {
                sequence: ['O(1)', 'O(log n)', 'O(n)', '?'],
                options: ['O(n log n)', 'O(n²)', 'O(2ⁿ)', 'O(n!)'],
                correctIndex: 0
            },
            {
                sequence: ['for', 'while', 'do', '?'],
                options: ['switch', 'if', 'for', 'break'],
                correctIndex: 0
            },
            {
                sequence: ['array', 'stack', 'queue', '?'],
                options: ['tree', 'list', 'heap', 'graph'],
                correctIndex: 3
            },
            {
                sequence: ['parse', 'tokenize', 'validate', '?'],
                options: ['compile', 'execute', 'render', 'deploy'],
                correctIndex: 0
            },
            {
                sequence: ['input', 'process', '?', 'output'],
                options: ['transform', 'store', 'validate', 'return'],
                correctIndex: 0
            },
            {
                sequence: ['req', 'res', 'next', '?'],
                options: ['err', 'done', 'end', 'return'],
                correctIndex: 0
            }
        ]
    }
};

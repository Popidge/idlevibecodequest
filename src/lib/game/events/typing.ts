// Typing Event Configurations
// Text input challenges - for Mechanical Keyboard

import type { TypingEvent } from '../event-types';

export const MECH_KEYBOARD_EVENT: TypingEvent = {
    id: 'mech-keyboard',
    name: 'Mechanical Keyboard Arrived',
    description: 'Your new Keychron just landed. Test those tactile browns with some rapid code snippets!',
    mechanic: 'typing',
    notificationDuration: 15,
    difficulty: 'easy',
    cooldownAfterComplete: 90,
    tags: ['typing', 'speed', 'loc'],
    rewards: [
        {
            type: 'locPerClick',
            baseAmount: 3,
            scalingMode: 'performance',
            duration: 60
        }
    ],
    config: {
        phrases: [
            { text: 'console.log("it works on my machine")', difficulty: 'easy' },
            { text: 'git push --force-with-lease', difficulty: 'easy' },
            { text: 'npm install --legacy-peer-deps', difficulty: 'medium' },
            { text: 'const result = await fetch("/api/data")', difficulty: 'medium' },
            { text: 'TODO: fix this later (never)', difficulty: 'easy' },
            { text: 'if (err) throw new Error("oops")', difficulty: 'easy' },
            { text: 'export const handler = async () => {}', difficulty: 'medium' },
            { text: 'Array.from({ length: 10 }, (_, i) => i)', difficulty: 'hard' }
        ],
        timeLimit: 12,
        accuracyThreshold: 0.85
    }
};

export const STACK_OVERFLOW_EVENT: TypingEvent = {
    id: 'stack-overflow',
    name: 'Stack Overflow Speed Copy',
    description: 'Found the perfect answer! Copy it before the page gets rate-limited.',
    mechanic: 'typing',
    notificationDuration: 12,
    difficulty: 'medium',
    cooldownAfterComplete: 100,
    tags: ['typing', 'speed', 'cash'],
    rewards: [
        {
            type: 'cash',
            baseAmount: 1000,
            scalingMode: 'performance'
        }
    ],
    config: {
        phrases: [
            { text: 'document.querySelector(".class")', difficulty: 'easy' },
            { text: 'useEffect(() => { return () => {} }, [])', difficulty: 'medium' },
            { text: 'const [state, setState] = useState(null)', difficulty: 'easy' },
            { text: 'Object.entries(data).map(([k, v]) => v)', difficulty: 'medium' },
            { text: 'Promise.all(promises).then(results => {})', difficulty: 'medium' },
            { text: 'Array.isArray(arr) ? arr : [arr]', difficulty: 'easy' }
        ],
        timeLimit: 10,
        accuracyThreshold: 0.9
    }
};

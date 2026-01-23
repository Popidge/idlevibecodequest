// Vibe Code Guru - Game Constants

export const PROJECTS = {
    standard: [
        { id: 'todo-app', name: 'Todo App', locCost: 10, reward: 5, cred: 0 },
        { id: 'calculator', name: 'Calculator', locCost: 25, reward: 15, cred: 0 },
        { id: 'weather-app', name: 'Weather Widget', locCost: 50, reward: 30, cred: 0 },
        { id: 'portfolio', name: 'Portfolio Site', locCost: 100, reward: 60, cred: 0 },
        { id: 'contact-form', name: 'Contact Form', locCost: 200, reward: 100, cred: 0 },
        { id: 'blog-engine', name: 'Blog Engine', locCost: 400, reward: 200, cred: 0 },
        { id: 'wiki-clone', name: 'Wiki Clone', locCost: 800, reward: 400, cred: 0 },
        { id: 'bookmark-manager', name: 'Bookmark Manager', locCost: 1500, reward: 750, cred: 0 },
        { id: 'recipe-tracker', name: 'Recipe Tracker', locCost: 3000, reward: 1500, cred: 0 },
        { id: 'habit-tracker', name: 'Habit Tracker', locCost: 5000, reward: 2500, cred: 0 }
    ],
    saas: [
        { id: 'mini-crm', name: 'Mini CRM', locCost: 200, reward: 20, recurring: true, cred: 5 },
        { id: 'task-manager', name: 'Task Manager', locCost: 500, reward: 50, recurring: true, cred: 10 },
        { id: 'analytics-tool', name: 'Analytics Tool', locCost: 1000, reward: 100, recurring: true, cred: 20 },
        { id: 'invoice-gen', name: 'Invoice Generator', locCost: 2000, reward: 150, recurring: true, cred: 30 },
        { id: 'appointment-booker', name: 'Appointment Booker', locCost: 4000, reward: 250, recurring: true, cred: 50 },
        { id: 'survey-platform', name: 'Survey Platform', locCost: 8000, reward: 400, recurring: true, cred: 80 },
        { id: 'ab-testing', name: 'A/B Testing', locCost: 15000, reward: 600, recurring: true, cred: 120 },
        { id: 'user-feedback', name: 'User Feedback', locCost: 30000, reward: 1000, recurring: true, cred: 200 },
        { id: 'feature-flags', name: 'Feature Flags', locCost: 50000, reward: 1500, recurring: true, cred: 300 },
        { id: 'api-gateway', name: 'API Gateway', locCost: 100000, reward: 2500, recurring: true, cred: 500 }
    ],
    openSource: [
        { id: 'cli-tool', name: 'CLI Utility', locCost: 75, reward: 10, cred: 5 },
        { id: 'library', name: 'Utils Library', locCost: 150, reward: 20, cred: 15 },
        { id: 'framework', name: 'Mini Framework', locCost: 300, reward: 40, cred: 30 },
        { id: 'plugin-system', name: 'Plugin System', locCost: 600, reward: 80, cred: 60 },
        { id: 'theme-pack', name: 'Theme Pack', locCost: 1200, reward: 150, cred: 100 },
        { id: 'codegen', name: 'Code Generator', locCost: 2500, reward: 300, cred: 180 },
        { id: 'linter', name: 'Custom Linter', locCost: 5000, reward: 600, cred: 300 },
        { id: 'test-framework', name: 'Test Framework', locCost: 10000, reward: 1200, cred: 500 },
        { id: 'docs-site', name: 'Docs Generator', locCost: 20000, reward: 2500, cred: 800 },
        { id: 'package-manager', name: 'Package Manager', locCost: 50000, reward: 5000, cred: 1500 }
    ]
} as const;

export const UPGRADES = {
    vibeCode: [
        { level: 1, cost: 50, name: 'Vibe Coding Basics', desc: '+1 LoC/click' },
        { level: 2, cost: 200, name: 'Copilot Addiction', desc: '+2 LoC/click' },
        { level: 3, cost: 800, name: 'StackOverflow Warrior', desc: '+3 LoC/click' },
        { level: 4, cost: 3200, name: 'ChatGPT Overflow', desc: '+4 LoC/click' },
        { level: 5, cost: 12800, name: 'Prompt Engineer', desc: '+5 LoC/click' },
        { level: 6, cost: 51200, name: 'AI Whisperer', desc: '+6 LoC/click' },
        { level: 7, cost: 204800, name: 'Neural Network', desc: '+7 LoC/click' },
        { level: 8, cost: 819200, name: 'Machine Mind', desc: '+8 LoC/click' },
        { level: 9, cost: 3276800, name: 'AGI Integration', desc: '+9 LoC/click' },
        { level: 10, cost: 13107200, name: 'Code God Mode', desc: '+10 LoC/click' }
    ],
    delegation: [
        { level: 1, cost: 100, name: 'Hire Intern', desc: '1 click/sec' },
        { level: 2, cost: 500, name: 'Junior Dev', desc: '2 clicks/sec' },
        { level: 3, cost: 2000, name: 'Senior Dev', desc: '3 clicks/sec' },
        { level: 4, cost: 8000, name: 'Tech Lead', desc: '4 clicks/sec' },
        { level: 5, cost: 32000, name: 'Engineering Team', desc: '5 clicks/sec' },
        { level: 6, cost: 128000, name: 'Offshore Squad', desc: '6 clicks/sec' },
        { level: 7, cost: 512000, name: 'DevOps Army', desc: '7 clicks/sec' },
        { level: 8, cost: 2048000, name: 'AI Agents', desc: '8 clicks/sec' },
        { level: 9, cost: 8192000, name: 'Robotic Process', desc: '9 clicks/sec' },
        { level: 10, cost: 32768000, name: 'Self-Coding AI', desc: '10 clicks/sec' }
    ]
} as const;

export const UNLOCKS = {
    projects: [
        { cred: 0, unlocks: ['todo-app', 'calculator', 'cli-tool'] },
        { cred: 10, unlocks: ['weather-app', 'mini-crm', 'library'] },
        { cred: 30, unlocks: ['portfolio', 'task-manager', 'framework'] },
        { cred: 50, unlocks: ['contact-form', 'analytics-tool', 'plugin-system'] },
        { cred: 80, unlocks: ['blog-engine', 'invoice-gen', 'theme-pack'] },
        { cred: 120, unlocks: ['wiki-clone', 'appointment-booker', 'codegen'] },
        { cred: 180, unlocks: ['bookmark-manager', 'survey-platform', 'linter'] },
        { cred: 250, unlocks: ['recipe-tracker', 'ab-testing', 'test-framework'] },
        { cred: 350, unlocks: ['habit-tracker', 'user-feedback', 'docs-site'] },
        { cred: 500, unlocks: ['feature-flags', 'api-gateway', 'package-manager'] }
    ],
    upgrades: [
        { cred: 0, maxLevel: 3 },
        { cred: 50, maxLevel: 5 },
        { cred: 150, maxLevel: 7 },
        { cred: 400, maxLevel: 9 },
        { cred: 800, maxLevel: 10 }
    ]
} as const;

export const PROMPT_MESSAGES = [
    "Write me a todo app...",
    "Generate a weather widget...",
    "Create a login form...",
    "Build a dashboard...",
    "Design a landing page...",
    "Code a chat interface...",
    "Implement user auth...",
    "Set up a database...",
    "Write API endpoints...",
    "Deploy to production..."
] as const;

export type ProjectType = keyof typeof PROJECTS;
export type UpgradeType = keyof typeof UPGRADES;
export type Project = (typeof PROJECTS.standard)[number] | (typeof PROJECTS.saas)[number] | (typeof PROJECTS.openSource)[number];
export type Upgrade = (typeof UPGRADES.vibeCode)[number] | (typeof UPGRADES.delegation)[number];

// Idle Vibe Code Quest - Game Constants

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
        { level: 1, cost: 100, name: 'Hire Intern', desc: 'Auto-generates LoC' },
        { level: 2, cost: 500, name: 'Junior Dev', desc: 'Auto-generates LoC' },
        { level: 3, cost: 2000, name: 'Senior Dev', desc: 'Auto-generates LoC' },
        { level: 4, cost: 8000, name: 'Tech Lead', desc: 'Auto-generates LoC' },
        { level: 5, cost: 32000, name: 'Engineering Team', desc: 'Auto-generates LoC' },
        { level: 6, cost: 128000, name: 'Offshore Squad', desc: 'Auto-generates LoC' },
        { level: 7, cost: 512000, name: 'DevOps Army', desc: 'Auto-generates LoC' },
        { level: 8, cost: 2048000, name: 'AI Agents', desc: 'Auto-generates LoC' },
        { level: 9, cost: 8192000, name: 'Robotic Process', desc: 'Auto-generates LoC' },
        { level: 10, cost: 32768000, name: 'Self-Coding AI', desc: 'Auto-generates LoC' }
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

// Phase 1: Tech Debt System Constants
export const TECH_DEBT = {
    BASE_ACCUMULATION: 0.00008,          // Base debt per click (manual only)
    PER_PROJECT: 0.00001,                // Additional debt per project shipped
    DELEGATION_DEBT_RATE: 0.1,           // Delegation gains 0.1× single-click debt per second
    MAX_DEBT: 0.5,                       // 50% maximum debt
    REDUCTION_BASE_LOC_COST: 200,        // Base LoC cost per 0.01 debt
    REDUCTION_LOC_MULTIPLIER: 4,         // LoC cost multiplier per project shipped
    REDUCTION_BASE_CASH_COST: 1000,      // Base Cash cost per 0.01 debt
    REDUCTION_CASH_MULTIPLIER: 20,       // Cash cost multiplier per project shipped
    MIN_REDUCTION: 0.01,                 // Minimum debt reduction amount
    WARNING_THRESHOLD: 0.1,              // Show warning and clear button when debt > 10%
    OFFLINE_RATE: 0.1                    // 10% of normal rates while offline
} as const;

export type ProjectType = keyof typeof PROJECTS;
export type UpgradeType = keyof typeof UPGRADES;
export type Project = (typeof PROJECTS.standard)[number] | (typeof PROJECTS.saas)[number] | (typeof PROJECTS.openSource)[number];
export type Upgrade = (typeof UPGRADES.vibeCode)[number] | (typeof UPGRADES.delegation)[number];

// Phase 3: Prestige System Constants
export const PRESTIGE = {
    THRESHOLD_PERCENT: 0.7,              // 70% of upgrades owned
    STARTING_CASH_PER_POINT: 5000,        // +$5,000 per point
    CASH_MULTIPLIER_PER_POINT: 0.20,      // +20% per point (additive)
    LOC_MULTIPLIER_PER_POINT: 0.15,       // +15% per point (additive)
    CRED_MULTIPLIER_PER_POINT: 0.25,      // +25% per point (additive)
    MIN_POINTS: 1,                        // Minimum prestige points
    // Learning path defaults
    DEBT_RELIEF_PER_POINT: 0.02,          // -0.02 starting debt per point
    DEBT_ACCUMULATION_REDUCTION: 0.05,    // -5% per point
    DEBT_PENALTY_REDUCTION: 0.05,         // -5% per point
} as const;

// Phase 4: Tech Tree Constants
export const TECH_TREE_COSTS = [1, 3, 5, 10, 15, 20, 25, 30, 35, 40] as const;

export const TECH_TREES = {
    buyout: {
        path: 'buyout' as const,
        name: 'Big Company Buyout',
        icon: '💰',
        color: '#00ff00',
        description: 'Cash generation mastery',
        nodes: [
            { id: 'seed_funding', name: 'Seed Funding', description: '+5,000 starting cash', cost: 1, effect: 'startingCash' as const, effectValue: 5000 },
            { id: 'angel_investor', name: 'Angel Investor', description: '+15,000 starting cash', cost: 3, effect: 'startingCash' as const, effectValue: 15000 },
            { id: 'series_a', name: 'Series A', description: '+30% cash multiplier', cost: 5, effect: 'cashMultiplier' as const, effectValue: 0.30 },
            { id: 'acqui_hire', name: 'Acqui-hire', description: '+40% cash multiplier', cost: 10, effect: 'cashMultiplier' as const, effectValue: 0.40 },
            { id: 'ipo', name: 'IPO', description: '+50% prestige point gain', cost: 15, effect: 'prestigePointMultiplier' as const, effectValue: 0.50 },
            { id: 'venture_capital', name: 'Venture Capital', description: '+40% cash multiplier', cost: 20, effect: 'cashMultiplier' as const, effectValue: 0.40 },
            { id: 'strategic_buyout', name: 'Strategic Buyout', description: '+$60,000 starting cash', cost: 25, effect: 'startingCash' as const, effectValue: 60000 },
            { id: 'market_dominance', name: 'Market Dominance', description: '+50% cash multiplier', cost: 30, effect: 'cashMultiplier' as const, effectValue: 0.50 },
            { id: 'unicorn_status', name: 'Unicorn Status', description: '+100% prestige point gain', cost: 35, effect: 'prestigePointMultiplier' as const, effectValue: 1.00 },
            { id: 'tech_empire', name: 'Tech Empire', description: '+100% cash multiplier', cost: 40, effect: 'cashMultiplier' as const, effectValue: 1.00 },
            { id: 'vertical_integration', name: 'Vertical Integration', description: 'Every second, automatically buy the cheapest upgrade', cost: 45, effect: 'verticalIntegration' as const, effectValue: 0 }
        ]
    },
    nirvana: {
        path: 'nirvana' as const,
        name: 'Tech Bro Nirvana',
        icon: '💻',
        color: '#00ccff',
        description: 'LoC generation mastery',
        nodes: [
            { id: 'copilot_plus', name: 'Copilot+', description: '+10% LoC per click', cost: 1, effect: 'locPerClick' as const, effectValue: 0.10 },
            { id: 'vibe_streak', name: 'Vibe Streak', description: '+20% LoC per click', cost: 3, effect: 'locPerClick' as const, effectValue: 0.20 },
            { id: 'prompt_engineer', name: 'Prompt Engineer', description: '+30% LoC per click', cost: 5, effect: 'locPerClick' as const, effectValue: 0.30 },
            { id: 'ai_whisperer', name: 'AI Whisperer', description: '+50% LoC per click', cost: 10, effect: 'locPerClick' as const, effectValue: 0.50 },
            { id: 'agi_integration', name: 'Ralph Loops', description: '+100% LoC per click', cost: 15, effect: 'locPerClick' as const, effectValue: 1.00 },
            { id: 'neural_enhancement', name: 'Neural Enhancement', description: '+25% passive LoC rate', cost: 20, effect: 'passiveLocRate' as const, effectValue: 0.25 },
            { id: 'quantum_code', name: 'Quantum Code', description: '+50% LoC multiplier', cost: 25, effect: 'locMultiplier' as const, effectValue: 0.50 },
            { id: 'digital_transcendence', name: 'Digital Transcendence', description: 'Increase LoC per click by 50%', cost: 30, effect: 'locPerClick' as const, effectValue: 0.50 },
            { id: 'cosmic_computing', name: 'Cosmic Computing', description: '+100% passive LoC rate', cost: 35, effect: 'passiveLocRate' as const, effectValue: 1.00 },
            { id: 'singularity', name: 'Singularity', description: '5x all LoC generation', cost: 40, effect: 'locMultiplier' as const, effectValue: 4.00 }
        ]
    },
    linus: {
        path: 'linus' as const,
        name: 'The Linus Effect',
        icon: '⭐',
        color: '#ffb000',
        description: 'Credibility mastery',
        nodes: [
            { id: 'oss_contributor', name: 'OSS Contributor', description: '+20% cred gain', cost: 1, effect: 'credMultiplier' as const, effectValue: 0.20 },
            { id: 'kernel_commit', name: 'Kernel Commit', description: '+30% cred gain', cost: 3, effect: 'credMultiplier' as const, effectValue: 0.30 },
            { id: 'maintainer', name: 'Maintainer', description: '+50% cred gain', cost: 5, effect: 'credMultiplier' as const, effectValue: 0.50 },
            { id: 'linus_blessing', name: 'Linus Blessing', description: '+100% cred gain', cost: 10, effect: 'credMultiplier' as const, effectValue: 1.00 },
            { id: 'github_star', name: 'GitHub Star', description: 'Unlock all projects 10 cred earlier', cost: 15, effect: 'credThresholdReduction' as const, effectValue: 10 },
            { id: 'project_maintainer', name: 'Project Maintainer', description: '+40% cred gain', cost: 20, effect: 'credMultiplier' as const, effectValue: 0.40 },
            { id: 'open_source_legend', name: 'Open Source Legend', description: '+60% cred gain', cost: 25, effect: 'credMultiplier' as const, effectValue: 0.60 },
            { id: 'code_celebrity', name: 'Code Celebrity', description: '+80% cred gain', cost: 30, effect: 'credMultiplier' as const, effectValue: 0.80 },
            { id: 'industry_icon', name: 'Industry Icon', description: 'Unlock all projects 25 cred earlier', cost: 35, effect: 'credThresholdReduction' as const, effectValue: 25 },
            { id: 'living_legend', name: 'Living Legend', description: '5x all cred generation', cost: 40, effect: 'credMultiplier' as const, effectValue: 4.00 }
        ]
    },
    learning: {
        path: 'learning' as const,
        name: 'Learning to... Code?',
        icon: '📚',
        color: '#ff00ff',
        description: 'Tech debt mastery',
        nodes: [
            { id: 'read_the_docs', name: 'Read the Docs', description: '-5% debt accumulation', cost: 1, effect: 'debtAccumulationReduction' as const, effectValue: 0.05 },
            { id: 'rubber_duck', name: 'Rubber Duck Debugging', description: '-10% debt accumulation', cost: 3, effect: 'debtAccumulationReduction' as const, effectValue: 0.10 },
            { id: 'pair_programming', name: 'Pair Programming', description: '-15% debt penalty', cost: 5, effect: 'debtPenaltyMitigation' as const, effectValue: 0.15 },
            { id: 'code_review', name: 'Code Review', description: '-20% debt penalty', cost: 10, effect: 'debtPenaltyMitigation' as const, effectValue: 0.20 },
            { id: 'tech_debt_sprint', name: 'Technical Debt Sprint', description: '2× debt clearing efficiency', cost: 15, effect: 'debtClearingMultiplier' as const, effectValue: 2.00 },
            { id: 'refactoring', name: 'Refactoring', description: '-25% debt accumulation', cost: 20, effect: 'debtAccumulationReduction' as const, effectValue: 0.25 },
            { id: 'writing_tests', name: 'Writing Tests', description: '-30% debt penalty', cost: 25, effect: 'debtPenaltyMitigation' as const, effectValue: 0.30 },
            { id: 'architecture_patterns', name: 'Architecture Patterns', description: '3× debt clearing efficiency', cost: 30, effect: 'debtClearingMultiplier' as const, effectValue: 3.00 },
            { id: 'legacy_whisperer', name: 'Legacy Whisperer', description: 'Debt penalty becomes bonus at high levels', cost: 35, effect: 'debtPenaltyMitigation' as const, effectValue: 0.50 },
            { id: 'code_zen', name: 'Code Zen', description: 'Complete mastery over tech debt', cost: 40, effect: 'debtPenaltyMitigation' as const, effectValue: 1.00 }
        ]
    }
} as const;

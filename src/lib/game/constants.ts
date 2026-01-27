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
        { id: 'mini-crm', name: 'Mini CRM', locCost: 200, reward: 5, recurring: true, cred: 1 },
        { id: 'task-manager', name: 'Task Manager', locCost: 500, reward: 10, recurring: true, cred: 2 },
        { id: 'analytics-tool', name: 'Analytics Tool', locCost: 1000, reward: 20, recurring: true, cred: 3 },
        { id: 'invoice-gen', name: 'Invoice Generator', locCost: 2000, reward: 30, recurring: true, cred: 4 },
        { id: 'appointment-booker', name: 'Appointment Booker', locCost: 4000, reward: 50, recurring: true, cred: 5 },
        { id: 'survey-platform', name: 'Survey Platform', locCost: 8000, reward: 80, recurring: true, cred: 6 },
        { id: 'ab-testing', name: 'A/B Testing', locCost: 15000, reward: 100, recurring: true, cred: 7 },
        { id: 'user-feedback', name: 'User Feedback', locCost: 30000, reward: 200, recurring: true, cred: 8 },
        { id: 'feature-flags', name: 'Feature Flags', locCost: 50000, reward: 350, recurring: true, cred: 9 },
        { id: 'api-gateway', name: 'API Gateway', locCost: 100000, reward: 500, recurring: true, cred: 10 }
    ],
    openSource: [
        { id: 'cli-tool', name: 'CLI Utility', locCost: 75, reward: 5, cred: 5 },
        { id: 'library', name: 'Utils Library', locCost: 150, reward: 10, cred: 10 },
        { id: 'framework', name: 'Mini Framework', locCost: 300, reward: 20, cred: 20 },
        { id: 'plugin-system', name: 'Plugin System', locCost: 600, reward: 40, cred: 35 },
        { id: 'theme-pack', name: 'Theme Pack', locCost: 1200, reward: 80, cred: 55 },
        { id: 'codegen', name: 'Code Generator', locCost: 2500, reward: 160, cred: 80 },
        { id: 'linter', name: 'Custom Linter', locCost: 5000, reward: 320, cred: 110 },
        { id: 'test-framework', name: 'Test Framework', locCost: 10000, reward: 640, cred: 155 },
        { id: 'docs-site', name: 'Docs Generator', locCost: 20000, reward: 1280, cred: 205 },
        { id: 'package-manager', name: 'Package Manager', locCost: 50000, reward: 2560, cred: 260 }
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
    // The "I don't actually want to code" category
    "Just fix the bug, you know the one, don't ask questions...",
    "Ultrathink the state management, make it 'flow'.",
    "Why can't my bro Chet access localhost:8000 on his MacBook Pro?",
    "I'm not in the mood to write CSS, just make it look like Stripe.",
    "Rewrite the entire backend in Rust, I heard it's faster.",
    "Make the 'Submit' button feel more 'agentic'.",
    
    // The "Buzzword Soup" category
    "Pivot to a decentralized AI-driven coconut water ecosystem.",
    "Implement a RAG pipeline for my personal collection of memes.",
    "Add an O1 reasoning loop to my static portfolio site.",
    "Can we put the blockchain in the middle of this div?",
    "Generate a Series-A-ready MVP by tomorrow morning.",
    
    // The "LLM Misery" category
    "As an AI language model, I cannot help you with your bad variable names.",
    "I'm sorry, I cannot fulfill this request because it's Friday afternoon.",
    "Wait, let me think about that for 45 seconds... actually, never mind.",
    "Explain why I should put non-toxic glue on my pizza to stop the cheese sliding off.",
    "Just add more 'Vibe' to the header, it's too 'Code' right now.",
    
    // The "British Dev" category
    "Kettle's boiled. While I have a brew, refactor the legacy monolith.",
    "The client wants a 'disruptive' login form, I'm going to the pub.",
    "Southern Rail is delayed again, automate my entire job from my phone.",
    "It’s raining, write me a weather app that only shows 'Grey'.",
    
    // The "Desperate" category
    "Fix the red squiggles. All of them. Now.",
    "I don't care about the context window, just remember everything forever.",
    "I ran out of credits, please finish this function for free...",
    "Look, just 'get' the vibes and ship it to Vercel."
] as const;

// Phase 1: Tech Debt System Constants (Reworked for v0.5)
export const TECH_DEBT = {
    MAX_LEVEL: 5000,                       // Max tech debt level (hard cap)
    WARNING_THRESHOLD: 1000,               // Show clear button at 20%
    DANGER_THRESHOLD: 4000,                // Show warning at 80%
    BASE_ACCUMULATION: 1,                  // Base debt per LoC generated (before modifiers)
    PRESTIGE_MODIFIER_PER_POINT: 0.01,     // Each prestige point reduces accumulation by 1%
    MIN_REDUCTION: 50,                     // Minimum debt reduction amount (1% display)
} as const;

export type ProjectType = keyof typeof PROJECTS;
export type UpgradeType = keyof typeof UPGRADES;
export type Project = (typeof PROJECTS.standard)[number] | (typeof PROJECTS.saas)[number] | (typeof PROJECTS.openSource)[number];
export type Upgrade = (typeof UPGRADES.vibeCode)[number] | (typeof UPGRADES.delegation)[number];

// Phase 3: Prestige System Constants
export const PRESTIGE = {
    THRESHOLD_PERCENT: 0.7,              // 70% of upgrades owned
    STARTING_CASH_PER_POINT: 1000,        // +$5,000 per point
    CASH_MULTIPLIER_PER_POINT: 0.1,      // +20% per point (additive)
    LOC_MULTIPLIER_PER_POINT: 0.1,       // +15% per point (additive)
    CRED_MULTIPLIER_PER_POINT: 0.1,      // +25% per point (additive)
    MIN_POINTS: 1,                        // Minimum prestige points
    // Learning path defaults
    DEBT_RELIEF_PER_POINT: 0.02,          // -0.02 starting debt per point
    DEBT_ACCUMULATION_REDUCTION: 0.05,    // -5% per point
    DEBT_PENALTY_REDUCTION: 0.05,         // -5% per point
} as const;

// Phase 4: Tech Tree Constants
export const TECH_TREE_COSTS = [1, 3, 5, 10, 15, 20, 25, 30, 35, 40] as const;

// ========================================
// v0.5: Random Event System Constants
// ========================================

export const RANDOM_EVENTS = [
    {
        id: 'bounty',
        name: 'Bug Bounty',
        description: 'A critical bug was found in production! The client is offering a bounty for a quick fix.',
        reward: 1000
    },
    {
        id: 'client-meeting',
        name: 'Client Bonus',
        description: 'The client loved your demo! They\'re throwing a bonus your way for the "vibe coding" approach.',
        reward: 1000
    },
    {
        id: 'coffee-break',
        name: 'Coffee Run',
        description: 'The office coffee machine is broken. Someone left a $1000 "emergency coffee fund" on the table.',
        reward: 1000
    },
    {
        id: 'code-review',
        name: 'Helpful Review',
        description: 'A senior engineer found your code so clean they\'re sending over a finders fee.',
        reward: 1000
    },
    {
        id: 'hotfix',
        name: 'Emergency Hotfix',
        description: 'A production outage! Deploy a hotfix and collect the crisis bonus.',
        reward: 1000
    }
] as const;

export const RANDOM_EVENT_CONFIG = {
    TRIGGER_CHANCE: 300,       // 1 in 300 chance per second
    NOTIFICATION_DURATION: 30, // Show notification for 30 seconds
    COOLDOWN_DURATION: 60      // Cooldown for 60 seconds after event ends
} as const;

// Type for random events
export type RandomEventType = (typeof RANDOM_EVENTS)[number];

// Minimal TechTree interface for type casting
interface TechTree {
    path: 'buyout' | 'nirvana' | 'linus' | 'learning';
    name: string;
    icon: string;
    color: string;
    description: string;
    nodes: Array<{
        id: string;
        name: string;
        description: string;
        cost: number;
        modifiers: {
            startingCashFlat?: number;
            moneyMultiplier?: number;
            locMultiplier?: number;
            credMultiplier?: number;
            prestigePointMultiplier?: number;
            locPerClickFlat?: number;
            passiveLocRateFlat?: number;
            credThresholdReduction?: number;
            techTreeDebtMultiplier?: number;
            unlockCodeZen?: boolean;
            unlockLegacyWhisperer?: boolean;
            prestigeDebtModifier?: number;
        };
    }>;
}

export const TECH_TREES = {
    buyout: {
        path: 'buyout' as const,
        name: 'Big Company Buyout',
        icon: '💰',
        color: '#00ff00',
        description: 'Cash generation mastery',
        nodes: [
            { id: 'seed_funding', name: 'Seed Funding', description: '+5,000 starting cash', cost: 1, modifiers: { startingCashFlat: 5000 } },
            { id: 'angel_investor', name: 'Angel Investor', description: '+15,000 starting cash', cost: 3, modifiers: { startingCashFlat: 15000 } },
            { id: 'series_a', name: 'Series A', description: '+30% cash multiplier', cost: 5, modifiers: { moneyMultiplier: 0.30 } },
            { id: 'acqui_hire', name: 'Acqui-hire', description: '+40% cash multiplier', cost: 10, modifiers: { moneyMultiplier: 0.40 } },
            { id: 'ipo', name: 'IPO', description: '+50% prestige point gain', cost: 15, modifiers: { prestigePointMultiplier: 0.50 } },
            { id: 'venture_capital', name: 'Venture Capital', description: '+40% cash multiplier', cost: 20, modifiers: { moneyMultiplier: 0.40 } },
            { id: 'strategic_buyout', name: 'Strategic Buyout', description: '+$60,000 starting cash', cost: 25, modifiers: { startingCashFlat: 60000 } },
            { id: 'market_dominance', name: 'Market Dominance', description: '+50% cash multiplier', cost: 30, modifiers: { moneyMultiplier: 0.50 } },
            { id: 'unicorn_status', name: 'Unicorn Status', description: '+100% prestige point gain', cost: 35, modifiers: { prestigePointMultiplier: 1.00 } },
            { id: 'tech_empire', name: 'Tech Empire', description: '+100% cash multiplier', cost: 40, modifiers: { moneyMultiplier: 1.00 } }
        ]
    },
    nirvana: {
        path: 'nirvana' as const,
        name: 'Tech Bro Nirvana',
        icon: '💻',
        color: '#00ccff',
        description: 'LoC generation mastery',
        nodes: [
            { id: 'copilot_plus', name: 'Copilot+', description: '+10% LoC per click', cost: 1, modifiers: { locPerClickFlat: 0.10 } },
            { id: 'vibe_streak', name: 'Vibe Streak', description: '+20% LoC per click', cost: 3, modifiers: { locPerClickFlat: 0.20 } },
            { id: 'prompt_engineer', name: 'Prompt Engineer', description: '+30% LoC per click', cost: 5, modifiers: { locPerClickFlat: 0.30 } },
            { id: 'ai_whisperer', name: 'AI Whisperer', description: '+50% LoC per click', cost: 10, modifiers: { locPerClickFlat: 0.50 } },
            { id: 'agi_integration', name: 'Ralph Loops', description: '+100% LoC per click', cost: 15, modifiers: { locPerClickFlat: 1.00 } },
            { id: 'neural_enhancement', name: 'Neural Enhancement', description: '+25% passive LoC rate', cost: 20, modifiers: { passiveLocRateFlat: 0.25 } },
            { id: 'quantum_code', name: 'Quantum Code', description: '+50% LoC multiplier', cost: 25, modifiers: { locMultiplier: 0.50 } },
            { id: 'digital_transcendence', name: 'Digital Transcendence', description: '+50% LoC per click', cost: 30, modifiers: { locPerClickFlat: 0.50 } },
            { id: 'cosmic_computing', name: 'Cosmic Computing', description: '+100% passive LoC rate', cost: 35, modifiers: { passiveLocRateFlat: 1.00 } },
            { id: 'singularity', name: 'Singularity', description: '5x all LoC generation', cost: 40, modifiers: { locMultiplier: 4.00 } }
        ]
    },
    linus: {
        path: 'linus' as const,
        name: 'The Linus Effect',
        icon: '⭐',
        color: '#ffb000',
        description: 'Credibility mastery',
        nodes: [
            { id: 'oss_contributor', name: 'OSS Contributor', description: '+20% cred gain', cost: 1, modifiers: { credMultiplier: 0.20 } },
            { id: 'kernel_commit', name: 'Kernel Commit', description: '+30% cred gain', cost: 3, modifiers: { credMultiplier: 0.30 } },
            { id: 'maintainer', name: 'Maintainer', description: '+50% cred gain', cost: 5, modifiers: { credMultiplier: 0.50 } },
            { id: 'linus_blessing', name: 'Linus Blessing', description: '+100% cred gain', cost: 10, modifiers: { credMultiplier: 1.00 } },
            { id: 'github_star', name: 'GitHub Star', description: 'Unlock all projects 10 cred earlier', cost: 15, modifiers: { credThresholdReduction: 10 } },
            { id: 'project_maintainer', name: 'Project Maintainer', description: '+40% cred gain', cost: 20, modifiers: { credMultiplier: 0.40 } },
            { id: 'open_source_legend', name: 'Open Source Legend', description: '+60% cred gain', cost: 25, modifiers: { credMultiplier: 0.60 } },
            { id: 'code_celebrity', name: 'Code Celebrity', description: '+80% cred gain', cost: 30, modifiers: { credMultiplier: 0.80 } },
            { id: 'industry_icon', name: 'Industry Icon', description: 'Unlock all projects 25 cred earlier', cost: 35, modifiers: { credThresholdReduction: 25 } },
            { id: 'living_legend', name: 'Living Legend', description: '5x all cred generation', cost: 40, modifiers: { credMultiplier: 4.00 } }
        ]
    },
    learning: {
        path: 'learning' as const,
        name: 'Learning to... Code?',
        icon: '📚',
        color: '#ff00ff',
        description: 'Tech debt mastery',
        nodes: [
            { id: 'read_the_docs', name: 'Read the Docs', description: 'Reduces debt accumulation by 10%', cost: 1, modifiers: { techTreeDebtMultiplier: 0.1 } },
            { id: 'rubber_duck', name: 'Rubber Duck Debugging', description: 'Reduces debt accumulation by 20%', cost: 2, modifiers: { techTreeDebtMultiplier: 0.2 } },
            { id: 'pair_programming', name: 'Pair Programming', description: 'Reduces debt accumulation by 30%', cost: 3, modifiers: { techTreeDebtMultiplier: 0.3 } },
            { id: 'code_review', name: 'Code Review', description: 'Reduces debt accumulation by 40%', cost: 4, modifiers: { techTreeDebtMultiplier: 0.4 } },
            { id: 'tech_debt_sprint', name: 'Technical Debt Sprint', description: 'Reduces debt accumulation by 50%', cost: 5, modifiers: { techTreeDebtMultiplier: 0.5 } },
            { id: 'refactoring', name: 'Refactoring', description: 'Reduces debt accumulation by 60%', cost: 6, modifiers: { techTreeDebtMultiplier: 0.6 } },
            { id: 'writing_tests', name: 'Writing Tests', description: 'Reduces debt accumulation by 70%', cost: 7, modifiers: { techTreeDebtMultiplier: 0.7 } },
            { id: 'architecture_patterns', name: 'Architecture Patterns', description: 'Reduces debt accumulation by 80%', cost: 8, modifiers: { techTreeDebtMultiplier: 0.8 } },
            { id: 'legacy_whisperer', name: 'Legacy Whisperer', description: 'Eliminates tech debt penalty (full income)', cost: 9, modifiers: { techTreeDebtMultiplier: 1.0 } },
            { id: 'code_zen', name: 'Code Zen', description: 'Tech debt becomes a bonus instead of penalty', cost: 10, modifiers: { unlockCodeZen: true } }
        ]
    }
} as unknown as { buyout: TechTree; nirvana: TechTree; linus: TechTree; learning: TechTree };

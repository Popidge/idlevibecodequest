# Vibe Code Clicker - Implementation Plan

## Overview
A browser-based idle click game with a TUI (Terminal User Interface) aesthetic, themed around "vibe coding" - generating code by prompting AI.

## Game Architecture

### Core Data Structures

```javascript
// Game State
const gameState = {
    resources: {
        money: 0,          // Currency for purchases
        loc: 0,            // Lines of Code (currency for shipping)
        cred: 0            // Credits (unlock currency)
    },
    clickPower: 1,         // LoC per click (base: 1)
    autoClickRate: 0,      // LoC per second from delegation
    upgrades: {
        vibeCode: 0,       // Level of Vibe Code Improvement
        delegation: 0      // Level of Delegation
    },
    projects: {
        standard: {},      // Shipped standard apps
        saas: {},          // Shipped SaaS projects
        openSource: {}     // Shipped open-source projects
    },
    totalClicks: 0
};
```

### Project Definitions

```javascript
// Projects available to ship
const projects = {
    standard: [
        { id: 'todo-app', name: 'Todo App', locCost: 10, reward: 5, cred: 0 },
        { id: 'calculator', name: 'Calculator', locCost: 25, reward: 15, cred: 0 },
        { id: 'weather-app', name: 'Weather App', locCost: 50, reward: 30, cred: 0 },
        { id: 'portfolio', name: 'Portfolio Site', locCost: 100, reward: 60, cred: 0 }
    ],
    saas: [
        { id: 'mini-crm', name: 'Mini CRM', locCost: 200, reward: 20, recurring: true, cred: 5 },
        { id: 'task-manager', name: 'Task Manager', locCost: 500, reward: 50, recurring: true, cred: 10 },
        { id: 'analytics-tool', name: 'Analytics Tool', locCost: 1000, reward: 100, recurring: true, cred: 20 }
    ],
    openSource: [
        { id: 'cli-tool', name: 'CLI Tool', locCost: 75, reward: 10, cred: 5 },
        { id: 'library', name: 'Utility Library', locCost: 150, reward: 20, cred: 15 },
        { id: 'framework', name: 'Mini Framework', locCost: 300, reward: 40, cred: 30 }
    ]
};
```

### Upgrade Definitions

```javascript
// Upgrades available for purchase
const upgrades = {
    vibeCode: [
        { level: 1, cost: 50, multiplier: 2 },
        { level: 2, cost: 200, multiplier: 2 },
        { level: 3, cost: 800, multiplier: 2 },
        { level: 4, cost: 3200, multiplier: 2 },
        { level: 5, cost: 12800, multiplier: 2 },
        { level: 6, cost: 51200, multiplier: 2 },
        { level: 7, cost: 204800, multiplier: 2 },
        { level: 8, cost: 819200, multiplier: 2 },
        { level: 9, cost: 3276800, multiplier: 2 },
        { level: 10, cost: 13107200, multiplier: 2 }
    ],
    delegation: [
        { level: 1, cost: 100, autoLoc: 1 },
        { level: 2, cost: 500, autoLoc: 3 },
        { level: 3, cost: 2000, autoLoc: 8 },
        { level: 4, cost: 8000, autoLoc: 20 },
        { level: 5, cost: 32000, autoLoc: 50 },
        { level: 6, cost: 128000, autoLoc: 125 },
        { level: 7, cost: 512000, autoLoc: 300 },
        { level: 8, cost: 2048000, autoLoc: 750 },
        { level: 9, cost: 8192000, autoLoc: 1800 },
        { level: 10, cost: 32768000, autoLoc: 4500 }
    ]
};
```

### Unlock Thresholds

```javascript
// Cred requirements for unlocking content
const unlocks = {
    projects: [
        { cred: 0, unlocks: ['todo-app', 'calculator', 'cli-tool'] },
        { cred: 10, unlocks: ['weather-app', 'mini-crm', 'library'] },
        { cred: 30, unlocks: ['portfolio', 'task-manager', 'framework'] },
        { cred: 50, unlocks: ['analytics-tool'] }
    ],
    upgrades: [
        { cred: 0, maxLevel: 3 },
        { cred: 20, maxLevel: 6 },
        { cred: 50, maxLevel: 10 }
    ]
};
```

## File Structure

```
vibe-code-clicker/
├── index.html          # Main game HTML structure
├── styles.css          # TUI-themed styling
└── game.js            # Game logic and state management
```

## Implementation Steps

### 1. HTML Structure (`index.html`)
- Container with TUI-style border
- Header section with ASCII art title
- Stats display panel (Money, LoC, Cred, Click Power, Auto Rate)
- Main action area (Prompt button)
- Project shipping section (3 categories)
- Upgrades section (Vibe Code, Delegation)
- Footer with controls (Save, Reset)

### 2. CSS Styling (`styles.css`)
- Dark background (`#0a0a0a` or similar)
- Monospace font (`'Courier New', monospace`)
- Green/amber text colors for terminal feel
- Box borders using CSS borders or ASCII characters
- Button styling with hover effects
- Responsive layout (flexbox/grid)
- Animations for feedback (click effects, unlock notifications)

### 3. Game Logic (`game.js`)

#### Core Functions
- `initGame()` - Initialize game state, load from localStorage
- `saveGame()` - Save state to localStorage
- `resetGame()` - Reset to initial state
- `updateUI()` - Refresh all UI elements

#### Click Mechanics
- `handlePromptClick()` - Add LoC on click
- `generateAutoLOC()` - Add LoC from delegation (runs every second)

#### Project Shipping
- `shipProject(type, projectId)` - Deduct LoC, add reward
- `calculateReward(project)` - Return money and cred for project
- `checkUnlocks()` - Update available projects based on cred

#### Upgrade System
- `buyVibeCodeUpgrade()` - Increase click power
- `buyDelegationUpgrade()` - Increase auto-click rate
- `getUpgradeCost(type, level)` - Calculate cost for next level

#### Game Loop
- `gameLoop()` - Run every second for:
  - Auto LoC generation
  - SaaS recurring rewards
  - UI updates

#### Save/Load System
- `saveToLocalStorage()` - Persist game state
- `loadFromLocalStorage()` - Restore game state
- Auto-save every 30 seconds

## ASCII Art Elements

```
╔══════════════════════════════════════╗
║     VIBE CODE CLICKER v1.0          ║
╠══════════════════════════════════════╣
║                                      ║
║    > [ PROMPT ] <                    ║
║                                      ║
║    Generating code with AI vibes... ║
║                                      ║
╚══════════════════════════════════════╝
```

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║  VIBE CODE CLICKER                    [SAVE] [RESET] ║ │
│  ╠═══════════════════════════════════════════════════════╣ │
│  ║                                                       ║ │
│  ║  ┌─ STATS ─────────────────────────────────────────┐  ║ │
│  ║  │ Money:    $0               LoC:      0          │  ║ │
│  ║  │ Cred:     0                Clicks:   0          │  ║ │
│  ║  │ Power:    1 LoC/click      Auto:     0/sec     │  ║ │
│  ║  └──────────────────────────────────────────────────┘  ║ │
│  ║                                                       ║ │
│  ║  ┌─ PROMPT ─────────────────────────────────────────┐  ║ │
│  ║  │                                                    │  ║ │
│  ║  │              [  > PROMPT <  ]                     │  ║ │
│  ║  │                                                    │  ║ │
│  ║  │         "Write me a todo app..."                  │  ║ │
│  ║  └──────────────────────────────────────────────────┘  ║ │
│  ║                                                       ║ │
│  ║  ┌─ SHIP PROJECTS ─────────────────────────────────┐  ║ │
│  ║  │ STANDARD APPS              SAAS PROJECTS        │  ║ │
│  ║  │ [Todo App] 10 LoC → $5      [Mini CRM] 200 LoC   │  ║ │
│  ║  │ [Calculator] 25 LoC → $15   → $20/sec + 5 Cred  │  ║ │
│  ║  │                                                  │  ║ │
│  ║  │ OPEN SOURCE                                     │  ║ │
│  ║  │ [CLI Tool] 75 LoC → $10 + 5 Cred                │  ║ │
│  ║  └──────────────────────────────────────────────────┘  ║ │
│  ║                                                       ║ │
│  ║  ┌─ UPGRADES ───────────────────────────────────────┐  ║ │
│  ║  │ VIBE CODE IMPROVEMENTS      DELEGATION           │  ║ │
│  ║  │ [Lvl 1] $50 → 2x LoC/click  [Lvl 1] $100 → 1/sec│  ║ │
│  ║  │ [Lvl 2] $200 → 4x LoC/click [Lvl 2] $500 → 3/sec│  ║ │
│  ║  └──────────────────────────────────────────────────┘  ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────┘
```

## Game Balance Considerations

1. **Early Game** (0-5 minutes):
   - Click manually to earn LoC
   - Ship small standard apps for money
   - Buy first Vibe Code upgrade
   - Unlock open-source projects for cred

2. **Mid Game** (5-30 minutes):
   - Buy delegation for passive LoC
   - Ship SaaS projects for recurring income
   - Accumulate cred to unlock bigger projects

3. **Late Game** (30+ minutes):
   - Max out upgrades
   - Ship all available projects
   - Focus on maximizing passive income

## Technical Notes

- **No external dependencies** - Pure HTML/CSS/JS
- **localStorage** for persistence
- **setInterval** for game loop (1 second tick)
- **Event delegation** for efficient click handling
- **CSS Grid/Flexbox** for responsive layout
- **CSS animations** for visual feedback

## Future Enhancements (Optional)

- Achievement system
- Prestige/reset mechanic
- More project types
- Visual progress bars
- Sound effects (optional)
- Leaderboard (if backend added)

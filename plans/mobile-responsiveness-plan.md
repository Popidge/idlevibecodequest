# Mobile Responsiveness Implementation Plan

## Current Desktop Layout Analysis

### Grid Structure (from App.svelte)
```
grid-template-columns: 200px 1fr 1fr;
grid-template-rows: auto 1fr auto auto;
```

### Component Placement
| Component | Grid Position | Content |
|-----------|--------------|---------|
| TitlePanel | col 1, row 1 | ASCII art logo, version |
| NotificationBar | col 2, row 1 | Notifications, Tech Tree, Prestige buttons |
| StatsPanel | col 1, row 2-3 | Money, LoC, Cred, Clicks, Tech Debt, Rates, Prestige |
| ProjectsPanel | col 2, row 2 | Tabbed: Standard/SaaS/Open Source projects |
| UpgradesPanel | col 3, row 2 | Tabbed: Vibe Code/Delegation upgrades |
| ActionRow | col 1-3, row 3 | Save/Reset, Prompt text, >PROMPT button |
| Footer | col 1-3, row 4 | Auto-save text, credits |
| ThemeToggle | absolute centered | Theme switcher |
| Debug Toolbar | absolute top-right | Debug resources, Tuning |

### Pain Points for Mobile
1. **3-column layout** - Won't fit on 375px width
2. **200px fixed sidebar** - Too wide proportionally for mobile
3. **Side-by-side panels** - Projects and Upgrades need horizontal space
4. **ASCII art title** - May overflow or be illegible at small sizes
5. **Horizontal action row** - Needs vertical stacking
6. **Notification bar complexity** - Multiple buttons + notifications competing for space

---

## Breakpoint Strategy

### Breakpoint Definitions
```css
/* Mobile Portrait (Primary Target) */
--breakpoint-mobile: 375px;     /* iPhone SE/X/12/13/14/15 */
--breakpoint-mobile-lg: 414px;  /* iPhone Plus/Max */

/* Tablet */
--breakpoint-tablet: 768px;     /* iPad Mini, tablets */

/* Desktop */
--breakpoint-desktop: 1024px;   /* Small laptops */
--breakpoint-wide: 1400px;      /* Current max-width */
```

### Layout Modes
| Mode | Width | Layout Type |
|------|-------|-------------|
| Mobile | < 768px | Single column, tab navigation |
| Tablet | 768px - 1023px | 2-column, condensed sidebar |
| Desktop | 1024px+ | Current 3-column layout |
| Wide | 1400px+ | 3-column with max-width constraint |

---

## Recommended Approach: Tab-Based Mobile Layout

This is the industry standard for idle games on mobile (Cookie Clicker, Adventure Capitalist, Realm Grinder).

### Mobile Layout Architecture

```
┌─────────────────────────────────────┐
│  [LOGO]  💰Money  ⭐Points  ⚙️    │  ← Compact Header
├─────────────────────────────────────┤
│  [=============PROMPT=============] │  ← Primary Action
├─────────────────────────────────────┤
│  LoC: 18.4K  |  +330/s  |  Debt: 5% │  ← Key Stats Bar
├─────────────────────────────────────┤
│                                     │
│         [ACTIVE TAB CONTENT]        │  ← Main Content Area
│                                     │
│    (Projects/Upgrades/Stats/Info)   │
│                                     │
├─────────────────────────────────────┤
│  [🏗️]  [⬆️]  [📊]  [ℹ️]            │  ← Bottom Tab Bar
│ Projects Upgrades Stats  Info       │
└─────────────────────────────────────┘
```

### Tab Structure

| Tab | Icon | Content | Desktop Equivalent |
|-----|------|---------|-------------------|
| **Projects** | 🏗️ / 📦 | Ship projects list with type tabs | ProjectsPanel |
| **Upgrades** | ⬆️ / ⚡ | Buy upgrades with type tabs | UpgradesPanel |
| **Stats** | 📊 / 📈 | Full stats panel, prestige info | StatsPanel |
| **Info** | ℹ️ / ⚙️ | Theme toggle, save/reset, footer info | ActionRow + Footer + Theme |

### Mobile Header Redesign

Replace TitlePanel + NotificationBar with:
```
┌─────────────────────────────────────┐
│ [IVCQ]  $870.6M  ⭐500  [⚙️] [🌙] │
│         LoC:18.4K  +330/s           │
└─────────────────────────────────────┘
```

**Elements:**
- **Logo**: Simplified text logo or icon (IVCQ) instead of ASCII art
- **Money**: Primary resource, always visible
- **Prestige Points**: Star icon with points
- **Rate**: LoC/sec or $/sec secondary metric
- **Settings Button**: Opens debug/tuning (if enabled)
- **Theme Toggle**: Moon/sun icon button

---

## Component-Specific Responsive Behaviors

### App.svelte Changes

**Desktop Grid (default):**
```css
.terminal-dashboard {
    display: grid;
    grid-template-columns: 200px 1fr 1fr;
    grid-template-rows: auto 1fr auto auto;
    gap: 10px;
}
```

**Mobile Grid (< 768px):**
```css
.terminal-dashboard {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    height: 100vh; /* Full viewport */
}
```

**Implementation:**
```svelte
<!-- App.svelte -->
<script>
    import { isMobile } from './lib/stores/responsive';
</script>

<div class="terminal-dashboard" class:mobile={isMobile}>
    {#if isMobile}
        <MobileHeader />
        <MobileStatsBar />
        <MobileActionArea />
        <MobileTabContent activeTab={$mobileTab} />
        <MobileTabBar bind:activeTab={$mobileTab} />
    {:else}
        <!-- Current desktop layout -->
        <TitlePanel />
        <NotificationBar />
        ...
    {/if}
</div>
```

### TitlePanel Responsive Behavior

| Mode | Behavior |
|------|----------|
| Desktop (>1024px) | Full ASCII art logo, version text |
| Tablet (768-1023px) | Reduced ASCII art or simplified text |
| Mobile (<768px) | Hidden (replaced by MobileHeader) |

### StatsPanel Responsive Behavior

| Mode | Behavior |
|------|----------|
| Desktop | Full sidebar with all stats, progress bars, prestige |
| Tablet | Condensed version, collapsible sections |
| Mobile | Moved to "Stats" tab, full view when selected |

**Mobile Stats Tab Layout:**
```
┌─────────────────────────────────────┐
│  MONEY              $870.6M         │
│  LoC                18.4K           │
│  Cred               8.3K            │
│  Clicks             61              │
├─────────────────────────────────────┤
│  TECH DEBT          5.00% [CLEAR]   │
├─────────────────────────────────────┤
│  Power: 111 LoC/click               │
│  Delegation: 330 LoC/sec            │
│  Passive: $6095.00/sec              │
├─────────────────────────────────────┤
│  NEXT UPGRADE: Vibe Code L1         │
│  [=========         ] 45%           │
├─────────────────────────────────────┤
│  TOTAL PRESTIGE POINTS              │
│  ⭐ 500 (1 prestiges)               │
└─────────────────────────────────────┘
```

### ProjectsPanel & UpgradesPanel Responsive Behavior

| Mode | Behavior |
|------|----------|
| Desktop | Side-by-side columns |
| Tablet | Stacked vertically, full width |
| Mobile | Separate tabs, each with internal tabs |

**Mobile Project Item Layout:**
```
┌─────────────────────────────────────┐
│ CLI Utility [v1.0]          701 LoC │
│ → $5.00 + 5 Cred                    │
└─────────────────────────────────────┘
```

- Stack name/version and cost horizontally
- Reward on second line
- Larger touch targets (min 44px height)
- Swipe gestures for quick navigation?

### NotificationBar Responsive Behavior

| Mode | Behavior |
|------|----------|
| Desktop | Notifications left, buttons right |
| Mobile | Notifications as toast overlays, buttons distributed |

**Mobile Button Placement:**
- Tech Tree → Stats tab or FAB (Floating Action Button)
- Prestige → Stats tab as prominent button
- Event → Full-screen modal or banner

### ActionRow Responsive Behavior

| Mode | Behavior |
|------|----------|
| Desktop | 3-column: Save/Reset, Prompt text, PROMPT button |
| Mobile | Vertical stack: PROMPT button, prompt text, save/reset in Info tab |

**Mobile Action Area:**
```
┌─────────────────────────────────────┐
│  [==========PROMPT==========]      │  ← Large, prominent
│  > Just fix the bug, you know...    │  ← Typing effect text
└─────────────────────────────────────┘
```

### Footer Responsive Behavior

| Mode | Behavior |
|------|----------|
| Desktop | Centered, full text |
| Mobile | Moved to Info tab, simplified |

---

## CSS Variable Strategy for Responsive Values

### Proposed CSS Changes to app.css

```css
/* ==========================================================================
   RESPONSIVE VARIABLES
   ========================================================================== */

:root {
    /* Desktop defaults */
    --layout-mode: desktop;
    
    /* Spacing */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 10px;
    --space-lg: 15px;
    --space-xl: 20px;
    
    /* Font sizes */
    --font-size-xs: 10px;
    --font-size-sm: 11px;
    --font-size-base: 12px;
    --font-size-lg: 14px;
    --font-size-xl: 18px;
    --font-size-2xl: 24px;
    
    /* Touch targets */
    --touch-target-min: 44px;
    
    /* Layout */
    --sidebar-width: 200px;
    --panel-gap: 10px;
    --dashboard-padding: 10px;
    
    /* Item heights */
    --item-height: auto;
    --item-padding: 8px 10px;
}

/* Tablet */
@media (max-width: 1023px) {
    :root {
        --layout-mode: tablet;
        --sidebar-width: 160px;
        --panel-gap: 8px;
        --font-size-base: 11px;
    }
}

/* Mobile */
@media (max-width: 767px) {
    :root {
        --layout-mode: mobile;
        
        /* Spacing */
        --space-xs: 4px;
        --space-sm: 6px;
        --space-md: 8px;
        --space-lg: 12px;
        --space-xl: 16px;
        
        /* Font sizes - slightly larger for readability */
        --font-size-xs: 10px;
        --font-size-sm: 12px;
        --font-size-base: 14px;
        --font-size-lg: 16px;
        --font-size-xl: 20px;
        --font-size-2xl: 28px;
        
        /* Touch targets */
        --touch-target-min: 48px; /* iOS HIG recommendation */
        
        /* Layout */
        --sidebar-width: 100%;
        --panel-gap: 8px;
        --dashboard-padding: 8px;
        
        /* Item heights - larger for touch */
        --item-height: 60px;
        --item-padding: 12px 16px;
    }
}
```

### Component-Level Responsive Styles

Each component will use container queries or media queries:

```svelte
<!-- Example: ProjectsPanel.svelte -->
<style>
    .projects-panel {
        grid-column: 2;
        grid-row: 2;
    }
    
    /* Mobile override */
    @media (max-width: 767px) {
        .projects-panel {
            grid-column: 1;
            grid-row: auto;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .project-item {
            min-height: var(--touch-target-min);
            padding: var(--item-padding);
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
        }
        
        .item-name {
            font-size: var(--font-size-base);
            width: 100%;
            display: flex;
            justify-content: space-between;
        }
        
        .item-reward {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
        }
    }
</style>
```

---

## Store/State Adaptations

### New State for Mobile

```typescript
// src/lib/stores/responsive.ts
import { derived } from 'svelte/store';

export const viewport = {
    width: writable(window.innerWidth),
    height: writable(window.innerHeight)
};

export const isMobile = derived(
    viewport.width,
    $width => $width < 768
);

export const isTablet = derived(
    viewport.width,
    $width => $width >= 768 && $width < 1024
);

export const isDesktop = derived(
    viewport.width,
    $width => $width >= 1024
);

// Mobile-specific UI state
export const mobileTab = writable<'projects' | 'upgrades' | 'stats' | 'info'>('projects');
```

### Store Updates

```typescript
// Add to existing store
interface GameState {
    // ... existing fields
    
    // Mobile UI state
    mobile: {
        activeTab: 'projects' | 'upgrades' | 'stats' | 'info';
        statsCollapsed: Record<string, boolean>;
        lastVisitedTab: string;
    };
}
```

---

## Alternative Approach A: Drawer Navigation

Instead of bottom tabs, use a slide-out drawer for secondary content.

```
┌─────────────────────────────────────┐
│  [≡]  idle-vibe-code    [⚙️] [🌙] │
├─────────────────────────────────────┤
│  [=============PROMPT==========]   │
├─────────────────────────────────────┤
│                                     │
│         MAIN CONTENT AREA           │
│    (Projects/Upgrades with tabs)    │
│                                     │
│                                     │
└─────────────────────────────────────┘

DRAWER (slides from left):
┌────────┬────────────────────────────┐
│ STATS  │                            │
│        │  MONEY:        $870.6M     │
│ [📊]   │  LoC:          18.4K       │
│        │  ...                       │
│────────│                            │
│ PRESTIG│                            │
│        │                            │
│ [⭐]   │                            │
│        │                            │
│────────│                            │
│ THEME  │                            │
│        │                            │
│ [🌙]   │                            │
└────────┴────────────────────────────┘
```

**Pros:**
- More content visible simultaneously
- Familiar pattern for mobile apps
- Easy access to all stats

**Cons:**
- Extra tap to access stats
- Drawer animation complexity
- May feel less "game-like"

---

## Alternative Approach B: Collapsible Sections

Keep single scrollable page with collapsible sections.

```
┌─────────────────────────────────────┐
│  [IVCQ]  $870.6M  ⭐500  [⚙️]      │
├─────────────────────────────────────┤
│  [=============PROMPT==========]   │
├─────────────────────────────────────┤
│  ▼ STATS              [tap to hide] │
│  LoC: 18.4K    $/sec: +6095         │
├─────────────────────────────────────┤
│  ▶ PROJECTS          [tap to expand]│
├─────────────────────────────────────┤
│  ▶ UPGRADES          [tap to expand]│
├─────────────────────────────────────┤
│  ▶ INFO              [tap to expand]│
│  (save, reset, theme, footer)       │
└─────────────────────────────────────┘
```

**Pros:**
- Simple implementation
- User controls what they see
- No tab switching needed

**Cons:**
- Requires scrolling to access sections
- Not ideal for quick upgrade buying
- Can feel cluttered

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Create responsive store (`src/lib/stores/responsive.ts`)
- [ ] Add CSS variables for responsive values
- [ ] Set up viewport event listeners
- [ ] Create MobileHeader component

### Phase 2: Mobile Shell
- [ ] Create MobileTabBar component
- [ ] Create MobileTabContent wrapper
- [ ] Implement tab switching logic
- [ ] Update App.svelte with conditional layout

### Phase 3: Component Adaptation
- [ ] Adapt StatsPanel for mobile tab
- [ ] Adapt ProjectsPanel for mobile tab
- [ ] Adapt UpgradesPanel for mobile tab
- [ ] Create Info tab combining ActionRow + Footer

### Phase 4: Polish
- [ ] Touch target sizing (min 48px)
- [ ] Font size adjustments
- [ ] Scroll behavior optimization
- [ ] Pull-to-refresh prevention (for game feel)

### Phase 5: Testing
- [ ] iPhone SE (375x667)
- [ ] iPhone 14 (390x844)
- [ ] iPhone 14 Pro Max (430x932)
- [ ] Android small/medium/large
- [ ] Tablet (iPad Mini, iPad Pro)

---

## Testing Criteria

### Functional Testing
- [ ] All tabs switch correctly
- [ ] All buttons are tappable (min 48px)
- [ ] Projects can be shipped
- [ ] Upgrades can be purchased
- [ ] Save/Reset functions work
- [ ] Theme toggle works
- [ ] Modals display correctly
- [ ] Notifications appear properly

### Visual Testing
- [ ] No horizontal scroll on any screen
- [ ] Text remains readable (min 14px on mobile)
- [ ] Stats don't overflow their containers
- [ ] Project/upgrade names truncate gracefully
- [ ] Tab bar doesn't overlap content
- [ ] Safe area insets handled (notch, home indicator)

### Performance Testing
- [ ] Tab switching is smooth (< 100ms)
- [ ] Scroll performance 60fps
- [ ] No layout shift when switching tabs
- [ ] Touch events respond immediately

### Accessibility Testing
- [ ] Touch targets meet WCAG 2.5.5 (44x44px minimum)
- [ ] Color contrast maintained
- [ ] Screen reader labels on icons
- [ ] Focus states visible

---

## Summary

**Recommended Approach: Tab-Based Navigation**

This approach provides:
1. **Clear information hierarchy** - Primary action (PROMPT) always visible
2. **Quick access** - Bottom tab bar is thumb-friendly
3. **Scalable content** - Each tab can grow independently
4. **Industry standard** - Familiar to idle game players
5. **Clean implementation** - Straightforward component mapping

The desktop layout remains completely unchanged, with mobile being a purpose-built alternative layout that activates via media queries and conditional rendering.

**Key Technical Decisions:**
- Use CSS media queries for layout changes
- Use conditional rendering in App.svelte for structural differences
- Create mobile-specific components rather than over-complicating existing ones
- Maintain separate state for mobile active tab
- Keep touch targets at minimum 48px for mobile

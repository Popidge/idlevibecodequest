# Vibe Code Clicker - Single-Page UI Redesign Plan

## Overview

Transform the current vertical stack layout into a single-page dashboard with terminal-style panels. The new layout will be a grid-based design optimized for desktop use.

## Target Layout Structure

```mermaid
grid
  Title, 1.2fr, 1fr
  Stats, 1.2fr, 1fr
  Prompt, 1.2fr, 1fr
```

### Layout Grid (4 rows, 3 columns)

| Row | Column 1 (180px fixed) | Column 2 (1.2fr) | Column 3 (1fr) |
|-----|------------------------|------------------|----------------|
| 1 | **Title Panel** (ASCII art) | *(empty)* | **Save/Reset** (top-right) |
| 2 | **Stats Panel** | **Ship Projects Panel** (with tabs) | **Upgrades Panel** (with tabs) |
| 3 | *(spans bottom area)* | **Prompt Button** + **Random Prompt** (bottom bar) | *(same)* |
| 4 | Footer info | *(same)* | *(same)* |

## Detailed Component Specifications

### 1. Title Panel (Top-Left)
- Fixed width: 180px
- Contains the ASCII art title
- Terminal-style border
- Window controls: [SAVE] [RESET] buttons in title bar

### 2. Stats Panel (Left Sidebar)
- Fixed width: 180px
- Spans rows 2-3 vertically
- Terminal window appearance
- Displays:
  - Money: $0
  - LoC: 0
  - Cred: 0
  - Power: 1 LoC/click
  - Auto: 0/sec
  - Passive: $0/sec
  - Total Clicks: 0

### 3. Ship Projects Panel (Main Left)
- Flexible width (1.2fr share)
- Internal scrolling (`overflow-y: auto`)
- Terminal-style window header
- **Tabs system:**
  - `[ STANDARD ]` - Standard Apps
  - `[ SAAS ]` - SaaS Projects
  - `[ OPEN SOURCE ]` - Open Source
- Tab content area with internal scrolling
- Each tab shows its category items

### 4. Upgrades Panel (Main Right)
- Flexible width (1fr share)
- Internal scrolling (`overflow-y: auto`)
- Terminal-style window header
- **Tabs system:**
  - `[ VIBE CODE ]` - Vibe Code Improvements
  - `[ DELEGATION ]` - Delegation Upgrades
- Tab content area with internal scrolling
- Each tab shows its category items

### 5. Bottom Bar (Prompt Area)
- Spans columns 2-3
- Contains:
  - Large **PROMPT** button
  - Random prompt display below
- Terminal-style border
- Background matches terminal theme

## Implementation Plan

### Phase 1: HTML Structure
1. Create new grid container layout
2. Build Title Panel with ASCII art and controls
3. Build Stats Panel with all stat rows
4. Build Ship Projects Panel with tab system
5. Build Upgrades Panel with tab system
6. Build Bottom Bar with prompt button
7. Add footer info area

### Phase 2: CSS Styling
1. Define CSS Grid layout
2. Style terminal window borders
3. Add tab styling (active/inactive states)
4. Implement internal scrolling for panels
5. Style scrollbars to match theme
6. Add hover and active states for interactive elements
7. Maintain existing color scheme (green/amber on dark)

### Phase 3: JavaScript Updates
1. Update DOM element IDs for new structure
2. Add tab switching functionality
3. Modify render functions to work with tab containers
4. Ensure floating text positions correctly
5. Test all game interactions

## File Changes Summary

### `index.html`
- Complete restructure with grid layout
- New panel structure with tabs
- Updated element IDs

### `styles.css`
- New CSS Grid layout rules
- Tab styling
- Internal scrolling rules
- Panel border styling
- Responsive overrides (desktop-focused)

### `game.js`
- Updated element selectors for new IDs
- New tab switching logic
- Modified render functions for tab-based content

## Visual Style

### Terminal Window Look
```
┌─ TITLE ─────────────┐
│                      │
│  Content here        │
│  with scrolling      │
│                      │
└──────────────────────┘
```

### Tab Style
```
┌─ SHIP PROJECTS ──────────────────┐
│ [ STANDARD ]  [ SAAS ]  [ OPEN ] │
├──────────────────────────────────┤
│                                  │
│    Scrolling content area        │
│                                  │
└──────────────────────────────────┘
```

## Next Steps

1. **Approve this plan** - Confirm the layout meets requirements
2. **Phase 1: HTML** - Create the new markup structure
3. **Phase 2: CSS** - Style the layout
4. **Phase 3: JavaScript** - Update game logic for new DOM
5. **Testing** - Verify all features work correctly

## Questions/Clarifications

- Should the tab system remember the last active tab on save/load?
- Should tabs have keyboard shortcuts (1, 2, 3)?
- Any specific terminal window chrome additions (e.g., window title bars with fake buttons)?

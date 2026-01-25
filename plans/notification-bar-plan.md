# NotificationBar Component Plan - Updated Layout

## Overview
Create a new `NotificationBar` component that displays game notifications in a vertical stack to the right of the TitlePanel, making use of currently blank space and centralizing all notifications in one clear location.

## New Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ROW 1: Title Row (3 columns)                                                │
├────────────────┬─────────────────────┬──────────────────────────────────────┤
│ Title Card     │ NotificationBar     │ Dev Buttons                          │
│ (static ASCII) │ [ notifications ]   │ [ 🐛 RESOURCES ] [ ⚙️ TUNING ]       │
│                │ [ scroll vertical ] │                                      │
├────────────────┼─────────────────────┴──────────────────────────────────────┤
│ ROW 2: Main Content (3 columns)                                             │
├────────────────┼─────────────────────┬──────────────────────────────────────┤
│ Stats Panel    │ Projects Panel      │ Upgrades Panel                       │
│                │                     │                                      │
│                │                     │                                      │
├────────────────┼─────────────────────┴──────────────────────────────────────┤
│ ROW 3: Action Row                                                            │
├────────────────┬─────────────────────┬──────────────────────────────────────┤
│                │ Prompt Text Area    │ [ >PROMPT ]                          │
│                │ >$ write_to_file     │                                      │
│                │   some code         │                                      │
├────────────────┴─────────────────────┴──────────────────────────────────────┤
│ ROW 4: Footer (full width)                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ SAVE ] [ RESET ]    Auto saves every 30s                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Changes from Previous Plan

1. **TitlePanel becomes just the ASCII title card** (no footer, no buttons)
2. **SAVE/RESET buttons move to new row** below main content
3. **NotificationBar** in top row, middle column
4. **Debug buttons** in top row, right column
5. **Footer** simplified to just auto-save text

## NotificationBar Component (`src/lib/components/NotificationBar.svelte`)

### Features
- **Vertical notification stack** in middle column of top row
- **Two notification types** displayed:
  - **Type A** (Footer notifications): "Saved", "Prestige", "Debt", "Reset"
  - **Type B** (Title notifications): "Upgrades", "Projects", "Debug", "Errors"
- **Auto-dismiss**: Notifications fade out after 3 seconds
- **Animation**: Smooth slide-in from the right
- **Queue management**: Show up to 5 most recent notifications

### Props
None - subscribes directly to store.notificationQueue

### Styling
- Grid position: row 1, column 2
- Full height of row 1, or flexible based on content
- Overflow: auto/scroll for many notifications
- Colors: Based on notification type (success/warning/info)

## Store Changes (`src/lib/game/store.svelte.ts`)

### Remove
- `footerNotification` state
- `titleNotification` state

### Add
```typescript
interface QueuedNotification {
    id: number;
    message: string;
    type: 'success' | 'warning' | 'info';
    category: 'footer' | 'title';
    timestamp: number;
}

notificationQueue = $state<QueuedNotification[]>([]);
```

### Update `showNotification()` method
- Route notifications by content to categories
- Add to queue with ID and timestamp
- Queue auto-trims to last 5 notifications after 3 seconds

## TitlePanel Simplification (`src/lib/components/TitlePanel.svelte`)

### Remove
- `title-notification` div
- `footer-notification` conditional
- SAVE/RESET buttons (move to new ActionRow)
- "Auto saves every 30s" indicator (move to footer)
- All notification-related CSS

### Keep
- Static ASCII title only

## New Components Needed

### ActionRow Component (`src/lib/components/ActionRow.svelte`)
- Contains:
  - Empty left column (for alignment)
  - Prompt text display
  - Prompt button (moved from PromptPanel)
  - SAVE/RESET buttons (moved from TitlePanel)

### Footer Component (`src/lib/components/Footer.svelte`)
- Contains:
  - "Auto saves every 30s" text
  - Optional: active debt indicator

## App.svelte Updates

### New Grid Layout
```css
.terminal-dashboard {
    display: grid;
    grid-template-columns: 200px 1fr 1fr;
    grid-template-rows: auto 1fr auto auto; /* title, main, action, footer */
    /* ... */
}
```

### Template Structure
```svelte
<div class="terminal-dashboard">
    <TitlePanel />
    <NotificationBar />
    <DebugToolbar /> <!-- Moves to top-right of row 1 -->

    <StatsPanel />
    <ProjectsPanel />
    <UpgradesPanel />

    <ActionRow /> <!-- New: SAVE/RESET + Prompt -->
    <Footer />    <!-- New: Auto-save text -->
</div>
```

## Implementation Order

1. **Update store.svelte.ts**
   - Replace dual notification states with unified queue
   - Update showNotification() to push to queue
   - Add queue cleanup logic

2. **Create NotificationBar.svelte**
   - Subscribe to store.notificationQueue
   - Render vertical stack of notifications
   - Add auto-dismiss and animation logic
   - Style with terminal theme

3. **Create ActionRow.svelte**
   - SAVE/RESET buttons (from TitlePanel)
   - Prompt text display
   - Prompt button (from PromptPanel)

4. **Create Footer.svelte**
   - "Auto saves every 30s" text
   - Active debt indicator (optional)

5. **Simplify TitlePanel.svelte**
   - Keep only static ASCII title
   - Remove all buttons and notifications

6. **Update App.svelte**
   - Update grid layout
   - Add new components
   - Remove old notification logic

7. **Cleanup**
   - Remove unused notification states from store
   - Verify all notifications route correctly

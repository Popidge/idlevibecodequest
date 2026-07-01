import { writable } from 'svelte/store';

// Mobile-specific UI state
export type MobileTab = 'projects' | 'upgrades' | 'stats' | 'info';

export const mobileTab = writable<MobileTab>('projects');

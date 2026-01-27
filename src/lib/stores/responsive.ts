import { writable, derived } from 'svelte/store';

// Debounce helper for resize events
function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// Viewport dimensions with debouncing
function createViewportStore() {
    const { subscribe, set } = writable({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768
    });

    if (typeof window !== 'undefined') {
        const handleResize = debounce(() => {
            set({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }, 150); // 150ms debounce for smoother resizing

        window.addEventListener('resize', handleResize);
        
        // Also handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                set({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }, 100);
        });
    }

    return { subscribe };
}

export const viewport = createViewportStore();

// Breakpoint detection
export const isMobile = derived(
    viewport,
    $viewport => $viewport.width < 768
);

export const isTablet = derived(
    viewport,
    $viewport => $viewport.width >= 768 && $viewport.width < 1024
);

export const isDesktop = derived(
    viewport,
    $viewport => $viewport.width >= 1024
);

// Mobile-specific UI state
export type MobileTab = 'projects' | 'upgrades' | 'stats' | 'info';

export const mobileTab = writable<MobileTab>('projects');

// Helper to check if touch device (rough heuristic)
export const isTouchDevice = derived(
    viewport,
    () => {
        if (typeof window === 'undefined') return false;
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
);

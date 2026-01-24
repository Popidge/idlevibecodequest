// Environment helper for debug mode and other environment checks

/**
 * Check if debug mode is enabled via VITE_DEBUG_MODE environment variable.
 * Debug mode should only be enabled in development builds.
 */
export function isDebugMode(): boolean {
    return import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.VITE_DEBUG_MODE === true;
}

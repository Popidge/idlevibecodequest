// Environment helper for debug mode and other environment checks

/**
 * Determines whether debug mode is enabled by inspecting VITE_DEBUG_MODE.
 *
 * @returns `true` if VITE_DEBUG_MODE is the string 'true' or the boolean `true`, `false` otherwise.
 */
export function isDebugMode(): boolean {
    return import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.VITE_DEBUG_MODE === true;
}
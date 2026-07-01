import { describe, expect, it } from 'vitest';
import { RANDOM_EVENT_CONFIG, shouldTriggerRandomEvent } from './event-registry';

describe('random event scheduling', () => {
    it('does not interrupt the opening delay', () => {
        expect(shouldTriggerRandomEvent(RANDOM_EVENT_CONFIG.MIN_TRIGGER_DELAY - 1, 0)).toBe(false);
    });

    it('uses random rolls inside the event window', () => {
        expect(shouldTriggerRandomEvent(RANDOM_EVENT_CONFIG.MIN_TRIGGER_DELAY, 0)).toBe(true);
        expect(shouldTriggerRandomEvent(RANDOM_EVENT_CONFIG.MIN_TRIGGER_DELAY, 1)).toBe(false);
    });

    it('guarantees an event at the maximum delay', () => {
        expect(shouldTriggerRandomEvent(RANDOM_EVENT_CONFIG.MAX_TRIGGER_DELAY, 1)).toBe(true);
    });
});

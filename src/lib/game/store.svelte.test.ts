import { beforeEach, describe, expect, it } from 'vitest';
import { createDefaultGameState } from './state';
import { store } from './store.svelte';

describe('prestige progression flow', () => {
    beforeEach(() => {
        store.gameState = createDefaultGameState(100);
        store.showPrestigeModal = false;
        store.showPrestigeSummaryModal = false;
        store.showTechTreeModal = false;
        store.pendingPrestigePoints = 0;
        store.selectedPrestigePath = null;
        store.activeTechTreeTab = 'buyout';
        store.notificationQueue = [];
    });

    it('uses the configured weighted-upgrade target', () => {
        expect(store.prestigeUpgradeTarget).toBe(110);
        store.gameState.upgrades.vibeCode[10] = 10;
        expect(store.isPrestigeAvailable).toBe(false);
        store.gameState.upgrades.delegation[10] = 1;
        expect(store.isPrestigeAvailable).toBe(true);
    });

    it('opens the selected path tree after prestige when its next perk is affordable', () => {
        store.gameState.upgrades.vibeCode[10] = 11;
        store.openPrestigeConfirmation();
        store.selectPrestigePath('nirvana');
        store.performPrestige('nirvana');

        expect(store.gameState.prestige?.totalPrestiges).toBe(1);
        expect(store.showPrestigeModal).toBe(false);
        expect(store.showTechTreeModal).toBe(true);
        expect(store.activeTechTreeTab).toBe('nirvana');
    });

    it('falls back to another tree when the selected path has no affordable perk', () => {
        store.gameState.prestige!.techTrees.nirvana = [0];
        store.gameState.upgrades.vibeCode[10] = 11;
        store.openPrestigeConfirmation();
        store.selectPrestigePath('nirvana');
        store.performPrestige('nirvana');

        expect(store.showTechTreeModal).toBe(true);
        expect(store.activeTechTreeTab).toBe('buyout');
    });
});

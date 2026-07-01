<script lang="ts">
    import { store, formatMoney, formatNumber } from '$lib/game/store.svelte';
</script>

<div class="desktop-status" aria-label="Current resources">
    <div class="status-item money"><span>MONEY</span><strong>${formatMoney(store.gameState.resources.money)}</strong></div>
    <div class="status-item"><span>LoC</span><strong>{formatNumber(store.gameState.resources.loc)}</strong></div>
    <div class="status-item"><span>CRED</span><strong>{formatNumber(store.gameState.resources.cred)}</strong></div>
    <button class="status-item debt" onclick={() => store.showDebtModal = true}>
        <span>DEBT</span><strong class:warning={store.isDebtWarning}>{store.debtPercentageDisplay}</strong>
    </button>
    <div class="status-item"><span>+LoC/CLICK</span><strong>{formatNumber(store.effectiveClickPower)}</strong></div>
    <div class="status-item"><span>+LoC/SEC</span><strong>{formatNumber(store.effectivePassiveLocRate)}</strong></div>
    <div class="status-item"><span>PASSIVE</span><strong>${formatMoney(store.effectivePassiveIncome)}/s</strong></div>
</div>

<style>
    .desktop-status { display:grid; grid-template-columns:1.2fr repeat(6,1fr); min-height:72px; border-bottom:1px solid color-mix(in srgb,var(--border-color) 45%,transparent); background:color-mix(in srgb,var(--panel-bg) 60%,transparent); }
    .status-item { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; min-width:0; border:0; border-right:1px solid color-mix(in srgb,var(--border-color) 22%,transparent); background:transparent; color:inherit; font-family:var(--font-family); }
    .status-item:last-child { border-right:0; }
    .status-item span { color:var(--text-dim); font-size:11px; letter-spacing:1px; }
    .status-item strong { color:var(--text-primary); font-size:20px; line-height:1; text-shadow:0 0 14px color-mix(in srgb,var(--text-primary) 22%,transparent); white-space:nowrap; }
    .status-item.money strong { color:var(--text-amber); font-size:24px; }
    button.status-item { cursor:pointer; }
    button.status-item:hover { background:color-mix(in srgb,var(--button-hover) 75%,transparent); }
    .warning { color:var(--text-danger) !important; }
</style>

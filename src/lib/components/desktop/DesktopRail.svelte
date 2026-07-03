<script lang="ts">
    import { store, formatMoney, formatNumber } from '$lib/game/store.svelte';
    import ProgressBar from '../ProgressBar.svelte';

    let cheapestUpgrade = $derived(store.cheapestUpgrade);
    let nextLabel = $derived(cheapestUpgrade
        ? `${cheapestUpgrade.type === 'vibeCode' ? 'Vibe Code' : 'Delegation'} L${cheapestUpgrade.level}`
        : 'All upgrades acquired');
</script>

<aside class="desktop-rail">
    <section class="identity">
        <div class="eyebrow">DEV IDENTITY</div>
        <div class="avatar" aria-hidden="true">Λ</div>
        <strong>IVCQ</strong>
        <span>RANK: {store.totalPrestigePoints > 0 ? 'VIBE ADEPT' : 'UNRANKED'}</span>
    </section>

    <section class="prestige">
        <span>TOTAL PRESTIGE POINTS</span>
        <strong>★ {store.totalPrestigePoints}</strong>
        <small>({store.gameState.prestige?.totalPrestiges ?? 0} prestiges)</small>
        {#if (store.gameState.prestige?.totalPrestiges ?? 0) > 0}
            <div class="prestige-progress">
                <span>NEXT PRESTIGE</span>
                <ProgressBar
                    current={store.totalUpgradesOwned}
                    max={store.prestigeUpgradeTarget}
                    label={`${store.totalUpgradesOwned} / ${store.prestigeUpgradeTarget} pts`}
                />
            </div>
        {/if}
    </section>

    {#if cheapestUpgrade}
        <section class="next-upgrade">
            <span>NEXT UPGRADE</span>
            <strong>{nextLabel}</strong>
            <ProgressBar current={store.gameState.resources.money} max={cheapestUpgrade.cost} label={`$${formatMoney(store.gameState.resources.money)} / $${formatMoney(cheapestUpgrade.cost)}`} />
        </section>
    {/if}

    <div class="rail-actions">
        {#if store.randomEventState.active && store.activeRandomEvent}
            <button class="event-action" onclick={() => store.engageRandomEvent()}>
                ⚡ EVENT: {store.activeRandomEvent.name} ({store.randomEventState.timer}s)
            </button>
        {/if}
        {#if store.isPrestigeAvailable}
            <button class="prestige-action" onclick={() => store.openPrestigeConfirmation()}>
                ★ PRESTIGE AVAILABLE (+{store.prestigePointsToEarn})
            </button>
        {/if}
        <button class="tech-tree-action" onclick={() => store.openTechTree()}>⌘ &nbsp; TECH TREE &nbsp;›</button>
        <button onclick={() => store.openHowToPlay()}>▣ &nbsp; HOW TO PLAY &nbsp;›</button>
    </div>

    <section class="rates">
        <div><span>Power</span><strong>{formatNumber(store.effectiveClickPower)} LoC/click</strong></div>
        <div><span>Delegation</span><strong>{formatNumber(store.effectivePassiveLocRate)} LoC/sec</strong></div>
        <div><span>Passive</span><strong>${formatMoney(store.effectivePassiveIncome)}/sec</strong></div>
    </section>
</aside>

<style>
    .desktop-rail { grid-area:rail; min-width:0; padding:14px 12px; border-right:1px solid color-mix(in srgb,var(--border-color) 38%,transparent); display:flex; flex-direction:column; gap:14px; background:color-mix(in srgb,var(--panel-bg) 45%,transparent); }
    section { border:1px solid color-mix(in srgb,var(--border-color) 35%,transparent); border-radius:var(--border-radius); padding:13px 11px; }
    .identity { display:flex; flex-direction:column; align-items:center; gap:8px; }
    .eyebrow, section>span { color:var(--text-dim); font-size:10px; letter-spacing:1px; align-self:flex-start; }
    .avatar { width:72px; height:72px; display:grid; place-items:center; margin-top:4px; border:3px double var(--text-secondary); color:var(--text-primary); font-size:54px; line-height:1; text-shadow:4px 3px 0 var(--text-dim); }
    .identity strong { font-size:16px; letter-spacing:1px; }
    .identity>span { color:var(--text-dim); font-size:10px; }
    .prestige { display:flex; flex-direction:column; align-items:center; gap:7px; }
    .prestige>span { align-self:center; color:var(--text-amber); }
    .prestige strong { color:var(--text-amber); font-size:24px; }
    .prestige small { color:var(--text-dim); }
    .prestige-progress { width:100%; display:flex; flex-direction:column; align-items:center; gap:6px; margin-top:5px; padding-top:9px; border-top:1px dashed color-mix(in srgb,var(--text-amber) 45%,transparent); }
    .prestige-progress>span { color:var(--text-dim); font-size:9px; letter-spacing:1px; }
    .next-upgrade { display:flex; flex-direction:column; gap:9px; }
    .next-upgrade strong { color:var(--text-secondary); font-size:13px; text-align:center; padding:5px; border:1px solid color-mix(in srgb,var(--text-secondary) 45%,transparent); }
    .rail-actions { display:flex; flex-direction:column; gap:8px; }
    button { min-height:44px; background:transparent; border:1px solid var(--text-dim); border-radius:var(--border-radius); color:var(--text-secondary); font:12px var(--font-family); cursor:pointer; }
    button.tech-tree-action { border-color:var(--text-cyan); color:var(--text-cyan); }
    button.event-action { border-color:var(--text-magenta); color:var(--text-white); background:color-mix(in srgb,var(--text-magenta) 14%,transparent); animation:event-pulse .8s ease-in-out infinite; }
    button.prestige-action { border-color:var(--text-amber); color:var(--text-white); background:color-mix(in srgb,var(--text-amber) 14%,transparent); animation:prestige-pulse 1.2s ease-in-out infinite; }
    button:hover { background:var(--button-hover); color:var(--text-primary); }
    .rates { margin-top:auto; display:flex; flex-direction:column; gap:10px; border-style:dashed; }
    .rates div { display:flex; justify-content:space-between; gap:8px; font-size:10px; }
    .rates span { color:var(--text-dim); }
    .rates strong { color:var(--text-amber); font-weight:normal; text-align:right; }
    @keyframes event-pulse { 50% { box-shadow:0 0 14px color-mix(in srgb,var(--text-magenta) 55%,transparent); } }
    @keyframes prestige-pulse { 50% { box-shadow:0 0 14px color-mix(in srgb,var(--text-amber) 45%,transparent); } }
</style>

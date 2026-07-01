<script lang="ts">
    let {
        label,
        description,
        expanded,
        controls,
        onToggle
    }: {
        label: string;
        description: string;
        expanded: boolean;
        controls: string;
        onToggle: () => void;
    } = $props();
</script>

<button
    class="locked-toggle"
    class:expanded
    onclick={onToggle}
    aria-expanded={expanded}
    aria-controls={controls}
>
    <span>▣ &nbsp; {label} <b>{expanded ? '⌃' : '⌄'}</b></span>
    <small>{description}</small>
</button>

<style>
    .locked-toggle { display:none; }

    @media (min-width:1101px) {
        .locked-toggle { width:100%; min-height:58px; margin-top:10px; padding:11px 13px; display:flex; flex-direction:column; justify-content:center; align-items:stretch; gap:6px; border:1px dashed color-mix(in srgb,var(--text-amber) 55%,transparent); border-radius:var(--border-radius); color:var(--text-amber); background:transparent; font-family:var(--font-family); text-align:left; cursor:pointer; }
        .locked-toggle:hover, .locked-toggle.expanded { background:color-mix(in srgb,var(--text-amber) 7%,transparent); border-color:var(--text-amber); }
        .locked-toggle span { display:flex; justify-content:space-between; }
        .locked-toggle small { color:var(--text-dim); padding-left:22px; }
    }
</style>

# Upstream provenance

## Prototype compatibility baseline

Rice Bar Unbound's first Acer prototype is derived from Omarchy tag `v4.0.2`, commit `346e69e1cec6c4e8924531874af6ba010a1bc99e`.

Copied from that revision:
- `shell/plugins/bar/Bar.qml` → `upstream/omarchy-v4.0.2/Bar.qml`, then adapted as root `Bar.qml`.
- `shell/plugins/bar/BarModel.js` → `upstream/omarchy-v4.0.2/BarModel.js`, then adapted as root `BarModel.js` for configured-instance identity fixes.

Omarchy is MIT licensed; its notices are retained in derived files and the project license.

## Necessary departure from the research plan

At implementation start, remote `quattro` was `446fbc28b15b010980974ba2eeb97e610e4e5d3a`, but the Acer runs Omarchy `4.0.2-1` / Quickshell `0.3.1-1`, matching tag `v4.0.2` by installed-file hashes. Current `quattro` injects newer scoped API objects (`PluginBarWidgetRegistryApi`, `PluginRegistryApi`, `PluginShellApi`, `PluginBarApi`) that are absent from 4.0.2. Vendoring current `quattro` would not load on the target.

The prototype therefore pins v4.0.2 and preserves that host's compatibility behavior. This is a hardware-prototype decision, not the public-release baseline. Before release, manually rebase the compatibility core onto current `quattro`, retain its scoped `PluginBarApi` security boundary for third-party widgets, and rerun the complete Acer matrix. Do not auto-merge upstream drift.

## Drift policy

`scripts/check-upstream.mjs` verifies both pinned v4.0.2 snapshots. Root `Bar.qml` and `BarModel.js` are intentionally adapted while the snapshots remain immutable comparison bases. When `OMARCHY_UPSTREAM` points at an Omarchy checkout, the check also verifies the checkout contains the pinned commit and reports current `origin/quattro` drift. Any difference is reviewed manually.

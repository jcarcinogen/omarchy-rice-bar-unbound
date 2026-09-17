# Rice Bar Unbound

[![Tip with X Money](tip-with-x-money.png)](https://x.com/scottito22)

An independent full replacement bar for Omarchy Quattro. This paused prototype uses a compact, Nisfere-inspired composition with soft theme-colored capsules while hosting Omarchy's real widgets and panels.

- Preserves your configured left, center, and right widget order, with the stock Omarchy menu glyph.
- Keeps the clock anchored at the center and weather beside it; third-party entries get extension capsules in their configured section.
- Uses a 40 px strip with 30 px capsules, quiet surfaces, and no bright gradient outlines.
- Scrollable sections expose an overflow button only when needed. No extra active-window title or duplicate control launcher is injected.
- The hosted stock tray shows every active tray item without a chevron or hover drawer; saved pin/hide settings are left intact for returning to stock. Tray icons follow the foreground, with bundled original symbolic fallbacks for 1Password and OpenBubbles.
- Top/bottom show workspace lanes 1–10. Left/right show 1–5 plus live workspaces 6–0.
- Side bars use stacked theme-colored capsules, with scrollable overflow to keep every configured widget reachable.

> Prototype status: horizontal and side capsule layouts, pinned to Omarchy 4.0.2 for the Acer hardware trial. Not marketplace-listed. Not release-ready.

## Install

```bash
omarchy plugin add https://github.com/jcarcinogen/omarchy-rice-bar-unbound.git --yes
cp -a ~/.config/omarchy/shell.json ~/.config/omarchy/shell.json.bak.$(date +%Y%m%d-%H%M%S)
omarchy bar use io.github.jcarcinogen.rice-bar-unbound
omarchy-restart-shell
```

This replaces the active bar provider. It does not enable or change Rice Bar (`io.github.jcarcinogen.rice-bar`).

## Recovery

```bash
omarchy bar use omarchy.bar
omarchy-restart-shell
```

Never use `omarchy-refresh-shell` for plugin development; it can replace `shell.json`.

## Uninstall

```bash
omarchy bar use omarchy.bar
omarchy-restart-shell
omarchy plugin remove io.github.jcarcinogen.rice-bar-unbound --yes
```

## Development

```bash
node --test tests/*.test.js
omarchy plugin validate .
```

Live copies belong under:

```text
~/.config/omarchy/plugins/io.github.jcarcinogen.rice-bar-unbound/
```

Then reload with `omarchy-restart-shell`. `omarchy-shell shell rescanPlugins` does not reload already-mounted QML.

## Attribution

Root `Bar.qml` and `BarModel.js` are derived from Omarchy v4.0.2 under MIT; see `UPSTREAM.md`. Nisfere is credited only as visual inspiration. No Nisfere code, assets, services, or theme engine are included.

## License

MIT — see [LICENSE](LICENSE).

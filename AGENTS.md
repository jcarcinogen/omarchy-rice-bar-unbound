# Rice Bar Unbound agent rules

Rice Bar Unbound is a full Omarchy Quattro `bar` provider, independent from Rice Bar.

## Boundaries
- Plugin id: `io.github.jcarcinogen.rice-bar-unbound`; MVP kind: `bar` only.
- Use the stock Omarchy glyph. Do not add an OMARCHY wordmark or Rice Bar logo to the bar.
- Nisfere is visual inspiration only. Copy no Nisfere code, assets, services, animations, theme engine, or daemon.
- Reuse hosted Omarchy widgets and their panels; do not reimplement system services or a control center.
- Preserve every configured entry exactly once. Unknown and third-party entries stay reachable in an extension capsule.
- Host-injected root properties must not be `required` because Omarchy assigns them after async creation.
- Prototype baseline is Omarchy v4.0.2 for Acer compatibility. The current `quattro` security-facade rebase is required before release; see `UPSTREAM.md`.

## Safety and lifecycle
- Keep the existing `io.github.jcarcinogen.rice-bar` installed, unchanged, and disabled.
- Keep all experiments uncommitted and unpushed until Scott personally tests and authorizes repository operations.
- Never run `omarchy-refresh-shell`; it can replace `~/.config/omarchy/shell.json`.
- Before selecting Unbound, back up `~/.config/omarchy/shell.json` with a timestamp.
- Recovery: `omarchy bar use omarchy.bar` then `omarchy-restart-shell`.
- Exercise on the Acer before any commit. Validate there with `omarchy plugin validate .` and `qmllint -I "$OMARCHY_PATH/shell"` on every QML file.

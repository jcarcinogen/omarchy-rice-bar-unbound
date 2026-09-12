const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("root entry remains safe for asynchronous host injection", () => {
  const qml = read("Bar.qml");
  for (const name of ["omarchyPath", "barWidgetRegistry", "barConfig", "shell", "manifest"])
    assert.doesNotMatch(qml, new RegExp(`required\\s+property\\s+\\w+\\s+${name}\\b`));
  assert.match(qml, /readonly property bool hostReady:/);
});

test("runtime uses project grouping and separate presentation components", () => {
  const qml = read("Bar.qml");
  assert.match(qml, /import "UnboundModel\.js" as UnboundModel/);
  assert.match(qml, /UnboundModel\.mapSectionCapsules\(visualLayout\)/);
  assert.match(qml, /Styles\.NisfereInspired/);
  assert.doesNotMatch(qml, /Components\.ActiveWindowCapsule/);
  assert.doesNotMatch(qml, /Components\.ControlLauncher/);
  for (const file of [
    "components/Capsule.qml",
    "components/ActiveWindowCapsule.qml",
    "components/ControlLauncher.qml",
    "components/ControlLauncherPopup.qml",
    "styles/VisualTokens.qml",
    "styles/NisfereInspired.qml"
  ]) assert.ok(fs.existsSync(path.join(root, file)), `${file} exists`);
});

test("active window renders untrusted title as plain elided text and sanitizes icon name", () => {
  const qml = read("components/ActiveWindowCapsule.qml");
  assert.match(qml, /ToplevelManager\.activeToplevel/);
  assert.match(qml, /Text\.PlainText/);
  assert.match(qml, /Text\.ElideRight/);
  assert.match(qml, /UnboundModel\.safeIconName/);
  assert.match(qml, /UnboundModel\.cleanTitle/);
  assert.match(qml, /Quickshell\.iconPath\([^,]+,\s*true\)[\s\S]*application-x-executable/);
});

test("launcher closes before routing through the stock summon method", () => {
  const qml = read("components/ControlLauncherPopup.qml");
  assert.match(qml, /root\.close\(\)[\s\S]*Qt\.callLater[\s\S]*summonBarWidget/);
});

test("tray reuses stock menus but exposes every active icon without a drawer", () => {
  const qml = read("components/AlwaysVisibleTray.qml");
  assert.match(qml, /Stock.Tray/);
  assert.match(qml, /category !== "pinned"/);
  assert.match(qml, /SystemTray.items.values/);
  assert.match(qml, /password-symbolic.svg/);
  assert.match(qml, /bubbles-symbolic.svg/);
  assert.match(qml, /function iconIsSymbolic\(icon\) \{ return true \}/);
  assert.match(qml, /openPanelIndicatorWidth: trayItemExtent/);
  assert.match(qml, /activeTrayAnchor\.mapToItem\(unboundTray/);
  const bar = read("Bar.qml");
  assert.match(bar, /openPanelIndicatorCenterX/);
  assert.match(bar, /openPanelIndicatorCenterY/);
  assert.match(bar, /slot\.panelIndicatorCenter - width \/ 2/);
  assert.match(read("Bar.qml"), /moduleName === "omarchy.tray" && firstParty/);
});

test("side workspaces show five defaults plus live extras; horizontal keeps ten", () => {
  const qml = read("components/AlwaysVisibleWorkspaces.qml");
  assert.match(qml, /Stock.Workspaces/);
  const body = qml.match(/function workspaceIds\(\) \{([\s\S]*?)\n          \}/)[1];
  const workspaceIds = new Function("Hyprland", body);
  const live = { workspaces: { values: [{ id: 9 }, { id: 6 }, { id: 10 }, { id: -1 }, { id: 11 }] } };
  assert.deepEqual(workspaceIds.call({ vertical: true }, { workspaces: { values: [] } }), [1, 2, 3, 4, 5]);
  assert.deepEqual(workspaceIds.call({ vertical: true }, live), [1, 2, 3, 4, 5, 6, 9, 10]);
  assert.deepEqual(workspaceIds.call({ vertical: false }, live), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const bar = read("Bar.qml");
  assert.match(bar, /moduleName === "omarchy.workspaces" && firstParty/);
  assert.match(bar, /unboundWorkspacesComponent/);
});

test("side presentation uses grouped capsules and vertical overflow", () => {
  const qml = read("Bar.qml");
  assert.match(qml, /component VerticalSectionCapsules: Item/);
  assert.match(qml, /flickableDirection: Flickable.VerticalFlick/);
  assert.match(qml, /color: sideTokens.capsuleTop/);
  assert.match(qml, /Math.max\(60, barSize \+ 12\)/);
  assert.match(qml, /root.vertical \? root.surfaceSize - 12 : activeItem.implicitWidth/);
  assert.match(qml, /root.vertical && slot.activeItem \? slot.activeItem.implicitWidth : slot.width/);
  for (const region of ["left", "center", "right"])
    assert.match(qml, new RegExp(`VerticalSectionCapsules \\{[\\s\\S]*?groups: root.visualSections.${region}`));
});

test("legacy panels can clear hover suppression before closing", () => {
  const qml = read("components/PluginBarFacade.qml");
  assert.doesNotMatch(qml, /readonly property bool centerHoverRevealSuppressed/);
  assert.match(qml, /onCenterHoverRevealSuppressedChanged:/);
  assert.match(qml, /on_CenterHoverRevealSuppressedChanged:/);
});

test("third-party facades receive a detached live layout snapshot", () => {
  const qml = read("Bar.qml");
  assert.match(qml, /visualLayout:\s*UnboundModel\.rawLayout\(/);
  assert.match(qml, /layoutConfig:\s*root\.publicLayoutConfig\(\)/);
});

test("third-party widgets receive a detached project-local scoped bar facade", () => {
  const qml = read("Bar.qml");
  const facade = read("components/PluginBarFacade.qml");
  const shellFacade = read("components/PluginShellFacade.qml");
  assert.match(qml, /metadataFor\([\s\S]*firstParty/);
  assert.match(qml, /firstParty\s*\?\s*root\s*:\s*scopedBarApi/);
  assert.doesNotMatch(facade, /property\s+var\s+(root|registry)\b/);
  assert.match(shellFacade, /requestedId\)[\s\S]*requestedId[\s\S]*moduleName[\s\S]*return null/);
});

test("module settings navigation and drag paths carry configured-instance identity", () => {
  const qml = read("Bar.qml");
  assert.match(qml, /property int sourceIndex:/);
  assert.match(qml, /readonly property string instanceKey:/);
  assert.match(qml, /slot\.instanceKey\s*!==\s*change\.instanceKey/);
  assert.match(qml, /sourceIndex:\s*root\.sourceIndexFor\(modelData\.sourceRegion,[^\n]*modelData\.sourceIndex\)/);
  assert.match(qml, /BarModel\.moveEntry\(config, source\.region, source\.sourceIndex/);
});

test("transparent mode clears the style strip while retaining capsule paint", () => {
  const bar = read("Bar.qml");
  const style = read("styles/NisfereInspired.qml");
  const capsule = read("components/Capsule.qml");
  assert.match(bar, /Styles\.NisfereInspired\s*\{[\s\S]*transparent:\s*root\.transparent/);
  assert.match(style, /property bool transparent/);
  assert.match(style, /color:\s*root\.transparent\s*\?\s*"transparent"\s*:\s*tokens\.stripColor/);
  assert.match(capsule, /capsuleTop/);
});

test("every section has reachable overflow without moving extensions", () => {
  const qml = read("Bar.qml");
  assert.match(qml, /component SectionCapsules: Item/);
  assert.doesNotMatch(qml, /visible: contentItem && contentItem.implicitWidth/);
  assert.match(qml, /readonly property int surfaceSize:/);
  assert.match(qml, /id:\s*sectionScroller[\s\S]*interactive:\s*contentWidth\s*>\s*width/);
  assert.match(qml, /id:\s*overflowAffordance[\s\S]*text:\s*"⋯"/);
  assert.match(qml, /GroupedModuleList \{ moduleRows: capsuleGroup.modelData.rows \}/);
  for (const region of ["left", "center", "right"])
    assert.ok(qml.includes(`groups: root.visualSections.${region}`));
});

test("capsules use quiet opaque surfaces instead of bright gradient outlines", () => {
  const qml = read("components/Capsule.qml");
  assert.doesNotMatch(qml, /GradientStop|color: "transparent"/);
  assert.match(qml, /color: tokens.capsuleTop/);
  assert.match(qml, /implicitWidth: contentLoader.implicitWidth > 0/);
});

test("clock anchor and center hover retain stock behavior", () => {
  const qml = read("Bar.qml");
  assert.match(qml, /anchorOffset: \{/);
  assert.match(qml, /onHoveredChanged: root.setCenterSectionHovered/);
  assert.match(read("styles/NisfereInspired.qml"), /horizontalCenterOffset: root.centerShift/);
});
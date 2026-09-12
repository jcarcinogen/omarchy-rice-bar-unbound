const test = require("node:test");
const assert = require("node:assert/strict");
const Model = require("../UnboundModel.js");

test("section capsules preserve Omarchy placement, order and extension instances", () => {
  const layout = {
    left: [{id:"omarchy.menu"}, {id:"omarchy.workspaces"}],
    center: [{id:"omarchy.indicators"}, {id:"omarchy.clock"}, {id:"third.weather"}, {id:"omarchy.system-update"}],
    right: [{id:"omarchy.tray"}, {id:"third.extra"}, null, {id:"omarchy.audio"}, {id:"omarchy.audio"}]
  };
  const sections = Model.mapSectionCapsules(layout);
  for (const region of ["left", "center", "right"]) {
    assert.deepEqual(sections[region].flatMap(group => group.rows.map(row => row.entry)), layout[region]);
    assert.deepEqual(sections[region].flatMap(group => group.rows.map(row => row.instanceKey)), layout[region].map((_, index) => `${region}:${index}`));
  }
  assert.deepEqual(sections.center.map(group => group.extension), [false, true, false]);
  assert.deepEqual(sections.right.map(group => group.extension), [false, true, false]);
  assert.deepEqual(Model.mapSectionCapsules(null), {left:[], center:[], right:[]});
});

test("unknown and malformed styles normalize to nisfere-inspired", () => {
  assert.equal(Model.normalizeStyle("nisfere-inspired"), "nisfere-inspired");
  assert.equal(Model.normalizeStyle("NISFERE-INSPIRED"), "nisfere-inspired");
  assert.equal(Model.normalizeStyle("other"), "nisfere-inspired");
  assert.equal(Model.normalizeStyle(null), "nisfere-inspired");
});

test("fixed grouping maps every configured instance exactly once in stable order", () => {
  const layout = {
    left: [{id:"omarchy.menu"}, {id:"omarchy.workspaces"}],
    center: [{id:"omarchy.indicators"}, {id:"omarchy.clock"}, {id:"third.clock-extra"}],
    right: [{id:"omarchy.tray"}, {id:"omarchy.network"}, {id:"third.weather", unit:"c"}, {id:"omarchy.power"}]
  };
  const groups = Model.mapFixedClusters(layout);
  assert.deepEqual(groups.left.map(x => x.entry.id), ["omarchy.menu", "omarchy.workspaces"]);
  assert.deepEqual(groups.center.map(x => x.entry.id), ["omarchy.clock"]);
  assert.deepEqual(groups.status.map(x => x.entry.id), ["omarchy.indicators", "omarchy.tray", "omarchy.network", "omarchy.power"]);
  assert.deepEqual(groups.extension.map(x => x.entry.id), ["third.clock-extra", "third.weather"]);
  const all = [...groups.left, ...groups.center, ...groups.status, ...groups.extension];
  assert.deepEqual(all.map(x => x.instanceKey).sort(), ["center:0", "center:1", "center:2", "left:0", "left:1", "right:0", "right:1", "right:2", "right:3"].sort());
});

test("duplicate ids remain distinct configured instances", () => {
  const groups = Model.mapFixedClusters({left:[],center:[],right:[{id:"omarchy.indicators",items:["Dnd"]},{id:"omarchy.indicators",items:["NightLight"]}]});
  assert.equal(groups.status.length, 2);
  assert.notEqual(groups.status[0].instanceKey, groups.status[1].instanceKey);
});

test("malformed entries are preserved in extension rather than dropped", () => {
  const raw = Model.rawLayout({left:[null, {}, "custom-widget"],center:"bad",right:[]});
  const groups = Model.mapFixedClusters(raw);
  assert.equal(groups.extension.length, 3);
  assert.deepEqual(groups.extension.map(x => x.instanceKey), ["left:0", "left:1", "left:2"]);
  assert.deepEqual(raw.center, []);
});

test("safe icon names reject paths urls and image providers", () => {
  assert.equal(Model.safeIconName("org.mozilla.firefox"), "org.mozilla.firefox");
  for (const value of ["/tmp/icon.png", "../icon", "file:///tmp/a", "https://x/a", "image://provider/a", "bad icon"]) {
    assert.equal(Model.safeIconName(value), "application-x-executable");
  }
});

test("window titles are plain bounded text inputs", () => {
  assert.equal(Model.cleanTitle("  Hello\nworld  "), "Hello world");
  assert.equal(Model.cleanTitle("<b>unsafe</b>"), "<b>unsafe</b>");
  assert.equal(Model.cleanTitle(null), "");
  assert.equal(Model.cleanTitle("x".repeat(700)).length, 512);
});

test("top geometry protects the true center and caps side clusters", () => {
  assert.deepEqual(Model.topGeometry(2880, 440), {edgeInset:20, gap:15, barHeight:40, capsuleHeight:30,centerWidth:440,protectedHalf:250,sideMax:1155});
  assert.deepEqual(Model.topGeometry(640, 900), {edgeInset:12, gap:8, barHeight:40, capsuleHeight:30,centerWidth:320,protectedHalf:190,sideMax:110});
});

test("control launcher exposes configured stock panel destinations once in launcher order", () => {
  const layout = {
    left: [{id:"omarchy.power"}],
    center: [{id:"third.weather"}, {id:"omarchy.audio"}],
    right: [{id:"omarchy.network"}, {id:"omarchy.audio"}, {id:"omarchy.monitor"}]
  };
  assert.deepEqual(Model.controlDestinations(layout), [
    {id:"omarchy.audio", label:"Audio", icon:"󰕾"},
    {id:"omarchy.network", label:"Network", icon:"󰤨"},
    {id:"omarchy.monitor", label:"Display", icon:"󰍹"},
    {id:"omarchy.power", label:"Power", icon:"󰐥"}
  ]);
});

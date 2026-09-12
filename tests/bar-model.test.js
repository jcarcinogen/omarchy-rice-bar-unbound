const test = require("node:test");
const assert = require("node:assert/strict");
const Model = require("../BarModel.js");

test("stock model normalizes invalid positions to top", () => {
  assert.equal(Model.normalizePosition("left"), "left");
  assert.equal(Model.normalizePosition("diagonal"), "top");
});

test("focused monitor wins panel routing unless another copy is open", () => {
  const a={visible:true,width:20,height:20}, b={visible:true,width:20,height:20};
  assert.equal(Model.pickPanelSlot([{slot:a,screenName:"eDP-1",opened:false},{slot:b,screenName:"HDMI-A-1",opened:false}],"HDMI-A-1"), b);
  assert.equal(Model.pickPanelSlot([{slot:a,screenName:"eDP-1",opened:true},{slot:b,screenName:"HDMI-A-1",opened:false}],"HDMI-A-1"), a);
});

test("moving duplicate ids uses source and target instance indices", () => {
  const config = {bar:{layout:{
    left:[{id:"same", value:1}, {id:"same", value:2}, {id:"tail"}],
    center:[], right:[]
  }}};
  assert.equal(Model.moveEntry(config, "left", 1, "left", 0), true);
  assert.deepEqual(config.bar.layout.left.map(x => x.value || x.id), [2, 1, "tail"]);
  assert.equal(Model.moveEntry(config, "left", 0, "left", 1), false);
});

test("tray pinning preserves duplicate configured instances", () => {
  const entries = [{id:"omarchy.tray", n:1}, {id:"other"}, {id:"omarchy.tray", n:2}];
  const pinned = Model.pinTrayToInner(entries, "right");
  assert.deepEqual(pinned.map(x => x.n || x.id), [1, 2, "other"]);
  assert.deepEqual(pinned.map((entry, index) => Model.sourceIndexFor(entries, pinned, index)), [0, 2, 1]);
});

test("inline settings deltas identify one duplicate instance", () => {
  const current = {left:[], center:[], right:[{id:"same", value:1}, {id:"same", value:2}]};
  const next = {left:[], center:[], right:[{id:"same", value:1}, {id:"same", value:3}]};
  assert.deepEqual(Model.inlineSettingsDelta(current, next), [
    {region:"right", index:1, instanceKey:"right:1", entry:next.right[1]}
  ]);
});

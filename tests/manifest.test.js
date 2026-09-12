const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
function manifest() { return JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8")); }

test("manifest declares the exact full-bar identity", () => {
  const value = manifest();
  assert.equal(value.schemaVersion, 1);
  assert.equal(value.id, "io.github.jcarcinogen.rice-bar-unbound");
  assert.equal(value.name, "Rice Bar Unbound");
  assert.deepEqual(value.kinds, ["bar"]);
  assert.deepEqual(value.entryPoints, { bar: "Bar.qml" });
});

test("manifest never declares shell-suite kinds", () => {
  const forbidden = ["service", "bar-widget", "panel", "overlay", "menu", "dock"];
  assert.deepEqual(manifest().kinds.filter(kind => forbidden.includes(kind)), []);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const sha = p => crypto.createHash("sha256").update(fs.readFileSync(path.join(root,p))).digest("hex");

test("pinned upstream snapshots have expected hashes", () => {
  assert.equal(sha("upstream/omarchy-v4.0.2/Bar.qml"), "1f345f795fe6633a7eb0934b677b86f6c359e0b062567521eeeec7dbf46987c1");
  assert.equal(sha("upstream/omarchy-v4.0.2/BarModel.js"), "908f30edce60dcba46d2039ba3d501fd0faa35fa1f90b7dbda69439288f8a8d0");
});

test("provenance pins exact prototype and current implementation-start revisions", () => {
  const text=fs.readFileSync(path.join(root,"UPSTREAM.md"),"utf8");
  assert.match(text,/346e69e1cec6c4e8924531874af6ba010a1bc99e/);
  assert.match(text,/446fbc28b15b010980974ba2eeb97e610e4e5d3a/);
});

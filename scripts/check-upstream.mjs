#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const expected={
  "upstream/omarchy-v4.0.2/Bar.qml":"1f345f795fe6633a7eb0934b677b86f6c359e0b062567521eeeec7dbf46987c1",
  "upstream/omarchy-v4.0.2/BarModel.js":"908f30edce60dcba46d2039ba3d501fd0faa35fa1f90b7dbda69439288f8a8d0"
};
let failed=false;
for(const [rel,want] of Object.entries(expected)){
  const got=crypto.createHash("sha256").update(fs.readFileSync(path.join(root,rel))).digest("hex");
  if(got!==want){console.error(`DRIFT ${rel}: expected ${want}, got ${got}`);failed=true;} else console.log(`OK ${rel} ${got}`);
}
const checkout=process.env.OMARCHY_UPSTREAM;
if(checkout){
  const pinned="346e69e1cec6c4e8924531874af6ba010a1bc99e";
  execFileSync("git",["-C",checkout,"cat-file","-e",`${pinned}^{commit}`]);
  let current="unknown";
  try{current=execFileSync("git",["-C",checkout,"rev-parse","origin/quattro"],{encoding:"utf8"}).trim();}catch{}
  console.log(`PIN ${pinned}`); console.log(`origin/quattro ${current}${current===pinned?"":" (manual rebase required before release)"}`);
}
process.exitCode=failed?1:0;

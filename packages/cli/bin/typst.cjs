#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { typstPath } = require("../index.cjs");

const result = spawnSync(typstPath, process.argv.slice(2), {
  stdio: "inherit",
  windowsHide: true
});

if (result.error) {
  console.error(`Failed to start Typst: ${result.error.message}`);
  process.exit(1);
}
if (result.signal) {
  console.error(`Typst was terminated by ${result.signal}`);
  process.exit(1);
}
process.exit(result.status ?? 1);

import fs from "node:fs";
import { parseArgs, normalizeVersion } from "./lib/args.mjs";
import { supportedTargetsForVersion } from "./lib/historical-targets.mjs";

const RUNNERS = Object.freeze({
  "win32-x64": "windows-latest",
  "win32-arm64": "windows-11-arm",
  "linux-x64": "ubuntu-latest",
  "linux-arm64": "ubuntu-24.04-arm",
  "darwin-x64": "macos-15-intel",
  "darwin-arm64": "macos-15"
});

const args = parseArgs(process.argv.slice(2));
const version = normalizeVersion(args["typst-version"] ?? args.version);
if (version === "latest") throw new Error("A concrete Typst version is required");

const targets = supportedTargetsForVersion(version);
const matrix = {
  include: targets.map(target => ({ target, runner: RUNNERS[target] }))
};
const plan = {
  version,
  targets,
  matrix,
  packageCount: targets.length + 1
};

console.log(JSON.stringify(plan));
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, [
    `matrix=${JSON.stringify(matrix)}`,
    `package-count=${plan.packageCount}`,
    ""
  ].join("\n"));
}

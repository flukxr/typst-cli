import fs from "node:fs";
import { parseArgs, normalizeVersion } from "./lib/args.mjs";
import { sourceBuildFor } from "./lib/historical-targets.mjs";
import { resolveTarget } from "./lib/targets.mjs";

const args = parseArgs(process.argv.slice(2));
const version = normalizeVersion(args["typst-version"] ?? args.version);
const target = resolveTarget(args.target);
const sourceBuild = sourceBuildFor(version, target.id);
const plan = {
  sourceBuild: Boolean(sourceBuild),
  rustVersion: sourceBuild?.rustVersion ?? "",
  triple: target.triple
};

console.log(JSON.stringify(plan));
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, [
    `source-build=${plan.sourceBuild}`,
    `rust-version=${plan.rustVersion}`,
    `triple=${plan.triple}`,
    ""
  ].join("\n"));
}

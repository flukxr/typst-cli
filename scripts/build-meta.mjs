import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, normalizeVersion } from "./lib/args.mjs";
import { getRelease } from "./lib/github.mjs";
import { resetDir } from "./lib/fs-utils.mjs";
import { npmCommand, run } from "./lib/process.mjs";
import { supportedTargetsForVersion } from "./lib/historical-targets.mjs";
import { normalizeRevision, packageVersion } from "./lib/package-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const requestedVersion = normalizeVersion(args["typst-version"] ?? args.version ?? "latest");
  const revision = normalizeRevision(args.revision ?? "0");
  const release = await getRelease(requestedVersion);
  const npmVersion = packageVersion(release.version, revision);
  const packageDir = path.join(ROOT, ".work", `${npmVersion}-meta`, "package");
  const artifactsDir = path.join(ROOT, "artifacts");

  await resetDir(packageDir);
  await fs.mkdir(path.join(packageDir, "bin"), { recursive: true });
  await fs.mkdir(artifactsDir, { recursive: true });

  const supportedTargets = supportedTargetsForVersion(release.version);
  const optionalDependencies = Object.fromEntries(
    supportedTargets.map(target => [`@flukxr/typst-cli-${target}`, npmVersion])
  );
  const packageJson = {
    name: "@flukxr/typst-cli",
    version: npmVersion,
    description: "Run the official Typst CLI through npm on Windows, Linux, and macOS",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/flukxr/typst-cli.git"
    },
    homepage: "https://github.com/flukxr/typst-cli#readme",
    bugs: "https://github.com/flukxr/typst-cli/issues",
    keywords: ["typst", "cli", "compiler", "typesetting"],
    main: "index.cjs",
    bin: { typst: "bin/typst.cjs" },
    files: ["bin", "index.cjs", "update-policy.cjs", "README.md", "LICENSE"],
    engines: { node: ">=18" },
    optionalDependencies,
    publishConfig: { access: "public" }
  };
  packageJson.typst = {
    version: release.version,
    packageRevision: revision,
    supportedTargets
  };

  await fs.writeFile(path.join(packageDir, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
  await fs.copyFile(path.join(ROOT, "packages", "cli", "index.cjs"), path.join(packageDir, "index.cjs"));
  await fs.copyFile(
    path.join(ROOT, "packages", "cli", "update-policy.cjs"),
    path.join(packageDir, "update-policy.cjs")
  );
  await fs.copyFile(path.join(ROOT, "packages", "cli", "bin", "typst.cjs"), path.join(packageDir, "bin", "typst.cjs"));
  await fs.copyFile(path.join(ROOT, "packages", "cli", "README.md"), path.join(packageDir, "README.md"));
  await fs.copyFile(path.join(ROOT, "LICENSE"), path.join(packageDir, "LICENSE"));
  await fs.chmod(path.join(packageDir, "bin", "typst.cjs"), 0o755);

  const npm = npmCommand(["pack", packageDir, "--pack-destination", artifactsDir]);
  await run(npm.command, npm.args, { cwd: ROOT });
  console.log(`Built @flukxr/typst-cli@${npmVersion} with Typst ${release.version}`);
}

main().catch(error => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});

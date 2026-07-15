import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, normalizeVersion } from "./lib/args.mjs";
import { downloadText, getRelease } from "./lib/github.mjs";
import { download, findFile, resetDir, sha256 } from "./lib/fs-utils.mjs";
import { npmCommand, run } from "./lib/process.mjs";
import { currentTarget, resolveTarget } from "./lib/targets.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const requestedVersion = normalizeVersion(args.version ?? "latest");
  const target = resolveTarget(args.target ?? currentTarget());

  if (target.os !== process.platform) {
    throw new Error(`Target ${target.id} must be built on ${target.os}; current OS is ${process.platform}`);
  }

  const release = await getRelease(requestedVersion);
  const asset = release.assets.find(item => item.name === target.assetName);
  if (!asset) {
    throw new Error(`${release.tag} does not contain ${target.assetName}`);
  }
  if (!asset.digest?.startsWith("sha256:")) {
    throw new Error(`GitHub did not provide a SHA-256 digest for ${asset.name}`);
  }

  const workDir = path.join(ROOT, ".work", `${release.version}-${target.id}`);
  const extractDir = path.join(workDir, "extract");
  const packageDir = path.join(workDir, "package");
  const vendorDir = path.join(packageDir, "vendor");
  const archivePath = path.join(workDir, asset.name);
  const artifactsDir = path.join(ROOT, "artifacts");

  await resetDir(workDir);
  await fs.mkdir(extractDir, { recursive: true });
  await fs.mkdir(vendorDir, { recursive: true });
  await fs.mkdir(artifactsDir, { recursive: true });

  console.log(`Downloading ${asset.name} from ${release.tag}`);
  await download(asset.url, archivePath);
  const actualDigest = await sha256(archivePath);
  const expectedDigest = asset.digest.slice("sha256:".length).toLowerCase();
  if (actualDigest !== expectedDigest) {
    throw new Error(`SHA-256 mismatch for ${asset.name}: expected ${expectedDigest}, received ${actualDigest}`);
  }
  console.log(`Verified SHA-256 ${actualDigest}`);

  await extractArchive(archivePath, extractDir, target.extension);
  const sourceBinary = await findFile(extractDir, target.executable);
  if (!sourceBinary) throw new Error(`Could not find ${target.executable} inside ${asset.name}`);

  const binaryPath = path.join(vendorDir, target.executable);
  await fs.copyFile(sourceBinary, binaryPath);
  if (target.os !== "win32") await fs.chmod(binaryPath, 0o755);

  const packageJson = {
    name: target.packageName,
    version: release.version,
    description: `Official Typst CLI binary for ${target.id}, distributed as an unofficial npm package`,
    license: "Apache-2.0",
    repository: {
      type: "git",
      url: "git+https://github.com/flukxr/typst-cli.git"
    },
    homepage: "https://github.com/flukxr/typst-cli#readme",
    bugs: "https://github.com/flukxr/typst-cli/issues",
    os: [target.os],
    cpu: [target.cpu],
    main: "index.cjs",
    files: ["vendor", "index.cjs", "README.md", "LICENSE-TYPST", "NOTICE-TYPST"],
    engines: { node: ">=18" },
    publishConfig: { access: "public", provenance: true },
    typst: {
      version: release.version,
      release: release.htmlUrl,
      target: target.id,
      asset: asset.name,
      sha256: actualDigest
    }
  };

  const index = [
    'const path = require("node:path");',
    `const typstPath = path.join(__dirname, "vendor", ${JSON.stringify(target.executable)});`,
    `module.exports = { typstPath, version: ${JSON.stringify(release.version)}, target: ${JSON.stringify(target.id)} };`,
    ""
  ].join("\n");

  const readme = `# ${target.packageName}\n\n` +
    `Platform package for \`@flukxr/typst-cli\`, containing the unchanged official Typst ${release.version} binary for \`${target.id}\`.\n\n` +
    "This is an unofficial npm distribution and is not affiliated with or endorsed by Typst GmbH. " +
    "Install `@flukxr/typst-cli` instead of depending on this package directly.\n";

  await fs.writeFile(path.join(packageDir, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
  await fs.writeFile(path.join(packageDir, "index.cjs"), index);
  await fs.writeFile(path.join(packageDir, "README.md"), readme);
  await writeUpstreamLegalFiles(release.tag, packageDir);

  if (currentTarget() === target.id) {
    console.log("Testing packaged binary");
    await run(binaryPath, ["--version"]);
  } else {
    console.log(`Skipping execution test on ${currentTarget()} for ${target.id}`);
  }

  const npm = npmCommand(["pack", packageDir, "--pack-destination", artifactsDir]);
  await run(npm.command, npm.args, { cwd: ROOT });
  console.log(`Built ${target.packageName}@${release.version}`);
}

async function extractArchive(archivePath, destination, extension) {
  if (extension === "zip") {
    const source = archivePath.replaceAll("'", "''");
    const target = destination.replaceAll("'", "''");
    await run("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `Expand-Archive -LiteralPath '${source}' -DestinationPath '${target}' -Force`
    ]);
    return;
  }
  await run("tar", ["-xJf", archivePath, "-C", destination]);
}

async function writeUpstreamLegalFiles(tag, packageDir) {
  for (const upstreamName of ["LICENSE", "NOTICE"]) {
    const contents = await downloadText(`https://raw.githubusercontent.com/typst/typst/${tag}/${upstreamName}`);
    await fs.writeFile(path.join(packageDir, `${upstreamName}-TYPST`), contents);
  }
}

main().catch(error => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});

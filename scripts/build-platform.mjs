import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, normalizeVersion } from "./lib/args.mjs";
import { downloadText, getRelease } from "./lib/github.mjs";
import { download, findFile, resetDir, sha256 } from "./lib/fs-utils.mjs";
import { npmCommand, run } from "./lib/process.mjs";
import { currentTarget, resolveTarget } from "./lib/targets.mjs";
import { officialAssetFor, sourceBuildFor } from "./lib/historical-targets.mjs";
import { normalizeRevision, packageVersion } from "./lib/package-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const requestedVersion = normalizeVersion(args["typst-version"] ?? args.version ?? "latest");
  const revision = normalizeRevision(args.revision ?? "0");
  const target = resolveTarget(args.target ?? currentTarget());

  if (target.os !== process.platform) {
    throw new Error(`Target ${target.id} must be built on ${target.os}; current OS is ${process.platform}`);
  }

  const release = await getRelease(requestedVersion);
  const npmVersion = packageVersion(release.version, revision);
  const sourceBuild = sourceBuildFor(release.version, target.id);
  const officialAsset = officialAssetFor(release.version, target);
  const asset = officialAsset
    ? release.assets.find(item => item.name === officialAsset.name)
    : null;
  if (officialAsset && !asset) throw new Error(`${release.tag} does not contain ${officialAsset.name}`);
  if (asset?.digest && !asset.digest.startsWith("sha256:")) {
    throw new Error(`GitHub provided an unsupported digest for ${asset.name}: ${asset.digest}`);
  }

  const workDir = path.join(ROOT, ".work", `${npmVersion}-${target.id}`);
  const extractDir = path.join(workDir, "extract");
  const packageDir = path.join(workDir, "package");
  const vendorDir = path.join(packageDir, "vendor");
  const archivePath = asset ? path.join(workDir, asset.name) : null;
  const artifactsDir = path.join(ROOT, "artifacts");

  await resetDir(workDir);
  await fs.mkdir(extractDir, { recursive: true });
  await fs.mkdir(vendorDir, { recursive: true });
  await fs.mkdir(artifactsDir, { recursive: true });

  let sourceBinary;
  let origin;

  if (sourceBuild) {
    const upstreamDir = path.join(ROOT, ".work", "upstream");
    const sourceCommit = execFileSync("git", ["-C", upstreamDir, "rev-parse", "HEAD"], {
      encoding: "utf8"
    }).trim();

    console.log(`Building ${release.tag} from source commit ${sourceCommit}`);
    await run("cargo", [
      `+${sourceBuild.rustVersion}`,
      "build",
      "--locked",
      "--package", "typst-cli",
      "--release",
      "--target", target.triple
    ], { cwd: upstreamDir });

    sourceBinary = path.join(
      upstreamDir,
      "target",
      target.triple,
      "release",
      target.executable
    );
    origin = {
      type: "source-build",
      repository: "https://github.com/typst/typst",
      tag: release.tag,
      commit: sourceCommit,
      rustToolchain: sourceBuild.rustVersion
    };
  } else {
    console.log(`Downloading ${asset.name} from ${release.tag}`);
    await download(asset.url, archivePath);
    const actualDigest = await sha256(archivePath);
    const expectedDigest = asset.digest?.slice("sha256:".length).toLowerCase() ?? null;
    if (expectedDigest && actualDigest !== expectedDigest) {
      throw new Error(`SHA-256 mismatch for ${asset.name}: expected ${expectedDigest}, received ${actualDigest}`);
    }
    const digestSource = expectedDigest ? "github-releases-api" : "computed-from-download";
    console.log(expectedDigest
      ? `Verified SHA-256 ${actualDigest}`
      : `GitHub did not provide a digest; recorded computed SHA-256 ${actualDigest}`);

    await extractArchive(archivePath, extractDir, officialAsset.extension);
    sourceBinary = await findFile(extractDir, target.executable);
    if (!sourceBinary) throw new Error(`Could not find ${target.executable} inside ${asset.name}`);
    origin = {
      type: "official-release-asset",
      asset: asset.name,
      archiveSha256: actualDigest,
      archiveSha256Source: digestSource
    };
  }

  const binaryPath = path.join(vendorDir, target.executable);
  await fs.copyFile(sourceBinary, binaryPath);
  if (target.os !== "win32") await fs.chmod(binaryPath, 0o755);
  const binarySha256 = await sha256(binaryPath);

  const packageJson = {
    name: target.packageName,
    version: npmVersion,
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
    publishConfig: { access: "public" },
    typst: {
      version: release.version,
      packageRevision: revision,
      release: release.htmlUrl,
      target: target.id,
      binarySha256,
      origin
    }
  };

  const index = [
    'const path = require("node:path");',
    `const typstPath = path.join(__dirname, "vendor", ${JSON.stringify(target.executable)});`,
    `module.exports = { typstPath, version: ${JSON.stringify(release.version)}, target: ${JSON.stringify(target.id)} };`,
    ""
  ].join("\n");

  const binaryDescription = sourceBuild
    ? `a Typst ${release.version} binary built from official source commit \`${origin.commit}\` for \`${target.id}\``
    : `the unchanged official Typst ${release.version} binary for \`${target.id}\``;
  const readme = `# ${target.packageName}\n\n` +
    `Platform package for \`@flukxr/typst-cli\`, containing ${binaryDescription}.\n\n` +
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
  console.log(`Built ${target.packageName}@${npmVersion} with Typst ${release.version}`);
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
  const flag = extension === "tar.gz" ? "-xzf" : "-xJf";
  await run("tar", [flag, archivePath, "-C", destination]);
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

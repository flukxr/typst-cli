import { TARGETS } from "./targets.mjs";

const WITHOUT_WINDOWS_ARM64 = new Set(["0.6.0", "0.7.0", "0.8.0"]);
const EARLY_RELEASES = new Set(["0.1.0", "0.2.0"]);
const WINDOWS_ARM64_SOURCE_TOOLCHAINS = new Map([
  ["0.9.0", "1.70"],
  ["0.10.0", "1.70"],
  ["0.11.0", "1.74"],
  ["0.11.1", "1.74"]
]);

export function supportedTargetsForVersion(version) {
  const targets = Object.keys(TARGETS);
  return WITHOUT_WINDOWS_ARM64.has(version)
    ? targets.filter(target => target !== "win32-arm64")
    : targets;
}

export function sourceBuildFor(version, targetId) {
  if (targetId === "win32-arm64" && WINDOWS_ARM64_SOURCE_TOOLCHAINS.has(version)) {
    return { rustVersion: WINDOWS_ARM64_SOURCE_TOOLCHAINS.get(version) };
  }

  if (EARLY_RELEASES.has(version) && [
    "win32-arm64",
    "linux-x64",
    "linux-arm64",
    "darwin-arm64"
  ].includes(targetId)) {
    return { rustVersion: "1.68.2" };
  }

  return null;
}

export function officialAssetFor(version, target) {
  if (sourceBuildFor(version, target.id)) return null;

  if (EARLY_RELEASES.has(version) && target.id === "darwin-x64") {
    return {
      name: "typst-x86_64-apple-darwin.tar.gz",
      extension: "tar.gz"
    };
  }

  return {
    name: target.assetName,
    extension: target.extension
  };
}

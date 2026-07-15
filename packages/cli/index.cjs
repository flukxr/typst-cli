const TARGET_PACKAGES = Object.freeze({
  "win32-x64": "@flukxr/typst-cli-win32-x64",
  "win32-arm64": "@flukxr/typst-cli-win32-arm64",
  "linux-x64": "@flukxr/typst-cli-linux-x64",
  "linux-arm64": "@flukxr/typst-cli-linux-arm64",
  "darwin-x64": "@flukxr/typst-cli-darwin-x64",
  "darwin-arm64": "@flukxr/typst-cli-darwin-arm64"
});

function getPlatformPackageName(platform = process.platform, arch = process.arch) {
  const target = `${platform}-${arch}`;
  const packageName = TARGET_PACKAGES[target];
  if (!packageName) {
    throw new Error(
      `@flukxr/typst-cli does not support ${target}. ` +
      `Supported targets: ${Object.keys(TARGET_PACKAGES).join(", ")}`
    );
  }
  return packageName;
}

function loadPlatformPackage(platform = process.platform, arch = process.arch) {
  const packageName = getPlatformPackageName(platform, arch);
  try {
    return require(packageName);
  } catch (error) {
    if (error?.code !== "MODULE_NOT_FOUND" || !String(error.message).includes(packageName)) throw error;
    throw new Error(
      `The platform package ${packageName} is missing. ` +
      "Reinstall @flukxr/typst-cli without --no-optional and check that npm optional dependencies are enabled.",
      { cause: error }
    );
  }
}

module.exports = {
  getPlatformPackageName,
  loadPlatformPackage,
  get typstPath() {
    return loadPlatformPackage().typstPath;
  },
  get version() {
    return loadPlatformPackage().version;
  }
};

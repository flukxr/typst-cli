export const TARGETS = Object.freeze({
  "win32-x64": {
    os: "win32",
    cpu: "x64",
    triple: "x86_64-pc-windows-msvc",
    extension: "zip",
    executable: "typst.exe"
  },
  "win32-arm64": {
    os: "win32",
    cpu: "arm64",
    triple: "aarch64-pc-windows-msvc",
    extension: "zip",
    executable: "typst.exe"
  },
  "linux-x64": {
    os: "linux",
    cpu: "x64",
    triple: "x86_64-unknown-linux-musl",
    extension: "tar.xz",
    executable: "typst"
  },
  "linux-arm64": {
    os: "linux",
    cpu: "arm64",
    triple: "aarch64-unknown-linux-musl",
    extension: "tar.xz",
    executable: "typst"
  },
  "darwin-x64": {
    os: "darwin",
    cpu: "x64",
    triple: "x86_64-apple-darwin",
    extension: "tar.xz",
    executable: "typst"
  },
  "darwin-arm64": {
    os: "darwin",
    cpu: "arm64",
    triple: "aarch64-apple-darwin",
    extension: "tar.xz",
    executable: "typst"
  }
});

export function currentTarget() {
  return `${process.platform}-${process.arch}`;
}

export function resolveTarget(id = currentTarget()) {
  const target = TARGETS[id];
  if (!target) {
    throw new Error(`Unsupported target '${id}'. Supported targets: ${Object.keys(TARGETS).join(", ")}`);
  }

  return {
    id,
    ...target,
    assetName: `typst-${target.triple}.${target.extension}`,
    packageName: `@flukxr/typst-cli-${id}`
  };
}

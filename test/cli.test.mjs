import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const cli = require("../packages/cli/index.cjs");

const expected = {
  "win32-x64": "@flukxr/typst-cli-win32-x64",
  "win32-arm64": "@flukxr/typst-cli-win32-arm64",
  "linux-x64": "@flukxr/typst-cli-linux-x64",
  "linux-arm64": "@flukxr/typst-cli-linux-arm64",
  "darwin-x64": "@flukxr/typst-cli-darwin-x64",
  "darwin-arm64": "@flukxr/typst-cli-darwin-arm64"
};

for (const [target, packageName] of Object.entries(expected)) {
  test(`selects ${packageName}`, () => {
    const [platform, arch] = target.split("-");
    assert.equal(cli.getPlatformPackageName(platform, arch), packageName);
  });
}

test("rejects unsupported platforms with a useful message", () => {
  assert.throws(
    () => cli.getPlatformPackageName("freebsd", "x64"),
    /does not support freebsd-x64/
  );
});

test("explains when an optional platform package is absent", () => {
  assert.throws(
    () => cli.loadPlatformPackage("linux", "arm64"),
    /optional dependencies are enabled/
  );
});

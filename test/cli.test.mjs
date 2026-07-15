import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const cli = require("../packages/cli/index.cjs");
const { isSelfUpdate, selfUpdateMessage } = require("../packages/cli/update-policy.cjs");

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

test("intercepts native self-update commands", () => {
  assert.equal(isSelfUpdate(["update"]), true);
  assert.equal(isSelfUpdate(["update", "0.16.0", "--force"]), true);
});

test("keeps update help available", () => {
  assert.equal(isSelfUpdate(["update", "--help"]), false);
  assert.equal(isSelfUpdate(["update", "-h"]), false);
  assert.equal(isSelfUpdate(["help", "update"]), false);
});

test("self-update message directs users back to npm", () => {
  const message = selfUpdateMessage();
  assert.match(message, /npm install --save-dev @flukxr\/typst-cli@latest/);
  assert.match(message, /npm install --global @flukxr\/typst-cli@latest/);
});

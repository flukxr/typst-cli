import assert from "node:assert/strict";
import test from "node:test";
import { resolveTarget, TARGETS } from "../scripts/lib/targets.mjs";

test("all target package names use the public npm scope", () => {
  for (const id of Object.keys(TARGETS)) {
    assert.equal(resolveTarget(id).packageName, `@flukxr/typst-cli-${id}`);
  }
});

test("official release asset names are deterministic", () => {
  assert.equal(resolveTarget("win32-x64").assetName, "typst-x86_64-pc-windows-msvc.zip");
  assert.equal(resolveTarget("linux-arm64").assetName, "typst-aarch64-unknown-linux-musl.tar.xz");
  assert.equal(resolveTarget("darwin-x64").assetName, "typst-x86_64-apple-darwin.tar.xz");
});

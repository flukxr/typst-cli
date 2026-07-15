import assert from "node:assert/strict";
import test from "node:test";
import { resolveTarget, TARGETS } from "../scripts/lib/targets.mjs";
import {
  officialAssetFor,
  sourceBuildFor,
  supportedTargetsForVersion
} from "../scripts/lib/historical-targets.mjs";

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

test("Typst 0.6 through 0.8 omit unsupported Windows ARM64", () => {
  for (const version of ["0.6.0", "0.7.0", "0.8.0"]) {
    assert.deepEqual(
      supportedTargetsForVersion(version),
      Object.keys(TARGETS).filter(target => target !== "win32-arm64")
    );
  }
});

test("historical Windows ARM64 source builds use pinned Rust toolchains", () => {
  assert.deepEqual(sourceBuildFor("0.9.0", "win32-arm64"), { rustVersion: "1.70" });
  assert.deepEqual(sourceBuildFor("0.11.1", "win32-arm64"), { rustVersion: "1.74" });
  assert.equal(sourceBuildFor("0.8.0", "win32-arm64"), null);
});

test("Typst 0.1 and 0.2 use source-built musl and ARM targets", () => {
  for (const version of ["0.1.0", "0.2.0"]) {
    for (const target of ["win32-arm64", "linux-x64", "linux-arm64", "darwin-arm64"]) {
      assert.deepEqual(sourceBuildFor(version, target), { rustVersion: "1.68.2" });
    }
    assert.deepEqual(officialAssetFor(version, resolveTarget("darwin-x64")), {
      name: "typst-x86_64-apple-darwin.tar.gz",
      extension: "tar.gz"
    });
  }
});

import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRevision, packageVersion } from "../scripts/lib/package-version.mjs";

test("adds an npm packaging revision to a stable Typst version", () => {
  assert.equal(packageVersion("0.15.0", 0), "0.15.0-npm.0");
  assert.equal(packageVersion("0.15.0", 2), "0.15.0-npm.2");
});

test("extends an existing Typst prerelease identifier", () => {
  assert.equal(packageVersion("0.16.0-rc.1", 0), "0.16.0-rc.1.npm.0");
});

test("rejects negative, fractional, and padded revisions", () => {
  for (const value of ["-1", "1.5", "01", "test"]) {
    assert.throws(() => normalizeRevision(value), /Invalid npm packaging revision/);
  }
});

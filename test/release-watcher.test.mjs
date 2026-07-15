import assert from "node:assert/strict";
import test from "node:test";
import {
  parseStableRelease,
  releaseRunName,
  shouldDispatch
} from "../scripts/lib/release-watcher.mjs";

test("accepts stable Typst release tags", () => {
  assert.equal(parseStableRelease({ tag_name: "v0.16.0" }), "0.16.0");
  assert.equal(parseStableRelease({ tag_name: "0.16.0" }), "0.16.0");
});

test("rejects prereleases, drafts, and non-semver tags", () => {
  assert.equal(parseStableRelease({ tag_name: "v0.16.0-rc1" }), null);
  assert.equal(parseStableRelease({ tag_name: "v0.16.0", prerelease: true }), null);
  assert.equal(parseStableRelease({ tag_name: "v0.16.0", draft: true }), null);
});

test("builds the release workflow run name", () => {
  assert.equal(releaseRunName("0.16.0"), "Typst 0.16.0 npm.0 (latest)");
});

test("dispatches only when the version is neither published nor active", () => {
  assert.equal(shouldDispatch({ published: false, active: false }), true);
  assert.equal(shouldDispatch({ published: true, active: false }), false);
  assert.equal(shouldDispatch({ published: false, active: true }), false);
});

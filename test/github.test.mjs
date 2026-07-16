import assert from "node:assert/strict";
import test from "node:test";
import { downloadText } from "../scripts/lib/github.mjs";

test("downloadText returns successful response text", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => "upstream license"
  });

  assert.equal(await downloadText("https://example.test/LICENSE"), "upstream license");
});

test("downloadText rejects unsuccessful responses", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => ({
    ok: false,
    status: 404,
    text: async () => "not found"
  });

  await assert.rejects(
    downloadText("https://example.test/NOTICE"),
    /Download returned 404/
  );
});

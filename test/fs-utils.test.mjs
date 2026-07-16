import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { sha256 } from "../scripts/lib/fs-utils.mjs";

test("streams a file into SHA-256", async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "typst-cli-sha-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));

  const filename = path.join(directory, "binary.dat");
  const contents = Buffer.alloc(2 * 1024 * 1024 + 17, 0x5a);
  await fs.writeFile(filename, contents);

  const expected = createHash("sha256").update(contents).digest("hex");
  assert.equal(await sha256(filename), expected);
});

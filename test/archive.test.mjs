import assert from "node:assert/strict";
import test from "node:test";
import { extractionPlan } from "../scripts/lib/archive.mjs";

test("passes ZIP paths through the PowerShell environment", () => {
  const archivePath = "C:\\build's files\\typst.zip";
  const destination = "C:\\output [0.15]";
  const plan = extractionPlan(archivePath, destination, "zip");

  assert.equal(plan.command, "powershell.exe");
  assert.deepEqual(plan.args.slice(0, 3), ["-NoProfile", "-NonInteractive", "-Command"]);
  assert.match(plan.args[3], /\$env:TYPST_ARCHIVE_PATH/);
  assert.match(plan.args[3], /\$env:TYPST_EXTRACT_PATH/);
  assert.equal(plan.args.join(" ").includes(archivePath), false);
  assert.equal(plan.args.join(" ").includes(destination), false);
  assert.equal(plan.options.env.TYPST_ARCHIVE_PATH, archivePath);
  assert.equal(plan.options.env.TYPST_EXTRACT_PATH, destination);
});

test("selects exact tar extraction flags", () => {
  assert.deepEqual(
    extractionPlan("typst.tar.gz", "output", "tar.gz").args,
    ["-xzf", "typst.tar.gz", "-C", "output"]
  );
  assert.deepEqual(
    extractionPlan("typst.tar.xz", "output", "tar.xz").args,
    ["-xJf", "typst.tar.xz", "-C", "output"]
  );
});

test("rejects unknown archive formats", () => {
  assert.throws(
    () => extractionPlan("typst.rar", "output", "rar"),
    /Unsupported archive extension: rar/
  );
});

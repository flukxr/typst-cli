import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function resetDir(directory) {
  await fs.rm(directory, { recursive: true, force: true });
  await fs.mkdir(directory, { recursive: true });
}

export async function download(url, destination) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "flukxr-typst-cli-builder" }
  });
  if (!response.ok || !response.body) {
    throw new Error(`Download returned ${response.status} for ${url}`);
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await pipeline(Readable.fromWeb(response.body), createWriteStream(destination));
}

export async function sha256(filename) {
  const hash = createHash("sha256");
  await pipeline(createReadStream(filename), hash);
  return hash.digest("hex");
}

export async function findFile(directory, basename) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await findFile(candidate, basename);
      if (nested) return nested;
    } else if (entry.name === basename) {
      return candidate;
    }
  }
  return null;
}

import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  parseStableRelease,
  releaseRunName,
  shouldDispatch
} from "./lib/release-watcher.mjs";

const GITHUB_API = "https://api.github.com";
const NPM_REGISTRY = "https://registry.npmjs.org";
const PACKAGE_NAME = "@flukxr/typst-cli";

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "flukxr-typst-cli-release-watcher",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {})
  };
}

async function getJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  return response.json();
}

async function getLatestStableVersion() {
  const release = await getJson(
    `${GITHUB_API}/repos/typst/typst/releases/latest`,
    { headers: githubHeaders() }
  );
  const version = parseStableRelease(release);
  if (!version) {
    throw new Error(`Latest Typst release is not a stable semver tag: ${release.tag_name}`);
  }
  return version;
}

async function packageVersionExists(version) {
  const packagePath = encodeURIComponent(PACKAGE_NAME);
  const response = await fetch(
    `${NPM_REGISTRY}/${packagePath}/${encodeURIComponent(version)}`,
    { headers: { Accept: "application/json" } }
  );
  if (response.status === 404) return false;
  if (!response.ok) {
    throw new Error(`npm registry returned HTTP ${response.status}`);
  }
  return true;
}

async function releaseRunIsActive(repository, displayTitle) {
  const runs = await getJson(
    `${GITHUB_API}/repos/${repository}/actions/workflows/release.yml/runs?per_page=50`,
    { headers: githubHeaders() }
  );
  return runs.workflow_runs.some(
    run => run.display_title === displayTitle && run.status !== "completed"
  );
}

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  }
}

export async function main() {
  const repository = process.env.GITHUB_REPOSITORY || "flukxr/typst-cli";
  const version = await getLatestStableVersion();
  const packageVersion = `${version}-npm.0`;
  const displayTitle = releaseRunName(version);
  const published = await packageVersionExists(packageVersion);
  const active = published
    ? false
    : await releaseRunIsActive(repository, displayTitle);
  const dispatch = shouldDispatch({ published, active });

  const result = {
    version,
    packageVersion,
    published,
    active,
    shouldDispatch: dispatch
  };

  setOutput("version", version);
  setOutput("package-version", packageVersion);
  setOutput("published", published);
  setOutput("active", active);
  setOutput("should-dispatch", dispatch);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

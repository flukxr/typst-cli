const STABLE_VERSION = /^v?(\d+\.\d+\.\d+)$/;

export function parseStableRelease(release) {
  if (release?.draft || release?.prerelease) return null;

  const match = String(release?.tag_name ?? "").match(STABLE_VERSION);
  return match?.[1] ?? null;
}

export function releaseRunName(version, revision = 0, launcherTag = "latest") {
  return `Typst ${version} npm.${revision} (${launcherTag})`;
}

export function shouldDispatch({ published, active }) {
  return !published && !active;
}

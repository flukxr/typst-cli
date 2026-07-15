export function normalizeRevision(value = "0") {
  const revision = String(value).trim();
  if (!/^(0|[1-9]\d*)$/.test(revision)) {
    throw new Error(`Invalid npm packaging revision: ${value}`);
  }
  return Number(revision);
}

export function packageVersion(typstVersion, revision = 0) {
  const normalizedRevision = normalizeRevision(revision);
  const separator = typstVersion.includes("-") ? ".npm." : "-npm.";
  return `${typstVersion}${separator}${normalizedRevision}`;
}

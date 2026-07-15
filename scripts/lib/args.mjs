export function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);

    const [rawName, inlineValue] = token.slice(2).split("=", 2);
    const value = inlineValue ?? argv[++index];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${rawName}`);
    result[rawName] = value;
  }

  return result;
}

export function normalizeVersion(value = "latest") {
  const version = String(value).trim().replace(/^v/, "");
  if (version !== "latest" && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Invalid Typst version: ${value}`);
  }
  return version;
}

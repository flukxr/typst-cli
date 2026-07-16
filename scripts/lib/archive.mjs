import { run } from "./process.mjs";

const ZIP_COMMAND =
  "Expand-Archive -LiteralPath $env:TYPST_ARCHIVE_PATH " +
  "-DestinationPath $env:TYPST_EXTRACT_PATH -Force";

export function extractionPlan(archivePath, destination, extension) {
  if (extension === "zip") {
    return {
      command: "powershell.exe",
      args: ["-NoProfile", "-NonInteractive", "-Command", ZIP_COMMAND],
      options: {
        env: {
          ...process.env,
          TYPST_ARCHIVE_PATH: archivePath,
          TYPST_EXTRACT_PATH: destination
        }
      }
    };
  }

  const flag = extension === "tar.gz"
    ? "-xzf"
    : extension === "tar.xz"
      ? "-xJf"
      : null;
  if (!flag) throw new Error(`Unsupported archive extension: ${extension}`);

  return {
    command: "tar",
    args: [flag, archivePath, "-C", destination],
    options: {}
  };
}

export async function extractArchive(archivePath, destination, extension) {
  const plan = extractionPlan(archivePath, destination, extension);
  await run(plan.command, plan.args, plan.options);
}

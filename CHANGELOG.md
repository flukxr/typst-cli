# Changelog

This changelog records changes to the npm packaging and launcher. For changes
to the Typst compiler itself, see the
[upstream Typst releases](https://github.com/typst/typst/releases).

## Unreleased

- Stream archive and binary SHA-256 calculation instead of buffering complete
  files in memory.
- Isolate archive extraction command planning and pass Windows paths through
  environment variables.

## 0.15.0-npm.2 - 2026-07-15

- Block native `typst update`, which would replace the executable inside
  `node_modules` without updating npm metadata or the lockfile.
- Direct local and global users to update through npm.

## 0.1.0-npm.1 through 0.14.2-npm.1 - 2026-07-15

- Backport the native self-update guard to every historical Typst release.
- Reuse the original `npm.0` platform binaries without rebuilding them.

## 0.15.0-npm.1 - 2026-07-15

- Improve installation, versioning, programmatic API, provenance, and licensing
  guidance in the npm README.

## 0.15.0-npm.0 - 2026-07-15

- Publish the initial cross-platform npm distribution of Typst CLI.

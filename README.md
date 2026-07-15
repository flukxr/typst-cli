# Typst CLI for npm

Unofficial, cross-platform npm distribution of the
[Typst](https://github.com/typst/typst) CLI.

Install and pin the native Typst compiler as a regular npm dependency. npm
selects the matching platform package without install scripts or runtime
binary downloads.

This project is not affiliated with or endorsed by Typst GmbH.

## Installation

### Global CLI

```sh
npm install --global @flukxr/typst-cli

typst --version
typst compile main.typ
```

### Project dependency

```sh
npm install --save-dev @flukxr/typst-cli

npx typst --version
npx typst compile main.typ
```

Inside npm scripts, `typst` is available directly:

```json
{
  "scripts": {
    "build:docs": "typst compile main.typ main.pdf"
  }
}
```

Example `main.typ`:

```typst
= Hello from npm
```

## Supported platforms

`@flukxr/typst-cli` is a small launcher. npm installs exactly one matching
optional dependency:

| npm package | Operating system | Architecture |
| --- | --- | --- |
| `@flukxr/typst-cli-win32-x64` | Windows | x64 |
| `@flukxr/typst-cli-win32-arm64` | Windows | ARM64 |
| `@flukxr/typst-cli-linux-x64` | Linux | x64 |
| `@flukxr/typst-cli-linux-arm64` | Linux | ARM64 |
| `@flukxr/typst-cli-darwin-x64` | macOS | Intel x64 |
| `@flukxr/typst-cli-darwin-arm64` | macOS | Apple silicon |

Typst 0.6.0 through 0.8.0 do not support Windows ARM64. Their pinned
`ring 0.16` dependency cannot compile for that target. The launcher reports
this limitation explicitly instead of attempting to install a nonexistent
platform package.

## Versioning

Package versions follow `<typst-version>-npm.<packaging-revision>`.

For example, `0.15.0-npm.0` contains Typst 0.15.0. The `npm.0` suffix is a
revision of this npm distribution, not a Typst prerelease. The revision changes
only when the packaging needs an update; platform dependencies always use exact
versions.

Install a specific Typst version with:

```sh
npm install --save-dev @flukxr/typst-cli@0.15.0-npm.0
```

Use npm to update the CLI:

```sh
npm install --save-dev @flukxr/typst-cli@latest
```

The native `typst update` command is blocked by the launcher because it would
replace the executable inside `node_modules` without updating `package.json` or
the lockfile. `typst update --help` remains available.

## Programmatic API

`typstPath` is the absolute path to the selected native executable. `version`
is the upstream Typst version, such as `0.15.0`.

```js
const { spawnSync } = require("node:child_process");
const { typstPath, version } = require("@flukxr/typst-cli");

console.log(`Using Typst ${version}`);

const result = spawnSync(
  typstPath,
  ["compile", "main.typ", "main.pdf"],
  { stdio: "inherit" },
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
```

## Binary provenance and verification

Unchanged binaries from official Typst GitHub releases are used whenever they
exist. Selected historical targets missing from upstream releases are built
from the corresponding official source tag with a pinned Rust toolchain.

Source-built packages record the upstream tag, commit, Rust toolchain, target,
and binary SHA-256 in their npm metadata. Downloaded release assets are checked
against GitHub's SHA-256 digest when one is available. For older assets without
an upstream digest, the build records a SHA-256 immediately after downloading
the official asset.

Builds and publications run on GitHub-hosted runners through npm Trusted
Publishing. Publications made from the public repository include npm
provenance. Native binaries are already contained in the platform packages;
nothing is downloaded by an install script or when the CLI starts.

## Automatic releases

A scheduled GitHub Actions watcher checks the latest stable official Typst
release every six hours. When `<typst-version>-npm.0` is not yet published, it
dispatches the regular release workflow. Typst prereleases and drafts are
ignored.

The workflow publishes platform packages before the launcher. If a run is
interrupted after a partial publication, a later check retries it and skips
package versions that already exist. npm authentication uses short-lived OIDC
credentials through Trusted Publishing; no long-lived npm token is stored.

## Local development

Requires Node.js 20 or newer.

```sh
npm ci
npm test
npm run check
```

Build revision `npm.0` for Typst 0.15.0 on the current platform:

```sh
npm run build:platform -- --typst-version 0.15.0 --revision 0
npm run build:meta -- --typst-version 0.15.0 --revision 0
```

Generated tarballs are written to `artifacts/` and are intentionally ignored by
Git.

## Licenses

The JavaScript wrapper and build tooling in this repository are licensed under
MIT. Typst binaries are licensed by the Typst project under Apache-2.0. Each
generated platform package contains the upstream Typst `LICENSE` and `NOTICE`.

The Typst name is used descriptively to identify compatibility and the source
of the redistributed executable. This repository does not use the Typst logo or
claim to be an official Typst project.

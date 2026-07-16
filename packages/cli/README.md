# @flukxr/typst-cli

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

npm selects one optional platform package for Windows, Linux, or macOS on x64
or ARM64. Typst 0.6.0 through 0.8.0 do not support Windows ARM64 because their
pinned `ring 0.16` dependency cannot compile for that target.

## Versioning

Versions follow `<typst-version>-npm.<packaging-revision>`. For example,
`0.15.0-npm.0` contains Typst 0.15.0. The npm revision changes only when the
packaging needs an update; it does not indicate a Typst prerelease.

Packaging-only changes are listed in the project
[changelog](https://github.com/flukxr/typst-cli/blob/main/CHANGELOG.md).

Update through npm so the package manifest and lockfile stay in sync:

```sh
npm install --save-dev @flukxr/typst-cli@latest
```

The native `typst update` command is blocked because it would modify the
executable inside `node_modules` outside npm's package management.

To stay on one Typst release while receiving packaging fixes:

```sh
npm install --save-dev "@flukxr/typst-cli@^0.14.2-npm.0"
npm update @flukxr/typst-cli
```

## Programmatic API

`typstPath` is the absolute path to the selected native executable. `version`
is the upstream Typst version.

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

Unchanged official release binaries are used whenever available. Selected
historical targets are built from the corresponding official source tag with a
pinned Rust toolchain. Package metadata records the source commit, toolchain,
target, and SHA-256. Automated publications use npm Trusted Publishing and
provenance.

This distribution is unofficial. Typst is licensed under Apache-2.0; generated
platform packages include the upstream `LICENSE` and `NOTICE`. The JavaScript
launcher is licensed under MIT.

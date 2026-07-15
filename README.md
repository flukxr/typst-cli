# typst-cli for npm

Unofficial npm distribution of the official [Typst](https://github.com/typst/typst)
CLI binaries.

```sh
npm install --save-dev @flukxr/typst-cli
npx typst --version
npx typst compile main.typ
```

This project is not affiliated with or endorsed by Typst GmbH. It uses
unchanged binaries from official Typst GitHub releases whenever they exist.
Historical targets missing from a release are built from the corresponding
official source tag with a pinned Rust toolchain; the package records the tag,
commit, toolchain, and binary SHA-256. Typst 0.6.0 through 0.8.0 do not support
Windows ARM64 because their pinned `ring` dependency cannot compile for that
target.

Downloaded release assets are verified against GitHub's SHA-256 digest when
one is available. For older assets without an upstream digest, the build
records a SHA-256 computed immediately after downloading the official asset.

## Packages

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

## Programmatic use

```js
const { typstPath, version } = require("@flukxr/typst-cli");
```

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

The resulting npm version is `0.15.0-npm.0`. The suffix is intentionally an
npm packaging revision; internal platform dependencies always use exact
versions.

Generated tarballs are written to `artifacts/` and are intentionally ignored by
Git.

## Licenses

The JavaScript wrapper and build tooling in this repository are licensed under
MIT. Typst binaries are licensed by the Typst project under Apache-2.0. Each
generated platform package contains the upstream Typst `LICENSE` and `NOTICE`.

The Typst name is used descriptively to identify compatibility and the source
of the redistributed executable. This repository does not use the Typst logo or
claim to be an official Typst project.

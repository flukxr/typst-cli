# typst-cli for npm

Unofficial npm distribution of the official [Typst](https://github.com/typst/typst)
CLI binaries.

```sh
npm install --save-dev @flukxr/typst-cli
npx typst --version
npx typst compile main.typ
```

This project is not affiliated with or endorsed by Typst GmbH. It downloads
unchanged binaries from official Typst GitHub releases and verifies their
SHA-256 digests using the values returned by GitHub's Releases API.

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

Build the package for the current platform using the newest Typst release:

```sh
npm run build:platform -- --version latest
npm run build:meta -- --version latest
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

# @flukxr/typst-cli

Run the official Typst CLI through npm without installing Typst globally.

```sh
npm install --save-dev @flukxr/typst-cli
npx typst --version
npx typst compile main.typ
```

Example `main.typ`:

```typst
= Hello from npm
```

The package exports the absolute path to the selected executable:

```js
const { typstPath, version } = require("@flukxr/typst-cli");
```

The matching binary package is installed as an optional dependency for Windows,
Linux, or macOS on x64 or ARM64.

This is an unofficial npm distribution of unchanged binaries from official
Typst GitHub releases. It is not affiliated with or endorsed by Typst GmbH.
Typst itself is licensed under Apache-2.0.

# Contributing

1. Use Node.js 20 or newer.
2. Run `npm ci`.
3. Run `npm test` and `npm run check` before opening a pull request.

Do not commit downloaded Typst binaries or generated package tarballs. They are
created by the release workflow from official upstream releases.

## Releases

The scheduled watcher publishes the first npm packaging revision of a new
stable upstream release as `<typst-version>-npm.0`. It intentionally does not
invent later packaging revisions.

Use the `Build and publish npm packages` workflow manually for packaging-only
changes. Choose `launcher-only` when native binaries are unchanged and set
`platform_revision` to the existing platform package revision. Use `full` only
when platform packages must also change. Record packaging changes in
`CHANGELOG.md` before publishing.

## Commit messages

Use Conventional Commits without quotes around the description:

```text
feat(cli): add platform selection
fix(builder): verify release digest
ci(release): collect package artifacts
docs(readme): clarify installation
```

Use `feat`, `fix`, `docs`, `ci`, `test`, `refactor`, or `chore` as the type.

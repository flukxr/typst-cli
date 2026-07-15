# Contributing

1. Use Node.js 20 or newer.
2. Run `npm ci`.
3. Run `npm test` and `npm run check` before opening a pull request.

Do not commit downloaded Typst binaries or generated package tarballs. They are
created by the release workflow from official upstream releases.

## Commit messages

Use Conventional Commits without quotes around the description:

```text
feat(cli): add platform selection
fix(builder): verify release digest
ci(release): collect package artifacts
docs(readme): clarify installation
```

Use `feat`, `fix`, `docs`, `ci`, `test`, `refactor`, or `chore` as the type.

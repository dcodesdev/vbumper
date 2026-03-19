# Wishes

- Whether the user wants changelog generation as part of the bump
- A `.npmrc` or registry config to understand the target npm scope/registry for publishing
- Whether the user wants turbo remote caching set up (e.g., Vercel remote cache) for CI
- Clarity on whether the CLI should support bumping multiple workspace packages at once or just the root
- Whether the user wants a `--no-git` flag to skip commit/tag creation
- Whether the user prefers the commit message to include the package name (e.g., `bumper@1.2.4`) or just the version (`1.2.4`)
- Example test scenarios for the integration tests — what edge cases matter most?
- Access to the GitHub repo URL so I can verify the Actions workflows are correct for the repo
- Whether the user has set up the `NPM_TOKEN` secret in their GitHub repo settings
- ~~Whether the npm package name `bumper` is available or if we need a scoped name like `@scope/bumper`~~ (resolved: renamed to `verbump`)
- Access to `npm whoami` / npm auth to actually test-publish a package
- A way to check npm name availability programmatically without relying on `npm view` error codes

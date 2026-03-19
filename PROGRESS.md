# Progress

## Phase 1: Monorepo Setup (Complete)

- Created bun workspace monorepo with `apps/` and `packages/` directories
- CLI app name: **bumper** (lives in `apps/bumper/`)
- Core package: **@bumper/core** (lives in `packages/core/`)
- Root `package.json` with workspaces config pointing to `packages/*` and `apps/*`
- TypeScript configured for all packages (ESNext, bundler module resolution, strict mode)
- `.gitignore` for node_modules, dist, tsbuildinfo
- Placeholder `src/cli.ts` in the CLI app and `src/index.ts` in core
- Both packages verified working with `bun run`

### Structure

```
bumper/
├── apps/
│   └── bumper/        # CLI app
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── cli.ts
├── packages/
│   └── core/          # Core logic
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts
├── package.json       # Root workspace config
├── tsconfig.json      # Root TS config
└── .gitignore
```

## Phase 2: Prettier + Husky + Lint-Staged (Complete)

- Installed `prettier`, `@trivago/prettier-plugin-sort-imports`, `husky`, `lint-staged`
- `.prettierrc` configured with: `singleQuote: false`, `trailingComma: "none"`, `semi: false`, sorted imports plugin
- `.prettierignore` for dist, node_modules, bun.lock
- Husky initialized with pre-commit hook running `lint-staged`
- `lint-staged` config in root `package.json` formats `*.{ts,tsx,js,jsx,json,md}` on commit
- Added `format` and `format:check` scripts to root `package.json`
- All existing files formatted and verified passing `prettier --check`

## Phase 3: ESLint Setup (Complete)

- ESLint 10 with `@eslint/js` and `typescript-eslint` already installed from prior work
- `eslint.config.js` flat config with recommended rules for JS and TS, ignoring `dist/` and `node_modules/`
- Added `"type": "module"` to root `package.json` to eliminate ESM parsing warning
- Added `lint` and `lint:fix` scripts to root `package.json`
- Updated `lint-staged` to run `eslint --fix` before prettier on `*.{ts,tsx,js,jsx}` files
- All existing code passes ESLint with zero errors or warnings

## Phase 4: tsgo Setup (Complete)

- Installed `@typescript/native-preview` (v7.0.0-dev) — the official Microsoft native TypeScript compiler port (`tsgo`)
- Added `typecheck` script to root `package.json`: `tsgo --noEmit`
- Verified all TypeScript code across `apps/bumper` and `packages/core` passes with zero type errors
- `tsgo` replaces `tsc` for type-checking — significantly faster native Go-based compiler

## Phase 5: Turborepo Setup (Complete)

- Installed `turbo` v2.8.19
- Created `turbo.json` with task definitions for `typecheck`, `build`, and `lint`
- `typecheck` task configured with `dependsOn: ["^typecheck"]` for correct dependency ordering
- `build` task configured with `dependsOn: ["^build"]` and `outputs: ["dist/**"]`
- Added `typecheck` script (`tsgo --noEmit`) to both `apps/bumper` and `packages/core`
- Root `typecheck` script updated from `tsgo --noEmit` to `turbo typecheck` — runs typecheck across all packages in parallel
- Added `packageManager: "bun@1.3.10"` to root `package.json` (required by turbo)
- Verified caching works: second run achieves **FULL TURBO** (18ms cached vs 139ms uncached)

## Phase 6: Internal Packages Research (Complete)

- Researched whether `@bumper/core` can remain internal-only in npm workspaces
- **Answer: Yes** — workspace packages are resolved locally via symlinks, no publishing needed
- Added `"private": true` to `packages/core/package.json` to prevent accidental publishing
- Wrote detailed findings to `INTERNAL_PACKAGES.md`

## Phase 7: CLI Bump Implementation (Complete)

- Implemented core bump logic in `packages/core/src/index.ts`:
  - `parseSemver()` — parses version string into `[major, minor, patch]` tuple
  - `bumpVersion()` — increments version by bump type (major/minor/patch)
  - `readPackageJson()` / `writePackageJson()` — reads and writes `package.json`
  - `gitCommit()` — stages `package.json` and creates a git commit with the new version as message
  - `gitTag()` — creates a git tag (e.g., `v1.2.4`)
  - `bump()` — orchestrates the full bump flow (read → bump → write → commit → tag)
- Implemented CLI in `apps/bumper/src/cli.ts`:
  - Usage: `bumper <major|minor|patch> [options]`
  - `--dry-run` flag previews changes without modifying anything
  - `--tag-prefix` flag customizes git tag prefix (default: `v`)
  - `--cwd` flag sets working directory
  - `-h` / `--help` flag shows usage
- Added `@bumper/core` as workspace dependency in `apps/bumper/package.json`
- Added `@types/node` to both `packages/core` and `apps/bumper` for Node.js type definitions
- Added `"types": ["node"]` to both `tsconfig.json` files
- All code passes `tsgo --noEmit` typecheck, ESLint, and Prettier
- Verified dry-run output for all bump types (major, minor, patch)

## Phase 8: Vitest Integration Tests for Dry-Run (Complete)

- Installed `vitest` v4.1.0 as root devDependency
- Created integration test suite at `apps/bumper/test/dry-run.test.ts` with 8 tests:
  - Verifies dry-run stdout output for patch, minor, and major bumps
  - Asserts `package.json` is not modified during dry-run
  - Asserts no git commit is created during dry-run
  - Asserts no git tag is created during dry-run
  - Tests custom `--tag-prefix` flag in dry-run mode
  - Tests edge case with version `0.0.0`
- Each test creates a temporary git repo with a `package.json`, runs the CLI via `bun run`, and asserts on stdout
- Added `test` script to `apps/bumper/package.json` (`vitest run`)
- Added `test` task to `turbo.json`
- Added root `test` script (`turbo test`)
- All 8 tests pass, typecheck clean, ESLint clean

## Phase 9: CLI Library Migration (Complete)

- Replaced hand-rolled argument parsing with **commander** v14.0.3
- `commander` is the most popular Node.js CLI framework (~130M weekly npm downloads)
- CLI features preserved: `<type>` argument, `--dry-run`, `--tag-prefix`, `--cwd`, `-h`/`--help`
- Commander provides automatic `--help` generation, error handling, and argument validation
- All 8 existing integration tests pass without any changes
- Typecheck, ESLint, and Prettier all clean

## Phase 10: CI & Publish GitHub Actions (Complete)

- Created `.github/workflows/publish.yml` — triggers on `v*` tags:
  - Sets up bun 1.3.10 and Node 22
  - Runs `bun install --frozen-lockfile`, typecheck, test, build
  - Publishes `apps/bumper` to npm with `--provenance --access public`
  - Uses `NPM_TOKEN` secret for authentication and OIDC `id-token: write` for provenance
- Created `.github/workflows/ci.yml` — triggers on push to main/dev and PRs to main:
  - Runs format check, lint, typecheck, test, and build
- Added `files: ["dist"]` to `apps/bumper/package.json` to ensure only the bundled output is published
- Verified with `npm pack --dry-run`: tarball contains only `dist/cli.js` (82.4KB) and `package.json`
- Build produces a single self-contained bundle (no runtime dependency on `@bumper/core`)

## Phase 11: npm Name Availability Check (Complete)

- Checked npm registry: `bumper` is already taken (v1.1.0 by tankenstein)
- Also checked `bumpx` (taken), `bumpit` (taken), `vbump` (taken)
- Renamed npm package to **verbump** (available on npm)
- Updated `apps/bumper/package.json`: name `bumper` → `verbump`, bin `bumper` → `verbump`
- Updated `apps/bumper/src/cli.ts`: commander `.name("bumper")` → `.name("verbump")`
- Updated `.github/workflows/ci.yml` and `publish.yml`: `--filter bumper` → `--filter verbump`
- Internal workspace package `@bumper/core` unchanged (private, not published)
- All 8 tests pass, typecheck clean, npm pack confirms `verbump@0.0.1`

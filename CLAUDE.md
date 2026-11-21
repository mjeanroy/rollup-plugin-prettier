# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`rollup-plugin-prettier` is a Rollup plugin that runs prettier on the final bundle (`renderChunk` hook). It supports a wide range of peer versions — prettier `^1 || ^2 || ^3` and rollup `^1 || ^2 || ^3 || ^4` — so code in `src/` must stay compatible with all of them (e.g. `prettier.resolveConfig` vs `resolveConfigSync`, and `prettier.format` being sync in v1/v2 but async in v3, hence the `Promise.resolve(...)` wrapping).

## Commands

Package manager is pnpm (see `pnpm-workspace.yaml`, pnpm 11, version pinned in the GitHub workflows; pnpm 11 only reads auth/registry settings from `.npmrc`, so pnpm settings belong in `pnpm-workspace.yaml`). Node version in `.nvmrc`. All npm scripts delegate to gulp tasks in `gulpfile.js` / `scripts/`.

- `pnpm run lint` — ESLint (airbnb-base + `valid-jsdoc`, max-len 140) over root, `src`, `test`, `scripts` (`.js` and `.ts`). Any warning fails the task. Skipped on Node <= 14. Restrict to specific files/directories/globs with `--file <path>` (repeatable; fails if a path matches nothing):
  ```sh
  pnpm run lint --file src/index.js --file test/index.spec.js
  ```
  `--file` only affects the standalone `lint` task; `build`/`test`/`release` always lint the whole project.
- `pnpm run build` — clean → lint → rollup bundle `src/index.js` to `dist/index.js` (CJS, LICENSE banner, itself formatted with prettier) and copy `src/index.d.ts` to `dist/`.
- `pnpm test` — clean → lint → build → Jasmine (`test/**/*.spec.js`). Lint errors therefore fail the test run.
- `pnpm run tdd` — same pipeline, then watch mode.
- `pnpm run test:unit` — run Jasmine only (no clean/lint/build; tests import from `src/` directly). Select a subset with `--file <path>` (repeatable) and/or `--filter <regex>` on spec names:
  ```sh
  pnpm run test:unit --file test/index.spec.js --filter "should run prettier"
  ```
- Releases: `pnpm run release:{patch,minor,major}` (runs full test first); `pnpm run changelog`.

The `--file` / `--filter` flags are parsed by `scripts/cli/index.js` (`readCliOptions`), shared by the lint and test tasks; paths may be absolute or relative to the project root.

## Architecture

- `src/index.js` — the Rollup plugin factory; only implements `renderChunk`, forwarding `outputOptions.sourcemap` to the core class.
- `src/rollup-plugin-prettier.js` — `RollupPluginPrettier` class:
  - Constructor strips plugin-only options (`sourcemap`, `cwd`) and merges the prettier config resolved from `cwd` (default `process.cwd()`) with user options (user options win). Resolution looks up from a fake `<cwd>/__noop__.js` file because prettier >= 3.1.1 resolves from a file path, not a directory. Options are stored as a Promise; empty options become `undefined`.
  - Sourcemaps: prettier can't emit sourcemaps, so when enabled (rollup output option takes precedence over the plugin's `sourcemap` option) the plugin computes a char diff (`diff.diffChars`) between input and output and replays it onto a `MagicString` to generate the map. This is slow, so it is off by default and logs a `console.warn` unless `sourcemap: 'silent'`.
- `src/index.d.ts` — hand-written TypeScript typings, copied as-is to `dist/`.
- Adding/changing a plugin-only option requires updating three places: the `OPTIONS` set in `src/rollup-plugin-prettier.js` (those keys are stripped before the rest is forwarded to prettier — forgetting it leaks the option to prettier), `src/index.d.ts`, and the "Plugin Options" section of `README.md`.
- Source is ES modules transpiled by Babel (`.babelrc`: CJS + `add-module-exports` for tests/scripts via `@babel/register`; `rollup` env keeps ESM for bundling). `dist/` is the published output (`main`).

## Tests

Jasmine with `failSpecWithNoExpectations: true`. `test/index.spec.js` and `test/rollup-plugin-prettier.spec.js` are unit tests against `src/`; `test/it/it.spec.js` runs real rollup builds into a temp dir using `test/fixtures/` (which includes a `prettier.config.js` used for config-resolution tests). Tests commonly spy on `console.warn` to assert sourcemap warnings (helpers in `test/utils/`).

## Compatibility

- CI (`.github/workflows/build.yml`) runs `pnpm test` on Node 18–26 across Windows, Linux and macOS, with Node installed by `actions/setup-node` and pnpm by `pnpm/setup` (self-contained binary, since pnpm 11 itself needs Node >= 22.13): code in `scripts/` must handle Windows paths (use `path.join`, normalize to forward slashes where Jasmine/ESLint expect them).
- `dist/` is transpiled by Babel targeting Node 14. (`engines` in `package.json` still says `>=6`, which is stale.)

## Release & publishing

- `dist/` is not tracked in git except in release commits: `release:*` force-adds `dist/`, runs `npm version` (creating the version commit + tag), then commits its removal ("release: prepare next release").
- Releases are done through GitHub Actions, not locally: `release.yml` (manual dispatch, dry-run by default) runs the release task with signed commits and pushes the tag; `publish.yml` then publishes a given tag to npm with provenance (OIDC). Do not run `release:*` locally to experiment — it creates real commits and tags.
- `.npmignore` excludes `src/`, `test/`, `scripts/` and config files, so only `dist/` (plus README/LICENSE/CHANGELOG) is published. Add any new top-level dev-only file or directory to `.npmignore`.

## Conventions

- Every source/script file starts with the MIT license header block; keep it on new files.
- `console` is restricted to `warn`/`error` by ESLint.
- Commits follow conventional-commit style (changelog is generated from them).

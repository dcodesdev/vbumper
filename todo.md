# Todo

NOTE: THIS FILE CAN CHANGE AT ANY TIME — ALWAYS RE-READ BEFORE ACTING
NOTE: TICK EACH ITEM AS SOON AS IT IS COMPLETE
NOTE: ONLY WORK ON TASKS IN THE FIRST SECTION

- [x] Write your todos here.
- [x] Make a mono repo for the project, use bun and typescript. Find a good name for the cli app.
- [x] In the mono repo we should have packages/ and apps/ the cli is in apps. and we'll have a core/ package as well. we don't need the bunfig.toml file. no hoisting needed it just works well with workspaces.
- [x] Set up prettier, husky, lint staged, with sorted imports, single quote false, trailling comma none, semi false.
- [x] Set up eslint.
- [x] Set up tsgo, use that instead of tsc. make sure all ts code has no ts error.
- [x] Set up turborepo. and have a typecheck script for all packages.
- [x] The core package is internal only, can we have this? does npm work this way? or we need to publish those separate packages too? write your answer in a .md file
- [x] I need to build a CLI that runs bumps projects and reads from package.json and bumps it and creates a git commit and git tag with v0.1.1etc. Make a mono repo.
- [x] Should have dry run option and write intg test for it using vitest. and do assert or expect based on the stdout of the dry run.
- [x] Use a popular library for the cli.
- [x] Set up CI github actions for publishing to npm.
- [x] Check if the cli is actually available on npm, otherwise change it's name to something else of your choice

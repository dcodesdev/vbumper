import { Command } from "commander"

import { bump } from "@bumper/core"
import type { BumpType } from "@bumper/core"

const program = new Command()

program
  .name("verbump")
  .description("Bump project versions, create git commits and tags")
  .argument("<type>", "bump type: major, minor, or patch")
  .option("--dry-run", "preview changes without modifying anything", false)
  .option("--tag-prefix <prefix>", "prefix for git tag", "v")
  .option("--cwd <dir>", "working directory", process.cwd())
  .action(
    (
      type: string,
      opts: { dryRun: boolean; tagPrefix: string; cwd: string }
    ) => {
      if (type !== "major" && type !== "minor" && type !== "patch") {
        console.error(
          `Error: invalid bump type "${type}" (expected major, minor, or patch)`
        )
        process.exit(1)
      }

      try {
        bump({
          type: type as BumpType,
          dryRun: opts.dryRun,
          tagPrefix: opts.tagPrefix,
          cwd: opts.cwd
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`Error: ${message}`)
        process.exit(1)
      }
    }
  )

program.parse()

import { Command } from "commander"
import { createInterface } from "node:readline"

import { bump, gitPush } from "@bumper/core"
import type { BumpType } from "@bumper/core"

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase())
    })
  })
}

const program = new Command()

program
  .name("vbumper")
  .description("Bump project versions, create git commits and tags")
  .argument("[type]", "bump type: major, minor, or patch (default: patch)")
  .option("--dry-run", "preview changes without modifying anything", false)
  .option("--tag-prefix <prefix>", "prefix for git tag", "v")
  .option("--cwd <dir>", "working directory", process.cwd())
  .action(
    async (
      type: string | undefined,
      opts: { dryRun: boolean; tagPrefix: string; cwd: string }
    ) => {
      const bumpType = type ?? "patch"

      if (
        bumpType !== "major" &&
        bumpType !== "minor" &&
        bumpType !== "patch"
      ) {
        console.error(
          `Error: invalid bump type "${bumpType}" (expected major, minor, or patch)`
        )
        process.exit(1)
      }

      try {
        bump({
          type: bumpType as BumpType,
          dryRun: opts.dryRun,
          tagPrefix: opts.tagPrefix,
          cwd: opts.cwd
        })

        if (!opts.dryRun) {
          const answer = await ask("Push? (y/N) ")
          if (answer === "y") {
            gitPush(opts.cwd)
            console.log("Pushed.")
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`Error: ${message}`)
        process.exit(1)
      }
    }
  )

program.parse()

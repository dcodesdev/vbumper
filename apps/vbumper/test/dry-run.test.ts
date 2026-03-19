import { execSync } from "node:child_process"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { beforeEach, describe, expect, it } from "vitest"

function createTempProject(version: string = "1.2.3"): string {
  const dir = mkdtempSync(join(tmpdir(), "bumper-test-"))
  execSync("git init", { cwd: dir, stdio: "pipe" })
  execSync('git config user.email "test@test.com"', { cwd: dir, stdio: "pipe" })
  execSync('git config user.name "Test"', { cwd: dir, stdio: "pipe" })
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "test-pkg", version }, null, 2) + "\n"
  )
  execSync("git add -A && git commit -m init", { cwd: dir, stdio: "pipe" })
  return dir
}

function runCli(args: string): string {
  const cliPath = join(__dirname, "..", "src", "cli.ts")
  return execSync(`bun run ${cliPath} ${args}`, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"]
  })
}

describe("bumper dry-run", () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = createTempProject("1.2.3")
  })

  it("should show dry-run output for patch bump", () => {
    const output = runCli(`patch --dry-run --cwd ${tempDir}`)
    expect(output).toContain("[dry-run] test-pkg: 1.2.3 → 1.2.4")
    expect(output).toContain("[dry-run] Would update package.json")
    expect(output).toContain("[dry-run] Would commit: 1.2.4")
    expect(output).toContain("[dry-run] Would tag: v1.2.4")
  })

  it("should show dry-run output for minor bump", () => {
    const output = runCli(`minor --dry-run --cwd ${tempDir}`)
    expect(output).toContain("[dry-run] test-pkg: 1.2.3 → 1.3.0")
    expect(output).toContain("[dry-run] Would tag: v1.3.0")
  })

  it("should show dry-run output for major bump", () => {
    const output = runCli(`major --dry-run --cwd ${tempDir}`)
    expect(output).toContain("[dry-run] test-pkg: 1.2.3 → 2.0.0")
    expect(output).toContain("[dry-run] Would tag: v2.0.0")
  })

  it("should not modify package.json during dry-run", () => {
    runCli(`patch --dry-run --cwd ${tempDir}`)
    const pkg = JSON.parse(
      execSync(`cat ${join(tempDir, "package.json")}`, { encoding: "utf-8" })
    )
    expect(pkg.version).toBe("1.2.3")
  })

  it("should not create a git commit during dry-run", () => {
    const logBefore = execSync("git log --oneline", {
      cwd: tempDir,
      encoding: "utf-8"
    })
    runCli(`patch --dry-run --cwd ${tempDir}`)
    const logAfter = execSync("git log --oneline", {
      cwd: tempDir,
      encoding: "utf-8"
    })
    expect(logAfter).toBe(logBefore)
  })

  it("should not create a git tag during dry-run", () => {
    runCli(`patch --dry-run --cwd ${tempDir}`)
    const tags = execSync("git tag", {
      cwd: tempDir,
      encoding: "utf-8"
    }).trim()
    expect(tags).toBe("")
  })

  it("should respect custom tag prefix in dry-run", () => {
    const output = runCli(
      `patch --dry-run --tag-prefix release- --cwd ${tempDir}`
    )
    expect(output).toContain("[dry-run] Would tag: release-1.2.4")
  })

  it("should work with version 0.0.0", () => {
    const dir = createTempProject("0.0.0")
    const output = runCli(`patch --dry-run --cwd ${dir}`)
    expect(output).toContain("[dry-run] test-pkg: 0.0.0 → 0.0.1")
  })
})

import { execSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

export type BumpType = "major" | "minor" | "patch"

export interface BumpOptions {
  cwd?: string
  type: BumpType
  dryRun?: boolean
  tagPrefix?: string
}

export interface BumpResult {
  oldVersion: string
  newVersion: string
  packageName: string
  tagName: string
  committed: boolean
  tagged: boolean
}

interface PackageJson {
  name?: string
  version?: string
  [key: string]: unknown
}

export function parseSemver(version: string): [number, number, number] {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) {
    throw new Error(`Invalid semver version: ${version}`)
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

export function bumpVersion(version: string, type: BumpType): string {
  const [major, minor, patch] = parseSemver(version)
  switch (type) {
    case "major":
      return `${major + 1}.0.0`
    case "minor":
      return `${major}.${minor + 1}.0`
    case "patch":
      return `${major}.${minor}.${patch + 1}`
  }
}

export function readPackageJson(cwd: string): PackageJson {
  const pkgPath = resolve(cwd, "package.json")
  const raw = readFileSync(pkgPath, "utf-8")
  return JSON.parse(raw) as PackageJson
}

export function writePackageJson(cwd: string, pkg: PackageJson): void {
  const pkgPath = resolve(cwd, "package.json")
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8")
}

export function gitCommit(cwd: string, message: string): void {
  execSync(`git add package.json`, { cwd, stdio: "pipe" })
  execSync(`git commit -m ${JSON.stringify(message)}`, { cwd, stdio: "pipe" })
}

export function gitTag(cwd: string, tagName: string): void {
  execSync(`git tag ${tagName}`, { cwd, stdio: "pipe" })
}

export function gitPush(cwd: string): void {
  execSync(`git push --follow-tags`, { cwd, stdio: "pipe" })
}

export function bump(options: BumpOptions): BumpResult {
  const cwd = options.cwd ?? process.cwd()
  const prefix = options.tagPrefix ?? "v"

  const pkg = readPackageJson(cwd)
  const packageName = pkg.name ?? "unknown"
  const oldVersion = pkg.version

  if (!oldVersion) {
    throw new Error("No version field found in package.json")
  }

  const newVersion = bumpVersion(oldVersion, options.type)
  const tagName = `${prefix}${newVersion}`

  if (options.dryRun) {
    console.log(`[dry-run] ${packageName}: ${oldVersion} → ${newVersion}`)
    console.log(`[dry-run] Would update package.json`)
    console.log(`[dry-run] Would commit: ${newVersion}`)
    console.log(`[dry-run] Would tag: ${tagName}`)
    return {
      oldVersion,
      newVersion,
      packageName,
      tagName,
      committed: false,
      tagged: false
    }
  }

  pkg.version = newVersion
  writePackageJson(cwd, pkg)
  console.log(`Updated ${packageName}: ${oldVersion} → ${newVersion}`)

  gitCommit(cwd, newVersion)
  console.log(`Committed: ${newVersion}`)

  gitTag(cwd, tagName)
  console.log(`Tagged: ${tagName}`)

  return {
    oldVersion,
    newVersion,
    packageName,
    tagName,
    committed: true,
    tagged: true
  }
}

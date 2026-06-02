import chalk from "chalk"
import type { Tazo } from "../client.js"

/** Stat name → display label + color */
export const STAT_CONFIG: Record<string, { label: string; color: (s: string) => string }> = {
  attack:     { label: "ATK", color: chalk.redBright },
  defense:    { label: "DEF", color: chalk.blueBright },
  resistance: { label: "RES", color: chalk.magentaBright },
  weight:     { label: "WGT", color: chalk.yellowBright },
  stability:  { label: "STB", color: chalk.cyanBright },
  spin:       { label: "SPN", color: chalk.greenBright },
  control:    { label: "CTL", color: chalk.magenta },
  bounce:     { label: "BNC", color: chalk.yellow },
  precision:  { label: "PRC", color: chalk.cyan },
}

/** Rarity → color + stars */
export const RARITY_STYLE: Record<string, { color: (s: string) => string; stars: string }> = {
  common:    { color: chalk.gray, stars: "★" },
  uncommon:  { color: chalk.green, stars: "★★" },
  rare:      { color: chalk.blue, stars: "★★★" },
  ultra:     { color: chalk.magenta, stars: "★★★★" },
  legendary: { color: chalk.yellow, stars: "★★★★★" },
}

export const FRANCHISE_COLOR: Record<string, (s: string) => string> = {
  pokemon: chalk.yellowBright,
  "dragon-ball-z": chalk.redBright,
  digimon: chalk.cyanBright,
}

/** Draw a horizontal stat bar */
export function statBar(value: number, max: number, width = 20): string {
  const filled = Math.round((value / max) * width)
  const bar = "█".repeat(filled) + "░".repeat(width - filled)
  return bar
}

/** Format a single tazo for terminal display */
export function formatTazo(t: Tazo, showStats = false): string {
  const name = t.name || t.displayName || `#${t.number || "?"}`
  const slug = chalk.dim(`(${t.slug})`)
  const franchiseName = typeof t.franchise === "object" && t.franchise ? (t.franchise as any).name || (t.franchise as any).slug : t.franchise
  const franchise = franchiseName || "unknown"
  const fc = FRANCHISE_COLOR[franchise] || chalk.white
  const rarityStyle = RARITY_STYLE[t.rarity] || { color: chalk.gray, stars: "?" }
  const rarityStr = rarityStyle.color(rarityStyle.stars)
  const owned = t.isOwned ? chalk.green(" ✓") : ""

  let out = `  ${chalk.bold(fc(name.padEnd(22)))} ${slug.padEnd(28)} ${rarityStr} ${chalk.dim(t.rarity.padEnd(10))}${owned}`

  if (showStats) {
    out += "\n    "
    for (const [key, cfg] of Object.entries(STAT_CONFIG)) {
      const val = (t as any)[key] as number
      out += cfg.color(`${cfg.label} ${String(val).padStart(3)}`) + "  "
    }
  }

  return out
}

/** Format a mini battle card for tazos */
export function formatBattleCard(t: Tazo, index: number): string {
  const name = t.name || t.displayName || "?"
  const fc = FRANCHISE_COLOR[t.franchise || "unknown"] || chalk.white
  return [
    `  ${chalk.bold(`[${index + 1}]`)} ${fc(name.padEnd(20))}`,
    `      ${chalk.red(`ATK ${String(t.attack).padStart(3)}`)}  ${chalk.blue(`DEF ${String(t.defense).padStart(3)}`)}  ${chalk.cyan(`PRC ${String(t.precision).padStart(3)}`)}  ${chalk.yellow(`BNC ${String(t.bounce).padStart(3)}`)}`,
    `      ${chalk.magenta(`RES ${String(t.resistance).padStart(3)}`)}  ${chalk.yellowBright(`WGT ${String(t.weight).padStart(3)}`)}  ${chalk.cyanBright(`STB ${String(t.stability).padStart(3)}`)}  ${chalk.green(`SPN ${String(t.spin).padStart(3)}`)}  ${chalk.magentaBright(`CTL ${String(t.control).padStart(3)}`)}`,
  ].join("\n")
}

/** Header banner for output */
export function banner(title: string): string {
  const width = 60
  const pad = Math.max(0, width - title.length - 4)
  return chalk.bold.yellow("\n" + "═".repeat(2) + " " + title + " " + "═".repeat(pad))
}

/** Format a number with commas */
export function fmt(n: number): string {
  return n.toLocaleString("en-US")
}

import { Command } from "commander"
import chalk from "chalk"
import { api } from "../client.js"
import { STAT_CONFIG, RARITY_STYLE, FRANCHISE_COLOR, statBar, banner } from "../lib/format.js"

export function infoCommand() {
  return new Command("info")
    .description("Show detailed stats for a tazo by name or slug")
    .argument("<name>", "Tazo name or slug")
    .action(async (name) => {
      try {
        const t = await api.getBySlug(name.toLowerCase())
        if (!t) {
          console.log(chalk.yellow(`\n  No tazo found matching "${name}"`))
          return
        }

        const displayName = t.name || t.displayName || `#${t.number || "?"}`
        const franchiseName = typeof t.franchise === "object" && t.franchise
          ? (t.franchise as any).name || (t.franchise as any).slug : t.franchise
        const franchiseSlug = typeof t.franchise === "object" && t.franchise
          ? (t.franchise as any).slug : t.franchise
        const collectionName = typeof t.collection === "object" && t.collection
          ? (t.collection as any).name || "Base Set" : t.collection
        const fc = FRANCHISE_COLOR[franchiseSlug || "unknown"] || chalk.white
        const rarityStyle = RARITY_STYLE[t.rarity] || { color: chalk.gray, stars: "?" }

        console.log(banner(displayName))
        console.log("")
        console.log(`  ${chalk.bold("Franchise:")}   ${fc(franchiseName || "Unknown")}`)
        console.log(`  ${chalk.bold("Collection:")}  ${chalk.dim(collectionName || "Base Set")}`)
        console.log(`  ${chalk.bold("Rarity:")}      ${rarityStyle.color(rarityStyle.stars)} ${rarityStyle.color(t.rarity)}`)
        console.log(`  ${chalk.bold("Role:")}        ${chalk.cyanBright((t.role || "balanced").toUpperCase())}`)
        console.log(`  ${chalk.bold("Owned:")}       ${t.isOwned ? chalk.green("✓ Yes") : chalk.dim("✗ No")}`)
        console.log(`  ${chalk.bold("Slug:")}        ${chalk.dim(t.slug)}`)

        // Stat bars
        const stats = ["attack", "defense", "resistance", "weight", "stability", "spin", "control", "bounce", "precision"]
        const maxStat = Math.max(...stats.map(s => (t as any)[s] as number), 100)

        console.log(chalk.bold("\n  Battle Stats:"))
        for (const stat of stats) {
          const value = (t as any)[stat] as number
          const cfg = STAT_CONFIG[stat]
          const bar = statBar(value, maxStat, 25)
          console.log(`    ${cfg.color(cfg.label.padEnd(5))} ${chalk.bold(String(value).padStart(3))}  ${chalk.dim(bar)}`)
        }

        console.log("")
      } catch (err: any) {
        console.error(chalk.red(`\n  Error: ${err.message}`))
        process.exit(1)
      }
    })
}

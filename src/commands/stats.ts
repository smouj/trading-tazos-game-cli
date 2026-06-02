import { Command } from "commander"
import chalk from "chalk"
import { api } from "../client.js"
import { STAT_CONFIG, RARITY_STYLE, banner, fmt } from "../lib/format.js"

export function statsCommand() {
  return new Command("stats")
    .description("Show collection statistics and breakdowns")
    .action(async () => {
      try {
        const s = await api.stats()

        console.log(banner("Collection Statistics"))
        console.log("")

        // KPI cards
        const completionPct = s.totalTazos > 0 ? ((s.ownedTazos / s.totalTazos) * 100).toFixed(1) : "0"
        console.log(`  ${chalk.bold("Total Tazos:")}       ${chalk.yellowBright(s.totalTazos)}`)
        console.log(`  ${chalk.bold("Owned:")}             ${chalk.green(fmt(s.ownedTazos))}  (${completionPct}%)`)
        console.log(`  ${chalk.bold("Franchises:")}        ${chalk.cyan(s.totalFranchises)}`)
        console.log(`  ${chalk.bold("Collections:")}       ${chalk.magenta(s.totalCollections)}`)

        // By franchise
        if (s.byFranchise && Object.keys(s.byFranchise).length > 0) {
          console.log(chalk.bold("\n  By Franchise:"))
          const maxF = Math.max(...Object.values(s.byFranchise), 1)
          for (const [name, count] of Object.entries(s.byFranchise)) {
            const bar = "█".repeat(Math.round((count / maxF) * 20))
            console.log(`    ${chalk.bold(name.padEnd(18))} ${chalk.yellowBright(String(count).padStart(4))}  ${chalk.dim(bar)}`)
          }
        }

        // By rarity
        if (s.byRarity && Object.keys(s.byRarity).length > 0) {
          console.log(chalk.bold("\n  By Rarity:"))
          for (const [rarity, count] of Object.entries(s.byRarity)) {
            const style = RARITY_STYLE[rarity] || { color: chalk.gray, stars: "?" }
            console.log(`    ${style.color(style.stars)} ${style.color(rarity.padEnd(14))} ${chalk.bold(String(count))}`)
          }
        }

        // By condition
        if (s.byCondition && Object.keys(s.byCondition).length > 0) {
          console.log(chalk.bold("\n  By Condition:"))
          for (const [cond, count] of Object.entries(s.byCondition)) {
            console.log(`    ${chalk.dim("■")} ${cond.padEnd(16)} ${chalk.bold(String(count))}`)
          }
        }

        console.log("")
      } catch (err: any) {
        console.error(chalk.red(`\n  Error: ${err.message}`))
        process.exit(1)
      }
    })
}

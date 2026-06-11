import { Command } from "commander"
import chalk from "chalk"
import { api } from "../client.js"
import { banner } from "../lib/format.js"

export function topCommand() {
  return new Command("top")
    .description("Show top tazos by stat")
    .option("-s, --stat <stat>", "Stat to rank by (attack, defense, spin, etc.)", "attack")
    .option("-l, --limit <n>", "Number to show", "10")
    .option("-f, --franchise <slug>", "Filter by franchise")
    .action(async (opts) => {
      try {
        const stat = opts.stat.toLowerCase()
        const validStats = ["attack", "defense", "resistance", "weight", "stability", "spin", "control", "bounce", "precision"]
        if (!validStats.includes(stat)) {
          console.error(chalk.red(`\n  Invalid stat: "${stat}". Choices: ${validStats.join(", ")}`))
          process.exit(1)
        }

        const data = await api.topTazos(stat, parseInt(opts.limit))
        console.log(banner(`Top ${opts.limit} by ${stat.toUpperCase()}`))

        if (opts.franchise) {
          console.log(chalk.dim(`  Franchise filter: ${opts.franchise}`))
        }

        for (let i = 0; i < data.tazos.length; i++) {
          const t = data.tazos[i]
          const name = t.name || t.displayName || `#${t.number || "?"}`
          const value = (t as any)[stat] as number
          const rank = chalk.bold(String(i + 1).padStart(2))
          const statName = stat.toUpperCase().padEnd(5)
          const statVal = chalk.yellowBright(String(value).padStart(3))
          const tazoName = chalk.bold(name.padEnd(24))
          const franchiseSlug = typeof t.franchise === "object" && t.franchise ? (t.franchise as any).slug : t.franchise
          const franchise = chalk.dim(`[${(franchiseSlug || "?").slice(0, 4).toUpperCase()}]`)

          console.log(`  ${rank}. ${statName} ${statVal}  ${tazoName} ${franchise}`)
        }

        console.log("")
      } catch (err: any) {
        console.error(chalk.red(`\n  Error: ${err.message}`))
        process.exit(1)
      }
    })
}

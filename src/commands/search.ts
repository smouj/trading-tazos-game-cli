import { Command } from "commander"
import chalk from "chalk"
import { api } from "../client.js"
import { formatTazo, banner } from "../lib/format.js"

export function searchCommand() {
  return new Command("search")
    .description("Search tazos by name or slug")
    .argument("[query]", "Search term (partial name, slug, or number)")
    .option("-f, --franchise <slug>", "Filter by franchise (pokemon, digimon, dragon-ball-z)")
    .option("-r, --rarity <rarity>", "Filter by rarity (common, uncommon, rare, ultra, legendary)")
    .option("-s, --stats", "Show full 9-stat breakdown")
    .option("-l, --limit <n>", "Max results", "15")
    .action(async (query, opts) => {
      try {
        const data = await api.search(query || "", {
          franchise: opts.franchise,
          rarity: opts.rarity,
          limit: parseInt(opts.limit),
        })

        const q = query || "all"
        console.log(banner(`Search: "${q}" — ${data.total} results`))

        if (data.tazos.length === 0) {
          console.log(chalk.dim("\n  No tazos found. Try a different query or filter."))
          return
        }

        for (const t of data.tazos) {
          console.log(formatTazo(t, opts.stats))
        }

        if (data.total > data.tazos.length) {
          console.log(chalk.dim(`\n  ...and ${data.total - data.tazos.length} more. Use --limit to see more.`))
        }
      } catch (err: any) {
        console.error(chalk.red(`\n  Error: ${err.message}`))
        process.exit(1)
      }
    })
}

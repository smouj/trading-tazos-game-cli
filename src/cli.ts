#!/usr/bin/env node
import { Command } from "commander"
import chalk from "chalk"
import { searchCommand } from "./commands/search.js"
import { infoCommand } from "./commands/info.js"
import { statsCommand } from "./commands/stats.js"
import { battleCommand } from "./commands/battle.js"
import { topCommand } from "./commands/top.js"
import { DECK_SIZE, STARTING_HAND_SIZE, DRAW_PER_TURN } from "./lib/game-core.js"
import pkg from "../package.json" with { type: "json" }

const program = new Command()

program
  .name("tazos")
  .description(chalk.bold.yellow("🎴 Trading Tazos Game CLI") + chalk.dim(" — Manage your digital tazo collection from the terminal"))
  .version(pkg.version)
  .addHelpText("after", `
${chalk.dim("Examples:")}
  ${chalk.cyan("$ tazos search lumipuff")}        ${chalk.dim("Search for tazos by name")}
  ${chalk.cyan("$ tazos info cipherion")}          ${chalk.dim("Show detailed stats for a tazo")}
  ${chalk.cyan("$ tazos stats")}                   ${chalk.dim("Show collection statistics")}
  ${chalk.cyan("$ tazos top --stat attack")}       ${chalk.dim("Top 10 tazos by attack")}
  ${chalk.cyan("$ tazos battle --player 5")}       ${chalk.dim("Simulate a quick battle")}

${chalk.dim("Game Rules:")}  Deck ${DECK_SIZE} cards · Starting hand ${STARTING_HAND_SIZE} · Draw ${DRAW_PER_TURN}/turn
${chalk.dim("API:")}  https://tradingtazosgame.com
${chalk.dim("Repo:")} https://github.com/smouj/trading-tazos-game-cli
`)

program.addCommand(searchCommand())
program.addCommand(infoCommand())
program.addCommand(statsCommand())
program.addCommand(battleCommand())
program.addCommand(topCommand())

program.parse()

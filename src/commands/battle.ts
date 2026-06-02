import { Command } from "commander"
import chalk from "chalk"
import { api } from "../client.js"
import { formatBattleCard, banner } from "../lib/format.js"
import type { Tazo } from "../client.js"

/** Deterministic pseudo-random - same seed = same battle */
function mulberry32(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
}

interface BattleResult {
  player: { tazos: Tazo[]; captures: number; totalDamage: number }
  opponent: { tazos: Tazo[]; captures: number; totalDamage: number }
  turns: number
  winner: "player" | "opponent" | "draw"
  log: string[]
}

function simulateBattle(playerTazos: Tazo[], opponentTazos: Tazo[], seed: number): BattleResult {
  const rng = mulberry32(seed)
  const log: string[] = []
  const p = { tazos: [...playerTazos], captures: 0, totalDamage: 0 }
  const o = { tazos: [...opponentTazos], captures: 0, totalDamage: 0 }
  let turn = 0

  while (p.tazos.length > 0 && o.tazos.length > 0 && turn < 50) {
    turn++
    const isPlayerTurn = rng() > 0.5

    const attacker = isPlayerTurn
      ? p.tazos[Math.floor(rng() * p.tazos.length)]
      : o.tazos[Math.floor(rng() * o.tazos.length)]

    const defender = isPlayerTurn
      ? o.tazos[Math.floor(rng() * o.tazos.length)]
      : p.tazos[Math.floor(rng() * p.tazos.length)]

    // Calculate damage
    const power = 50 + rng() * 50
    const accuracy = 0.7 + (attacker.precision / 100) * 0.2 + (attacker.control / 100) * 0.1
    const hits = rng() < accuracy

    if (hits) {
      const baseDamage = (attacker.attack * 0.35 + attacker.weight * 0.2 + attacker.spin * 0.1 + power * 0.35)
      const defend = defender.defense * 0.3 + defender.resistance * 0.3 + defender.weight * 0.15 + defender.stability * 0.25
      const damage = Math.max(1, Math.round(baseDamage - defend * 0.6))
      const critical = rng() < 0.1
      const finalDamage = critical ? Math.round(damage * 1.8) : damage

      const atkName = attacker.name || "?"
      const defName = defender.name || "?"
      const critStr = critical ? chalk.yellow(" CRIT!") : ""

      if (isPlayerTurn) {
        o.totalDamage += finalDamage
        log.push(chalk.cyan(`  ${atkName}`) + chalk.dim(" → ") + chalk.red(`${defName}`) + chalk.dim(`  ${finalDamage} dmg`) + critStr)
      } else {
        p.totalDamage += finalDamage
        log.push(chalk.red(`  ${atkName}`) + chalk.dim(" → ") + chalk.cyan(`${defName}`) + chalk.dim(`  ${finalDamage} dmg`) + critStr)
      }

      // Capture check (high damage or low stability)
      const captureChance = (finalDamage / 150) * (1 - defender.stability / 100)
      if (rng() < captureChance) {
        if (isPlayerTurn) {
          const idx = o.tazos.indexOf(defender)
          if (idx >= 0) { o.tazos.splice(idx, 1); p.captures++; log.push(chalk.green(`  CAPTURE! ${defName} joins your collection`)) }
        } else {
          const idx = p.tazos.indexOf(defender)
          if (idx >= 0) { p.tazos.splice(idx, 1); o.captures++; log.push(chalk.red(`  LOST! ${defName} captured by opponent`)) }
        }
      }

      // Self-flip check (high power with low precision)
      const selfFlipChance = (power / 100) * (1 - attacker.precision / 100) * 0.2
      if (rng() < selfFlipChance) {
        const flipDamage = Math.round(finalDamage * 0.3)
        const selfName = attacker.name || "?"
        if (isPlayerTurn) {
          p.totalDamage += flipDamage
          log.push(chalk.redBright(`  SELF-FLIP! ${selfName} takes ${flipDamage} recoil damage`))
        } else {
          o.totalDamage += flipDamage
          log.push(chalk.redBright(`  SELF-FLIP! ${selfName} takes ${flipDamage} recoil damage`))
        }
      }
    } else {
      const atkName = attacker.name || "?"
      log.push(chalk.dim(`  ${atkName} misses completely!`))
    }
  }

  const winner: BattleResult["winner"] =
    p.tazos.length > o.tazos.length ? "player"
    : o.tazos.length > p.tazos.length ? "opponent"
    : p.captures > o.captures ? "player"
    : o.captures > p.captures ? "opponent"
    : "draw"

  return { player: p, opponent: o, turns: turn, winner, log }
}

export function battleCommand() {
  return new Command("battle")
    .description("Simulate a battle between two teams of tazos")
    .option("-p, --player <n>", "Player team size", "5")
    .option("-o, --opponent <n>", "Opponent team size", "5")
    .option("-s, --seed <n>", "Random seed for reproducible battles")
    .option("-f, --fast", "Skip detailed turn log")
    .action(async (opts) => {
      try {
        const pSize = Math.min(Math.max(parseInt(opts.player), 2), 10)
        const oSize = Math.min(Math.max(parseInt(opts.opponent), 2), 10)
        const seed = parseInt(opts.seed) || Math.floor(Math.random() * 99999)

        // Fetch random tazos
        const [playerData, opponentData] = await Promise.all([
          api.random(pSize),
          api.random(oSize),
        ])

        const playerTazos = playerData.tazos
        const opponentTazos = opponentData.tazos

        console.log(banner(`Battle!  Seed: ${seed}`))
        console.log("")

        // Teams
        console.log(chalk.cyan.bold("  YOUR TEAM:"))
        for (let i = 0; i < playerTazos.length; i++) {
          console.log(formatBattleCard(playerTazos[i], i))
        }

        console.log("")
        console.log(chalk.red.bold("  OPPONENT TEAM:"))
        for (let i = 0; i < opponentTazos.length; i++) {
          console.log(formatBattleCard(opponentTazos[i], i))
        }

        // Run battle
        console.log(chalk.bold.yellow("\n══════════ BATTLE LOG ══════════"))
        const result = simulateBattle(playerTazos, opponentTazos, seed)

        if (!opts.fast) {
          for (const line of result.log) {
            console.log(line)
          }
        } else {
          console.log(chalk.dim(`  (${result.turns} turns, ${result.log.length} events)`))
        }

        // Result
        console.log(chalk.bold.yellow("\n══════════ RESULT ══════════"))
        const winEmoji = result.winner === "player" ? "🏆" : result.winner === "opponent" ? "💀" : "🤝"
        const winColor = result.winner === "player" ? chalk.greenBright : result.winner === "opponent" ? chalk.redBright : chalk.yellow
        console.log(winColor(`  ${winEmoji} ${result.winner === "player" ? "YOU WIN!" : result.winner === "opponent" ? "Opponent wins!" : "DRAW!"}`))

        console.log("")
        console.log(`  ${chalk.cyan("Your captures:")}     ${chalk.greenBright(result.player.captures)}  Damage dealt: ${chalk.yellow(result.opponent.totalDamage)}`)
        console.log(`  ${chalk.red("Opponent captures:")}  ${chalk.redBright(result.opponent.captures)}  Damage dealt: ${chalk.yellow(result.player.totalDamage)}`)
        console.log(`  ${chalk.dim("Turns:")}              ${result.turns}`)
        console.log(`  ${chalk.dim("Your team left:")}     ${result.player.tazos.length} / ${playerTazos.length}`)
        console.log(`  ${chalk.dim("Opponent team left:")} ${result.opponent.tazos.length} / ${opponentTazos.length}`)
        console.log(`  ${chalk.dim("Seed:")}               ${seed}  (replay with: tazos battle -s ${seed})`)
        console.log("")
      } catch (err: any) {
        console.error(chalk.red(`\n  Error: ${err.message}`))
        process.exit(1)
      }
    })
}

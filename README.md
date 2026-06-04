# 🎴 @trading-tazos-game/cli

<div align="center">

<img src="./logo-complete-black.png" alt="Trading Tazos Game CLI" height="80" />

> Official CLI for the **Trading Tazos Game** — search, battle, and manage your digital tazo collection from the terminal.

[![npm version](https://img.shields.io/npm/v/@trading-tazos-game/cli)](https://www.npmjs.com/package/@trading-tazos-game/cli)
[![license](https://img.shields.io/npm/l/@trading-tazos-game/cli)](./LICENSE)
[![node](https://img.shields.io/node/v/@trading-tazos-game/cli)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/smouj/trading-tazos-game-cli/pulls)

---

## Install

```bash
npm install -g @trading-tazos-game/cli
```

Requirements: **Node.js ≥ 18**

## Quick Start

```bash
# Search your favorite tazo
tazos search pikachu

# Get full battle stats
tazos info charizard

# See collection statistics
tazos stats

# Top 10 by attack power
tazos top --stat attack

# Simulate a battle (deterministic — same seed = same result!)
tazos battle --player 5 --opponent 5 --seed 42
```

## Commands

| Command | Description |
|---------|-------------|
| `tazos search [query]` | Search tazos by name, slug, or number |
| `tazos info <name>` | Show detailed 9-stat breakdown with bars |
| `tazos stats` | Collection statistics by franchise, rarity, condition |
| `tazos top` | Leaderboard by any stat (attack, defense, bounce...) |
| `tazos battle` | Simulate a full battle with physics and captures |

### Search Options

```
tazos search [query] [options]

  -f, --franchise <slug>   Filter: minimon, dracobell, cybermon
  -r, --rarity <rarity>    Filter: common, uncommon, rare, ultra, legendary
  -s, --stats              Show full 9-stat breakdown
  -l, --limit <n>          Max results (default: 15)
```

### Battle Options

```
tazos battle [options]

  -p, --player <n>    Your team size (default: 5)
  -o, --opponent <n>  Opponent team size (default: 5)
  -s, --seed <n>      Random seed for reproducible battles
  -f, --fast          Skip detailed turn log
```

## Authentication

Set your API token to access your personal collection:

```bash
export TAZOS_AUTH_TOKEN="your-jwt-token"
```

Get your token by logging in at [medaclawarena.com](https://medaclawarena.com) and copying it from localStorage (`ttg-token`).

## Features

- 🎯 **9 Battle Stats** — Attack, Defense, Resistance, Weight, Stability, Spin, Control, Bounce, Precision
- 🎲 **Deterministic Battles** — Seed-based RNG, same seed = same outcome every time
- 📊 **Stat Bars** — ASCII bar charts for visual stat comparison
- 🌈 **Franchise Colors** — Minimon yellow, Dracobell orange, Cybermon cyan
- ⭐ **Rarity Stars** — ★ common through ★★★★★ legendary
- 🔄 **Reproducible** — Every battle can be replayed with `--seed`

## API

The CLI connects to the public [Trading Tazos Game API](https://medaclawarena.com):

- `GET /api/tazos` — Search, filter, sort tazos
- `GET /api/stats` — Collection statistics

Override the API base URL:

```bash
export TAZOS_API_URL="https://your-instance.com"
```

## Programmatic Usage

```typescript
import { api } from "@trading-tazos-game/cli"

const data = await api.search("pikachu")
console.log(data.tazos[0].attack) // → 48
```

See `src/index.ts` for the full public API surface.

## Development

```bash
git clone https://github.com/smouj/trading-tazos-game-cli.git
cd trading-tazos-game-cli
npm install
npm run build
node dist/cli.js --help
```

## Related

- [Trading Tazos Game](https://medaclawarena.com) — Play in your browser
- [Main Repo](https://github.com/smouj/Trading-Tazos-Game) — Full-stack Next.js game
- [npm Package](https://www.npmjs.com/package/@trading-tazos-game/cli)

## License

MIT © Trading Tazos Game

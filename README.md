# 🎴 TTG CLI — @trading-tazos-game/cli

**Official CLI for the Trading Tazos Game** — search, battle, and explore 351 digital tazos from your terminal.

[![npm](https://img.shields.io/npm/v/@trading-tazos-game/cli)](https://www.npmjs.com/package/@trading-tazos-game/cli)
[![License: proprietary](https://img.shields.io/badge/License-proprietary-yellow.svg)](https://opensource.org/licenses/proprietary)

## Quick Start

```bash
npx @trading-tazos-game/cli search lumipuff
```

Or install globally:

```bash
npm install -g @trading-tazos-game/cli
tazos stats
```

## Commands

### `tazos search [query]`
Search tazos by name, slug, or number.

```bash
tazos search cipherion                      # Search by name
tazos search --franchise minimon --rarity legendary  # Filter
tazos search --stats brotalix               # Show stat breakdown
tazos search -l 50                          # More results
```

### `tazos info <name>`
Detailed stats for a specific tazo.

```bash
tazos info 001-brotalix
tazos info cipherion
```

### `tazos stats`
Collection overview — totals, breakdowns by franchise and rarity.

```bash
tazos stats
```

### `tazos top`
Leaderboard by stat.

```bash
tazos top --stat attack --limit 10
tazos top --stat defense --franchise cybermon
```

### `tazos battle`
Simulate a battle between two random teams.

```bash
tazos battle                    # 5v5 battle
tazos battle --player 8 --opponent 8    # 8v8
tazos battle --seed 42 --fast           # Reproducible + fast mode
```

## Options

| Option | Description |
|--------|-------------|
| `-f, --franchise <slug>` | Filter: minimon, dracobell, cybermon |
| `-r, --rarity <rarity>` | Filter: common, uncommon, rare, ultra, legendary |
| `-s, --stats` | Show full 9-stat breakdown |
| `-l, --limit <n>` | Max results (default: 15) |
| `--sortBy <stat>` | Sort by: attack, defense, spin, weight, etc. |
| `--sortOrder asc/desc` | Sort direction |

## Battle Stats

Each tazo has 9 stats used in battles:

| Stat | Label | Role |
|------|-------|------|
| Attack | ATK | Raw damage potential |
| Defense | DEF | Damage reduction |
| Resistance | RES | Status/effect resistance |
| Weight | WGT | Physical mass (momentum) |
| Stability | STB | Resistance to knockback |
| Spin | SPN | Rotation speed |
| Control | CTL | Trajectory control |
| Bounce | BNC | Rebound elasticity |
| Precision | PRC | Accuracy |

## Game Rules (from game-core.ts)

- **Deck size**: 20 tazos
- **Starting hand**: 5 cards
- **Draw per turn**: 1 card
- **Max hand size**: 10 cards

## API

The CLI connects to the public TTG Backend API:

```
https://api.tradingtazosgame.com
```

No authentication required for public data endpoints (`/api/tazos`, `/api/stats`).

Set `TAZOS_API_URL` to use a custom server:

```bash
TAZOS_API_URL=http://localhost:3004 tazos stats
```

## Development

```bash
git clone https://github.com/smouj/trading-tazos-game-cli
cd trading-tazos-game-cli
npm install
npm run build
npm start
```

## Links

- **Play now**: https://play.tradingtazosgame.com
- **Website**: https://tradingtazosgame.com
- **ProductHunt**: https://www.producthunt.com/products/trading-tazos-game-ttg
- **Source**: https://github.com/smouj/trading-tazos-game-cli
- **Engine**: https://github.com/smouj/TTG-Engine

## License

proprietary © Trading Tazos Game

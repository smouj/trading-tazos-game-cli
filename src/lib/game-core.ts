// ============================================================
// game-core.ts — Core game constants
//
// Kept in sync manually with:
//   Trading-Tazos-Game/src/lib/game-core/types.ts
//
// These define the canonical game rules shared between
// the web app and CLI. No API/UI dependencies.
// ============================================================

/** Required deck size for competitive play */
export const DECK_SIZE = 20

/** Cards drawn at battle start */
export const STARTING_HAND_SIZE = 5

/** Cards drawn each turn */
export const DRAW_PER_TURN = 1

/** Maximum cards allowed in hand */
export const MAX_HAND_SIZE = 10

/** All game rules in a single const object */
export const GAME_RULES = {
  deckSize: DECK_SIZE,
  startingHandSize: STARTING_HAND_SIZE,
  drawPerTurn: DRAW_PER_TURN,
  maxHandSize: MAX_HAND_SIZE,
} as const

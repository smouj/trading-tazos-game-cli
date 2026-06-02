import type { Tazo } from "../client.js";
/** Stat name → display label + color */
export declare const STAT_CONFIG: Record<string, {
    label: string;
    color: (s: string) => string;
}>;
/** Rarity → color + stars */
export declare const RARITY_STYLE: Record<string, {
    color: (s: string) => string;
    stars: string;
}>;
export declare const FRANCHISE_COLOR: Record<string, (s: string) => string>;
/** Draw a horizontal stat bar */
export declare function statBar(value: number, max: number, width?: number): string;
/** Format a single tazo for terminal display */
export declare function formatTazo(t: Tazo, showStats?: boolean): string;
/** Format a mini battle card for tazos */
export declare function formatBattleCard(t: Tazo, index: number): string;
/** Header banner for output */
export declare function banner(title: string): string;
/** Format a number with commas */
export declare function fmt(n: number): string;

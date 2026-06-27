const BASE_URL = process.env.TAZOS_API_URL || "https://api.tradingtazosgame.com"
const AUTH_TOKEN = process.env.TAZOS_AUTH_TOKEN || ""

export interface Tazo {
  id: string
  name: string
  image: string
  rarity: string          // "comun" | "raro" | "epico" | "legendario"
  color: string
  glow: string
  power: number
  description: string
  series: string          // "minimon" | "dracobell" | "cybermon"
  isCanonical: boolean
  source: "static" | "db"
  // Battle stats (9-stat system)
  attack: number
  defense: number
  resistance: number
  weight: number
  stability: number
  spin: number
  control: number
  bounce: number
  precision: number
  // CLI-computed fields (derived from API data)
  franchise?: string     // Derived from series
  franchiseSlug?: string // same as series
  number?: string        // extracted from id
  slug?: string          // alias for id
  displayName?: string   // alias for name
  condition?: string     // always "mint" for API tazos
  collection?: string    // derived from series
  imageUrl?: string      // full image URL
  role?: string          // computed from stats
  isOwned?: boolean      // not available in public API
}

type API_Tazo = Omit<Tazo, "franchise" | "franchiseSlug" | "number" | "slug" | "displayName" | "condition" | "collection" | "imageUrl" | "role" | "isOwned">

export interface TazoListResponse {
  tazos: Tazo[]
  total: number
}

export interface StatsResponse {
  totalTazos: number
  ownedTazos?: number
  totalFranchises: number
  totalCollections: number
  byRarity: Record<string, number>
  byCondition?: Record<string, number>
  byFranchise: Record<string, number>
  topAttack: Tazo | null
  topDefense: Tazo | null
}

export interface CollectionResponse {
  items: Array<{
    id: string
    quantity: number
    isFavorite: boolean
    acquiredAt: string
    tazo: Tazo
  }>
  total: number
  franchiseSummary: Record<string, number>
}

/** Rarity mapping: Backend ES → CLI EN */
const RARITY_ES_TO_EN: Record<string, string> = {
  comun: "common",
  raro: "rare",
  epico: "ultra",
  legendario: "legendary",
}

/** Rarity EN → ES for API queries (maps EN user input to Backend ES) */
export const RARITY_EN_TO_ES: Record<string, string> = {
  common: "comun",
  uncommon: "raro",
  rare: "raro",
  ultra: "epico",
  legendary: "legendario",
}

/** Compute role from stat profile */
function computeRole(t: API_Tazo): string {
  const stats = { attack: t.attack, defense: t.defense, spin: t.spin, precision: t.precision, resistance: t.resistance }
  const top = Object.entries(stats).reduce((a, b) => (a[1] > b[1] ? a : b))
  if (top[1] <= 50) return "balanced"
  switch (top[0]) {
    case "attack": return "offensive"
    case "defense": return "defensive"
    case "spin": return "spinner"
    case "precision": return "sniper"
    case "resistance": return "tank"
    default: return "balanced"
  }
}

/** Enrich an API tazo with CLI-compatible derived fields */
function enrichTazo(t: API_Tazo): Tazo {
  const number = t.id.match(/^\d+/)?.[0] || t.id.split("-")[0] || ""
  return {
    ...t,
    rarity: RARITY_ES_TO_EN[t.rarity] || t.rarity,
    franchise: t.series,
    franchiseSlug: t.series,
    number,
    slug: t.id,
    displayName: t.name,
    condition: "mint",
    collection: t.series.charAt(0).toUpperCase() + t.series.slice(1),
    imageUrl: t.image?.startsWith("http") ? t.image : `https://tradingtazosgame.com${t.image}`,
    role: computeRole(t),
    isOwned: false,
  }
}

async function apiGet<T>(path: string): Promise<T> {
  const headers: Record<string, string> = { "Accept": "application/json" }
  if (AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${AUTH_TOKEN}`
  }
  const url = `${BASE_URL}/api${path}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`API ${res.status}: ${body || res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  async search(
    query: string,
    opts?: { franchise?: string; rarity?: string; limit?: number }
  ): Promise<TazoListResponse> {
    const params = new URLSearchParams()
    if (query) params.set("search", query)
    if (opts?.franchise && opts.franchise !== "all") params.set("series", opts.franchise)
    if (opts?.rarity && opts.rarity !== "all") {
      params.set("rarity", RARITY_EN_TO_ES[opts.rarity] || opts.rarity)
    }
    params.set("limit", String(opts?.limit || 20))
    const data = await apiGet<{ tazos: API_Tazo[]; total: number }>(`/tazos?${params}`)
    return { tazos: data.tazos.map(enrichTazo), total: data.total }
  },

  async getBySlug(slug: string): Promise<Tazo | null> {
    const params = new URLSearchParams({ search: slug, limit: "5" })
    const data = await apiGet<{ tazos: API_Tazo[]; total: number }>(`/tazos?${params}`)
    const enriched = data.tazos.map(enrichTazo)
    const match = enriched.find(
      (t) => t.slug === slug || t.id === slug || t.slug?.includes(slug)
    )
    return match || enriched[0] || null
  },

  async stats(): Promise<StatsResponse> {
    const data = await apiGet<{
      totalTazos: number
      totalFranchises: number
      totalCollections: number
      byRarity: Record<string, string>
      byFranchise: Record<string, number>
      topAttack: API_Tazo | null
      topDefense: API_Tazo | null
    }>("/stats")

    // Map rarity keys from ES to EN
    const byRarity: Record<string, number> = {}
    for (const [k, v] of Object.entries(data.byRarity)) {
      byRarity[RARITY_ES_TO_EN[k] || k] = typeof v === "number" ? v : 0
    }

    return {
      totalTazos: data.totalTazos,
      totalFranchises: data.totalFranchises,
      totalCollections: data.totalCollections,
      byRarity,
      byFranchise: data.byFranchise,
      topAttack: data.topAttack ? enrichTazo(data.topAttack) : null,
      topDefense: data.topDefense ? enrichTazo(data.topDefense) : null,
    }
  },

  async topTazos(stat: string, limit = 10): Promise<TazoListResponse> {
    const params = new URLSearchParams({
      sortBy: stat,
      sortOrder: "desc",
      limit: String(limit),
    })
    const data = await apiGet<{ tazos: API_Tazo[]; total: number }>(`/tazos?${params}`)
    return { tazos: data.tazos.map(enrichTazo), total: data.total }
  },

  async random(limit = 6): Promise<TazoListResponse> {
    const params = new URLSearchParams({ limit: "50" })
    const data = await apiGet<{ tazos: API_Tazo[]; total: number }>(`/tazos?${params}`)
    const enriched = data.tazos.map(enrichTazo)
    const shuffled = [...enriched].sort(() => Math.random() - 0.5)
    return { tazos: shuffled.slice(0, limit), total: limit }
  },
}

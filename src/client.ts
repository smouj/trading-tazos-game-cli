const BASE_URL = process.env.TAZOS_API_URL || "https://tradingtazosgame.com"
const AUTH_TOKEN = process.env.TAZOS_AUTH_TOKEN || ""

export interface Tazo {
  id: string
  name: string | null
  displayName: string | null
  number: string | null
  slug: string
  rarity: string
  condition: string
  franchise: string | null
  franchiseSlug: string | null
  collection: string | null
  imageUrl: string | null
  attack: number
  defense: number
  resistance: number
  weight: number
  stability: number
  spin: number
  control: number
  bounce: number
  precision: number
  role: string | null
  isOwned: boolean
}

export interface TazoListResponse {
  tazos: Tazo[]
  total: number
}

export interface StatsResponse {
  totalTazos: number
  ownedTazos: number
  totalFranchises: number
  totalCollections: number
  byRarity: Record<string, number>
  byCondition: Record<string, number>
  byFranchise: Record<string, number>
  topAttack: Tazo | null
  topDefense: Tazo | null
}

export interface CollectionResponse {
  items: {
    id: string
    quantity: number
    isFavorite: boolean
    acquiredAt: string
    tazo: Tazo
  }[]
  total: number
  franchiseSummary: Record<string, number>
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
  async search(query: string, opts?: { franchise?: string; rarity?: string; limit?: number }): Promise<TazoListResponse> {
    const params = new URLSearchParams()
    if (query) params.set("search", query)
    if (opts?.franchise && opts.franchise !== "all") params.set("franchise", opts.franchise)
    if (opts?.rarity && opts.rarity !== "all") params.set("rarity", opts.rarity)
    params.set("limit", String(opts?.limit || 20))
    return apiGet<TazoListResponse>(`/tazos?${params}`)
  },

  async getBySlug(slug: string): Promise<Tazo | null> {
    const params = new URLSearchParams({ search: slug, limit: "1" })
    const data = await apiGet<TazoListResponse>(`/tazos?${params}`)
    return data.tazos.find(t => t.slug === slug || t.slug?.includes(slug)) || data.tazos[0] || null
  },

  async stats(): Promise<StatsResponse> {
    return apiGet<StatsResponse>("/stats")
  },

  async topTazos(stat: string, limit = 10): Promise<TazoListResponse> {
    const params = new URLSearchParams({ sortBy: stat, sortOrder: "desc", limit: String(limit) })
    return apiGet<TazoListResponse>(`/tazos?${params}`)
  },

  async random(limit = 6): Promise<TazoListResponse> {
    const params = new URLSearchParams({ limit: "30" })
    const data = await apiGet<TazoListResponse>(`/tazos?${params}`)
    const shuffled = [...data.tazos].sort(() => Math.random() - 0.5)
    return { tazos: shuffled.slice(0, limit), total: limit }
  },
}

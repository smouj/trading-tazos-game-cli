export interface Tazo {
    id: string;
    name: string | null;
    displayName: string | null;
    number: string | null;
    slug: string;
    rarity: string;
    condition: string;
    franchise: string | null;
    franchiseSlug: string | null;
    collection: string | null;
    imageUrl: string | null;
    attack: number;
    defense: number;
    resistance: number;
    weight: number;
    stability: number;
    spin: number;
    control: number;
    bounce: number;
    precision: number;
    role: string | null;
    isOwned: boolean;
}
export interface TazoListResponse {
    tazos: Tazo[];
    total: number;
}
export interface StatsResponse {
    totalTazos: number;
    ownedTazos: number;
    totalFranchises: number;
    totalCollections: number;
    byRarity: Record<string, number>;
    byCondition: Record<string, number>;
    byFranchise: Record<string, number>;
    topAttack: Tazo | null;
    topDefense: Tazo | null;
}
export interface CollectionResponse {
    items: {
        id: string;
        quantity: number;
        isFavorite: boolean;
        acquiredAt: string;
        tazo: Tazo;
    }[];
    total: number;
    franchiseSummary: Record<string, number>;
}
export declare const api: {
    search(query: string, opts?: {
        franchise?: string;
        rarity?: string;
        limit?: number;
    }): Promise<TazoListResponse>;
    getBySlug(slug: string): Promise<Tazo | null>;
    stats(): Promise<StatsResponse>;
    topTazos(stat: string, limit?: number): Promise<TazoListResponse>;
    random(limit?: number): Promise<TazoListResponse>;
};

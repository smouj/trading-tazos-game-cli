const BASE_URL = process.env.TAZOS_API_URL || "https://medaclawarena.com";
const AUTH_TOKEN = process.env.TAZOS_AUTH_TOKEN || "";
async function apiGet(path) {
    const headers = { "Accept": "application/json" };
    if (AUTH_TOKEN) {
        headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
    }
    const url = `${BASE_URL}/api${path}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${body || res.statusText}`);
    }
    return res.json();
}
export const api = {
    async search(query, opts) {
        const params = new URLSearchParams();
        if (query)
            params.set("search", query);
        if (opts?.franchise && opts.franchise !== "all")
            params.set("franchise", opts.franchise);
        if (opts?.rarity && opts.rarity !== "all")
            params.set("rarity", opts.rarity);
        params.set("limit", String(opts?.limit || 20));
        return apiGet(`/tazos?${params}`);
    },
    async getBySlug(slug) {
        const params = new URLSearchParams({ search: slug, limit: "1" });
        const data = await apiGet(`/tazos?${params}`);
        return data.tazos.find(t => t.slug === slug || t.slug?.includes(slug)) || data.tazos[0] || null;
    },
    async stats() {
        return apiGet("/stats");
    },
    async topTazos(stat, limit = 10) {
        const params = new URLSearchParams({ sortBy: stat, sortOrder: "desc", limit: String(limit) });
        return apiGet(`/tazos?${params}`);
    },
    async random(limit = 6) {
        const params = new URLSearchParams({ limit: "30" });
        const data = await apiGet(`/tazos?${params}`);
        const shuffled = [...data.tazos].sort(() => Math.random() - 0.5);
        return { tazos: shuffled.slice(0, limit), total: limit };
    },
};
//# sourceMappingURL=client.js.map
// DailyIndonesia SDK: a small client for the public, read-only DailyIndonesia travel API.
// API reference: https://dailyindonesia.com/openapi.json  Docs: https://dailyindonesia.com/developers/

export const DEFAULT_BASE = 'https://dailyindonesia.com/wp-json/di/v1';
export const MCP_URL = 'https://dailyindonesia.com/mcp';

export class DailyIndonesiaError extends Error {
  constructor(message, { code = 'error', status = 0 } = {}) { super(message); this.name = 'DailyIndonesiaError'; this.code = code; this.status = status; }
}

export class DailyIndonesia {
  /** @param {{ baseUrl?: string, fetch?: typeof fetch, userAgent?: string }} [opts] */
  constructor(opts = {}) {
    this.baseUrl = (opts.baseUrl || DEFAULT_BASE).replace(/\/+$/, '');
    this.fetch = opts.fetch || globalThis.fetch;
    this.userAgent = opts.userAgent || 'dailyindonesia-mcp (+https://github.com/adeamol11/dailyindonesia-mcp)';
    if (!this.fetch) throw new Error('No fetch available: use Node 18 or newer, or pass { fetch }.');
  }
  async get(path, query = {}) {
    const url = new URL(this.baseUrl + path);
    for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== '' && v !== false) url.searchParams.set(k, v === true ? '1' : String(v));
    const res = await this.fetch(url, { headers: { Accept: 'application/json', 'User-Agent': this.userAgent } });
    let body; try { body = await res.json(); } catch { throw new DailyIndonesiaError(`Unexpected answer (HTTP ${res.status})`, { status: res.status }); }
    if (!res.ok || body.ok === false) {
      const e = body && body.error ? body.error : { code: body && body.code, message: body && body.message };
      throw new DailyIndonesiaError(e.message || `HTTP ${res.status}`, { code: e.code || 'error', status: res.status });
    }
    return body.data;
  }
  /** Indonesian international airports and which have live boards. */
  airports() { return this.get('/airports').then((d) => d.airports); }
  /** Live board of an airport. @param {string} iata e.g. "DPS" @param {'arrivals'|'departures'|'both'} [direction] */
  board(iata, direction = 'both') { return this.get(`/airports/${encodeURIComponent(String(iata).toUpperCase())}/board`, { direction }); }
  /** Things to do (tours, tickets, day trips), best rated first. */
  thingsToDo({ q, city, page, perPage } = {}) { return this.get('/things-to-do', { q, city, page, per_page: perPage }); }
  /** Restaurants by words, area, cuisine; book/walkin/offers filters. */
  restaurants({ q, area, cuisine, book, walkin, offers, page, perPage } = {}) { return this.get('/restaurants', { q, area, cuisine, book, walkin, offers, page, per_page: perPage }); }
  /** One restaurant by id. */
  restaurant(id) { return this.get(`/restaurants/${parseInt(id, 10)}`); }
  /** Destination guides by region. */
  destinations() { return this.get('/destinations'); }
  /** One destination guide, e.g. "bali/ubud". */
  destination(path) { return this.get('/destinations/item', { path }); }
  /** Indonesia eSIM plans (Airalo, Saily). */
  esim() { return this.get('/esim'); }
}

export default DailyIndonesia;

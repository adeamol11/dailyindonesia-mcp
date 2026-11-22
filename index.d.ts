export declare const DEFAULT_BASE: string;
export declare const MCP_URL: string;
export declare class DailyIndonesiaError extends Error { code: string; status: number; }
export interface Leg { airport: string; code: string; city: string; scheduled: number; revised: number; utc_offset: number | null; terminal: string; gate: string; }
export interface Flight { flight: string; airline: string; airline_iata: string; status: string; status_label: string; scheduled: number; revised: number; terminal: string; gate: string; baggage_belt: string; other_airport: string; aircraft: string; page: string; from: Leg; to: Leg; }
export interface Board { airport: string; timezone: string; tz_short: string; utc_offset: number; fetched: number; delayed: boolean; note: string; arrivals?: Flight[]; departures?: Flight[]; }
export interface Airport { iata: string; icao: string; name: string; city: string; timezone: string; live: boolean; url: string; }
export interface Activity { id: number; title: string; url: string; city: string; rating: number | null; price: number | null; currency: string; price_text: string; summary: string; image: string; }
export interface RestaurantCard { id: number; name: string; url: string; area: string; region: string; rating: number; reviews: number; price: string; cuisines: string[]; bookable: boolean; booking_link: string; [k: string]: unknown; }
export declare class DailyIndonesia {
  constructor(opts?: { baseUrl?: string; fetch?: typeof fetch; userAgent?: string });
  get<T = unknown>(path: string, query?: Record<string, unknown>): Promise<T>;
  airports(): Promise<Airport[]>;
  board(iata: string, direction?: 'arrivals' | 'departures' | 'both'): Promise<Board>;
  thingsToDo(q?: { q?: string; city?: string; page?: number; perPage?: number }): Promise<{ items: Activity[]; total: number; page: number; note: string }>;
  restaurants(q?: { q?: string; area?: string; cuisine?: string; book?: boolean; walkin?: boolean; offers?: boolean; page?: number; perPage?: number }): Promise<{ items: RestaurantCard[]; total: number }>;
  restaurant(id: number): Promise<RestaurantCard & Record<string, unknown>>;
  destinations(): Promise<{ regions: unknown[] }>;
  destination(path: string): Promise<Record<string, unknown>>;
  esim(): Promise<{ currency: string; checked: string; providers: unknown[]; note: string }>;
}
export default DailyIndonesia;

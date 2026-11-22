#!/usr/bin/env node
// DailyIndonesia CLI: live Indonesian flights, things to do, restaurants, destinations and eSIMs.
import { DailyIndonesia, DailyIndonesiaError, MCP_URL } from '../index.js';

const HELP = `dailyindonesia: Indonesia travel data from DailyIndonesia (https://dailyindonesia.com)

Usage:
  dailyindonesia airports                         Airports and which have live boards
  dailyindonesia flights <IATA> [--arrivals|--departures] [--flight GA404]
                                                  Live board, e.g. flights DPS --arrivals
  dailyindonesia things [city] [--q words]        Things to do, e.g. things ubud --q rafting
  dailyindonesia restaurants [--area ubud] [--cuisine balinese] [--q words] [--book] [--walkin]
  dailyindonesia restaurant <id>                  One restaurant
  dailyindonesia destinations                     Destination guides
  dailyindonesia destination <path>               e.g. destination bali/ubud
  dailyindonesia esim                             Indonesia eSIM plans (Airalo, Saily)
  dailyindonesia mcp                              Run the MCP server over stdio (bridge to ${MCP_URL})

Options: --json (raw JSON), --limit N, --help, --version
Docs: https://dailyindonesia.com/developers/`;

const BOOL = ['json', 'arrivals', 'departures', 'book', 'walkin', 'offers', 'help', 'version'];
const argv = process.argv.slice(2);
const flags = {};
const pos = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) {
    const k = a.slice(2);
    const n = argv[i + 1];
    if (!BOOL.includes(k) && n !== undefined && !n.startsWith('--')) { flags[k] = n; i++; } else flags[k] = true;
  } else pos.push(a);
}
const cmd = pos.shift();
const di = new DailyIndonesia();
const limit = Math.max(1, parseInt(flags.limit || '15', 10));
const print = (data, fmt) => console.log(flags.json ? JSON.stringify(data, null, 2) : fmt(data));
const hhmm = (ts, off) => (ts ? new Date((ts + (off || 0) * 60) * 1000).toISOString().slice(11, 16) : '');

function board(b, want) {
  const lines = [`${b.airport}: board saved ${new Date(b.fetched * 1000).toISOString().slice(0, 16).replace('T', ' ')} UTC (times below in ${b.tz_short})`];
  for (const d of ['arrivals', 'departures']) {
    if (!b[d]) continue;
    const rows = b[d].filter((f) => !want || (f.flight + f.airline).replace(/\s+/g, '').toLowerCase().includes(want)).slice(0, limit);
    lines.push('', d.toUpperCase());
    for (const f of rows) {
      const t = hhmm(f.scheduled, b.utc_offset) + (f.revised && f.revised !== f.scheduled ? ' -> ' + hhmm(f.revised, b.utc_offset) : '');
      lines.push(`${t}  ${f.flight.padEnd(8)} ${(d === 'arrivals' ? 'from ' : 'to ') + f.other_airport}  ${f.status_label || f.status}${f.gate ? '  gate ' + f.gate : ''}`);
    }
    if (!rows.length) lines.push('  (none)');
  }
  lines.push('', b.note);
  return lines.join('\n');
}

async function main() {
  if (flags.version) {
    const { readFile } = await import('node:fs/promises');
    console.log(JSON.parse(await readFile(new URL('../package.json', import.meta.url))).version);
    return;
  }
  if (!cmd || flags.help || cmd === 'help') { console.log(HELP); return; }
  switch (cmd) {
    case 'mcp': await import('./dailyindonesia-mcp.js'); return;
    case 'airports': return print(await di.airports(), (l) => l.map((a) => `${a.iata}  ${a.name}, ${a.city}${a.live ? '  (live board)' : ''}`).join('\n'));
    case 'flights': {
      if (!pos[0]) throw new DailyIndonesiaError('Give an airport code, e.g. dailyindonesia flights DPS');
      const dir = flags.arrivals ? 'arrivals' : flags.departures ? 'departures' : 'both';
      const want = flags.flight ? String(flags.flight).replace(/\s+/g, '').toLowerCase() : '';
      return print(await di.board(pos[0], dir), (b) => board(b, want));
    }
    case 'things': return print(await di.thingsToDo({ city: pos[0], q: flags.q, perPage: Math.min(limit, 30) }), (r) => r.items.map((a) => `${a.title}${a.price_text ? '  from ' + a.price_text : ''}${a.rating ? '  rating ' + a.rating : ''}\n  ${a.url}`).join('\n') || 'No results.');
    case 'restaurants': return print(await di.restaurants({ q: flags.q, area: flags.area, cuisine: flags.cuisine, book: !!flags.book, walkin: !!flags.walkin, offers: !!flags.offers, perPage: Math.min(limit, 30) }), (r) => r.items.map((x) => `${x.name} (${x.area})  ${x.price || ''}${x.rating ? '  rating ' + x.rating : ''}${x.bookable ? '  book a table' : ''}\n  ${x.url}`).join('\n') || 'No results.');
    case 'restaurant': return print(await di.restaurant(pos[0]), (x) => `${x.name}\n${x.url}`);
    case 'destinations': return print(await di.destinations(), (d) => d.regions.map((r) => `${r.name} (${r.path}): ${(r.places || []).map((p) => p.name).join(', ')}`).join('\n'));
    case 'destination': return print(await di.destination(pos[0] || ''), (d) => `${d.name}\n${d.intro || ''}`);
    case 'esim': return print(await di.esim(), (e) => e.providers.map((p) => `${p.name}: ` + p.plans.map((x) => `${x.gb ? x.gb + 'GB' : 'Unlimited'}/${x.days}d $${x.price}`).join(', ')).join('\n') + '\n' + e.note);
    default: throw new DailyIndonesiaError(`Unknown command "${cmd}". Run dailyindonesia --help`);
  }
}
main().catch((e) => { console.error(e instanceof DailyIndonesiaError ? 'Error: ' + e.message : e); process.exit(1); });

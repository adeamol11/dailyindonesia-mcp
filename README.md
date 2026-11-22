# DailyIndonesia MCP server, CLI and SDK

Indonesia travel data for apps and AI agents, from [DailyIndonesia](https://dailyindonesia.com):

- live arrivals and departures at Indonesian airports (Bali, Jakarta, Surabaya, Lombok and more);
- things to do with prices (tours, tickets, day trips);
- restaurants, with table booking where the restaurant offers it;
- destination guides;
- Indonesia eSIM plans (Airalo, Saily).

Everything is free and read-only, and no API key is needed.

- **MCP server (remote):** `https://dailyindonesia.com/mcp` (Streamable HTTP, no sign-in)
- **REST API:** described at [`https://dailyindonesia.com/openapi.json`](https://dailyindonesia.com/openapi.json) (OpenAPI 3.1)
- **Docs:** [dailyindonesia.com/developers](https://dailyindonesia.com/developers/)
- **Site guide for AI assistants:** [dailyindonesia.com/llms.txt](https://dailyindonesia.com/llms.txt)

## Use it in an AI assistant (MCP)

Clients that support remote servers (Claude, ChatGPT, Cursor, VS Code and others):

```json
{ "mcpServers": { "dailyindonesia": { "type": "http", "url": "https://dailyindonesia.com/mcp" } } }
```

Clients that only start local servers can use the stdio bridge in this package:

```json
{ "mcpServers": { "dailyindonesia": { "command": "npx", "args": ["-y", "dailyindonesia-mcp"] } } }
```

### Tools

| Tool | What it does |
|---|---|
| `get_live_flights` | Arrivals or departures at an airport (e.g. `DPS`), or one flight (e.g. `GA 404`): times, status, terminal, gate, baggage belt |
| `list_airports` | Indonesian international airports and which have live boards |
| `search_things_to_do` | Tours, tickets and day trips by city or words, with from-prices and ratings |
| `search_restaurants` | Restaurants by area, cuisine or words; table booking, walk-in and offer filters |
| `get_restaurant` | One restaurant: address, hours, menu, rating, booking page |
| `list_destinations`, `get_destination` | Destination guides (e.g. `bali/ubud`) |
| `compare_esims` | Indonesia eSIM plans from Airalo and Saily |
| `read_page` | Any dailyindonesia.com page as Markdown |

## CLI

```sh
npx dailyindonesia-mcp            # MCP server over stdio
npm i -g dailyindonesia-mcp       # or install the CLI:
dailyindonesia flights DPS --arrivals
dailyindonesia flights CGK --flight GA404
dailyindonesia things ubud --q rafting
dailyindonesia restaurants --area seminyak --cuisine balinese --book
dailyindonesia esim
dailyindonesia --help
```

Add `--json` to any command for raw JSON.

## SDK (Node 18+)

```js
import { DailyIndonesia } from 'dailyindonesia-mcp';

const di = new DailyIndonesia();
const board = await di.board('DPS', 'arrivals');
console.log(board.arrivals.map((f) => `${f.flight} ${f.status_label}`));

const { items } = await di.restaurants({ area: 'ubud', book: true });
const things = await di.thingsToDo({ city: 'Ubud', q: 'temple' });
```

Methods: `airports()`, `board(iata, direction)`, `thingsToDo({ q, city, page, perPage })`,
`restaurants({ q, area, cuisine, book, walkin, offers, page, perPage })`, `restaurant(id)`,
`destinations()`, `destination(path)`, `esim()`. Errors throw `DailyIndonesiaError` with `code` and `status`.

## Good to know

- Flight boards are saved on a schedule (Bali every hour) and are not a complete daily schedule. Show the time the board was updated, and ask travellers to confirm with their airline.
- Each item has a `url` to its DailyIndonesia page. Please link to it: bookings are made with our partners through those pages and cost the traveller nothing extra.
- Rate limit: about 60 to 120 requests a minute per connection. Each answer has `RateLimit-*` headers, and HTTP 429 comes with a JSON error.

## Contact

[contact@dailyindonesia.com](mailto:contact@dailyindonesia.com) · [dailyindonesia.com](https://dailyindonesia.com)

MIT licence (this client package). The data belongs to DailyIndonesia and its partners.

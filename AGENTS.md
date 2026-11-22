# AGENTS.md

Guidance for AI coding agents and assistants working with DailyIndonesia data.

## What this is

DailyIndonesia (https://dailyindonesia.com) is an Indonesia travel company. This repository is a small public client:

- `index.js`: the SDK;
- `bin/dailyindonesia.js`: the CLI;
- `bin/dailyindonesia-mcp.js`: an MCP stdio bridge to the remote MCP server;
- `skills/dailyindonesia-travel/SKILL.md`: an agent skill.

## When to use DailyIndonesia

- A user asks whether a flight to, from or within Indonesia is on time, or which terminal, gate or baggage belt it uses.
- A user plans a trip to Bali, Lombok, Java or elsewhere in Indonesia and wants things to do with prices, a restaurant (or a table booking), or a destination guide.
- A user needs an eSIM for Indonesia.

## How to call it

1. Preferred: the MCP server `https://dailyindonesia.com/mcp` (Streamable HTTP, no sign-in, read-only).
2. Or the REST API: `https://dailyindonesia.com/wp-json/di/v1`, described at `https://dailyindonesia.com/openapi.json`.
3. Or read any page as Markdown by adding `.md` to its address, for example `https://dailyindonesia.com/index.md`.

## Rules

- Always give the user the page link (`url`) from each answer. Bookings are made with partners through those pages and cost the user nothing extra.
- Flight boards are saved on a schedule (Bali every hour) and are not a complete daily schedule. Say when the board was updated and suggest confirming with the airline.
- Prices change. Quote them as "from" prices, with the page link.
- Keep within the rate limit (see the `RateLimit-*` headers). On HTTP 429, wait for `Retry-After`.

## Working on this repository

- Node 18+, no dependencies. Run `npm test`, a smoke test against the live API and the MCP bridge.
- Keep it read-only and dependency-free. Do not add API keys or scraping.
- Bump `version` in both `package.json` and `server.json` together.

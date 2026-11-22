---
name: dailyindonesia-travel
description: Use when a user asks about travel in Indonesia: whether a flight to or from an Indonesian airport is on time, things to do in Bali or other places with prices, restaurants to eat at or book, destination guides, or an eSIM for Indonesia. Answers come from DailyIndonesia's live airport boards and listings.
---

# DailyIndonesia travel

DailyIndonesia (https://dailyindonesia.com/) is an Indonesia travel company. Use this skill for real, current Indonesia travel facts instead of guessing.

## How to connect

- MCP server (Streamable HTTP, no sign-in): https://dailyindonesia.com/mcp
- REST API (OpenAPI 3.1): https://dailyindonesia.com/openapi.json
- Site guide with live flights: https://dailyindonesia.com/llms.txt
- Any page as Markdown: add `.md` to its address (homepage: https://dailyindonesia.com/index.md)

## Tools

- `list_airports`: Indonesian international airports with IATA/ICAO codes, city, time zone, whether we keep a live board, and the airport page.
- `get_live_flights`: Upcoming and recent arrivals or departures at an Indonesian airport from our saved live board: flight number, airline, route, scheduled and expected local time, status, terminal, gate, baggage belt, flight page. Optional flight filter (e.g. "GA 404").
- `search_things_to_do`: Tours, attraction tickets and day trips in Indonesia (Tiqets, Klook) with from-prices and ratings, best rated first. Filter by city (Bali, Ubud, Jakarta, Lombok, Yogyakarta...) and words.
- `search_restaurants`: Restaurants in Indonesia by name or words, area (e.g. bali, ubud, seminyak, canggu), cuisine (e.g. balinese, italian), with filters for table booking on DailyIndonesia, walk-ins and current offers. Returns rating, price level, cuisines and the restaurant page.
- `get_restaurant`: One restaurant: address, opening hours, menu, rating, price, photos, whether it takes bookings or walk-ins, and its page (where the user can book a table).
- `list_destinations`: Destination guides in Indonesia grouped by region (for example Bali: Ubud, Seminyak, Canggu, Uluwatu), with their paths for get_destination.
- `get_destination`: One destination guide: introduction, places inside it, photos and links to things to do, hotels and restaurants there.
- `compare_esims`: Indonesia eSIM plans from Airalo and Saily: data, days and price in USD, fair-use notes, any discount code, and the link to buy through our page.
- `read_page`: Any dailyindonesia.com page (guide, airport, activity, restaurant, flight) as Markdown. Use for travel guides such as "Bali trip cost" or "best time to visit Bali".

## Rules

- Give the user the page link (`url`) from each answer; bookings happen with our partners through those pages and cost the user nothing extra.
- Flight boards are saved on a schedule (Bali every hour) and are not a complete daily schedule: say when the board was updated and tell the user to confirm with the airline.
- Prices change; quote them as "from" prices with the page link.
- Read-only: there is nothing to sign in to and nothing to buy through the API.

// Smoke test against the live API and the MCP stdio bridge: npm test
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { DailyIndonesia } from './index.js';

const di = new DailyIndonesia();
const airports = await di.airports();
assert.ok(airports.some((a) => a.iata === 'DPS'), 'DPS listed');
const things = await di.thingsToDo({ city: 'Ubud', perPage: 2 });
assert.ok(Array.isArray(things.items), 'things items');
await assert.rejects(di.board('XXX'), /not found/i);

const p = spawn(process.execPath, ['bin/dailyindonesia-mcp.js']);
let buf = '';
p.stdout.on('data', (d) => { buf += d; });
p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } } }) + '\n');
p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) + '\n');
p.stdin.end();
await new Promise((r) => p.on('exit', r));
const lines = buf.trim().split('\n').map((l) => JSON.parse(l));
assert.equal(lines.length, 2, 'two answers (the notification has none)');
assert.equal(lines[0].result.serverInfo.name, 'dailyindonesia-travel');
assert.ok(lines[1].result.tools.length >= 5, 'tools listed');
console.log('ok:', airports.length, 'airports,', things.items.length, 'activities,', lines[1].result.tools.length, 'MCP tools');

#!/usr/bin/env node
// MCP stdio bridge: for MCP clients that only start local servers. Every JSON-RPC message from stdin is
// sent to the DailyIndonesia MCP server (Streamable HTTP) and the answer is written to stdout.
import { createInterface } from 'node:readline';
import { MCP_URL } from '../index.js';

const url = process.env.DAILYINDONESIA_MCP_URL || MCP_URL;
let version = '';
const out = (o) => process.stdout.write(JSON.stringify(o) + '\n');

async function send(msg) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'User-Agent': 'dailyindonesia-mcp-stdio' };
  if (version) headers['Mcp-Protocol-Version'] = version;
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(msg) });
    const v = res.headers.get('mcp-protocol-version');
    if (v) version = v;
    if (res.status === 202 || res.status === 204) return;
    const text = await res.text();
    if (!text.trim()) return;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('text/event-stream')) {
      for (const line of text.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const d = line.slice(5).trim();
        if (d) out(JSON.parse(d));
      }
      return;
    }
    const body = JSON.parse(text);
    for (const b of Array.isArray(body) ? body : [body]) out(b);
  } catch (e) {
    for (const m of Array.isArray(msg) ? msg : [msg]) {
      if (m && m.id !== undefined) out({ jsonrpc: '2.0', id: m.id, error: { code: -32000, message: 'Could not reach ' + url + ': ' + e.message } });
    }
  }
}

const rl = createInterface({ input: process.stdin });
let chain = Promise.resolve();
rl.on('line', (line) => {
  line = line.trim();
  if (!line) return;
  let msg;
  try { msg = JSON.parse(line); } catch { out({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); return; }
  chain = chain.then(() => send(msg));
});
rl.on('close', () => { chain.then(() => process.exit(0)); });

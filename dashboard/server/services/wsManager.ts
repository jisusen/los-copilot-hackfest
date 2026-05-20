import type { ServerWebSocket } from 'bun';

const clients = new Set<ServerWebSocket<unknown>>();

export const wsManager = {
  add(ws: ServerWebSocket<unknown>) {
    clients.add(ws);
    console.log(`[WS] Client connected. Total: ${clients.size}`);
  },
  remove(ws: ServerWebSocket<unknown>) {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Total: ${clients.size}`);
  },
  broadcast(data: object) {
    const msg = JSON.stringify(data);
    for (const client of clients) {
      try { client.send(msg); } catch { clients.delete(client); }
    }
  },
  size() { return clients.size; },
};

import type { ServerWebSocket } from 'bun';
import { getAllAgentSessions } from '../db/dashboardDb';

const clients = new Set<ServerWebSocket<unknown>>();

function buildCompletePayload(appId: string, losData: any, memoDraft: any, completedAt: string) {
  const crde = losData.hasilCrde ?? {};
  const keuangan = losData.dataKeuangan ?? {};
  const slik = losData.slikOjk ?? {};
  const aml = losData.amlFraud ?? {};

  let dtiActual = 0;
  const dtiRaw = keuangan.dtiRatio ?? keuangan.dti_ratio ?? 0;
  if (typeof dtiRaw === 'string') {
    const parsed = parseFloat(dtiRaw.replace('%', ''));
    if (!isNaN(parsed)) dtiActual = parsed > 1 ? parsed / 100 : parsed;
  } else {
    dtiActual = Number(dtiRaw) > 1 ? Number(dtiRaw) / 100 : Number(dtiRaw);
  }

  return {
    type: 'agent:complete',
    appId,
    result: {
      riskScore: crde.riskScore ?? 'UNKNOWN',
      crdeDecision: crde.decision ?? 'UNKNOWN',
      dtiActual,
      slikKol: Number(slik.kolektibilitas ?? slik.collectibility ?? 1),
      amlClear: !(aml.pepStatus || aml.pep_status || aml.dttotMatch || aml.dttot_match),
      numericScore: Number(crde.numericScore ?? 0),
      rulesTriggered: Array.isArray(crde.rulesTriggered) ? crde.rulesTriggered : [],
      memoDraft,
    },
    elapsedMs: 0,
  };
}

export const wsManager = {
  add(ws: ServerWebSocket<unknown>) {
    clients.add(ws);
    console.log(`[WS] Client connected. Total: ${clients.size}`);

    // Replay completed sessions so the UI hydrates on page refresh / reconnect
    try {
      const sessions = getAllAgentSessions();
      for (const s of sessions) {
        ws.send(JSON.stringify(buildCompletePayload(s.appId, s.losData, s.memoDraft, s.completedAt)));
      }
      if (sessions.length > 0) {
        console.log(`[WS] Replayed ${sessions.length} completed session(s) to new client`);
      }
    } catch (e) {
      console.error('[WS] Failed to replay sessions:', e);
    }
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

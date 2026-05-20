import { randomUUID } from 'crypto';
import { sessionStore } from '../services/sessionStore';
import { wsManager } from '../services/wsManager';
import { getLosDb } from '../db/losClient';
import { getDecision, getAllDecisions } from '../db/dashboardDb';

const DECISION_TO_STATUS: Record<string, string> = {
  approve: 'Approved',
  reject: 'Rejected',
  cancel: 'Cancelled',
};

export async function handleDecisions(req: Request, pathname: string): Promise<Response | null> {
  const match = pathname.match(/^\/api\/decisions\/(APP-\d{3})$/);
  if (match && req.method === 'POST') {
    const appId = match[1];
    const body = await req.json() as { decision?: string; note?: string; analystId?: string };
    const { decision, note = '', analystId = 'analyst01' } = body;

    if (!decision || !['approve', 'reject', 'cancel'].includes(decision)) {
      return Response.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const decidedAt = new Date().toISOString();
    sessionStore.setDecision(appId, { decision, note, analystId, decidedAt });

    // Sync status back to LOS DB
    try {
      const newStatus = DECISION_TO_STATUS[decision];
      const { Database } = await import('bun:sqlite');
      const { join } = await import('path');
      const dbPath = process.env.DB_PATH ?? join(import.meta.dir, '../../data/los.db');
      const writableDb = new Database(dbPath);
      writableDb.query('UPDATE loan_applications SET status = ?, decided_at = datetime("now") WHERE id = ?').run(newStatus, appId);
      writableDb.close();
    } catch (e) {
      console.error('[decisions] Failed to sync status to LOS DB:', e);
    }

    wsManager.broadcast({
      type: 'agent:decided',
      appId,
      decision,
      analystId,
      decidedAt,
    });

    return Response.json({ ok: true, auditId: randomUUID() });
  }

  // GET /api/decisions — list all decisions
  if (pathname === '/api/decisions' && req.method === 'GET') {
    const decisions = getAllDecisions();
    return Response.json({ decisions });
  }

  // GET /api/decisions/:appId — get single decision
  const singleMatch = pathname.match(/^\/api\/decisions\/(APP-\d{3})$/);
  if (singleMatch && req.method === 'GET') {
    const appId = singleMatch[1];
    const decision = getDecision(appId);
    if (!decision) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ decision });
  }

  return null;
}

export async function handleSessions(req: Request, pathname: string): Promise<Response | null> {
  const match = pathname.match(/^\/api\/sessions\/(APP-\d{3})$/);
  if (!match || req.method !== 'GET') return null;

  const appId = match[1];
  const session = sessionStore.get(appId);
  if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

  return Response.json({ session });
}

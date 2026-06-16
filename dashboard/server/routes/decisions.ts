import { randomUUID } from 'crypto';
import { sessionStore } from '../services/sessionStore';
import { wsManager } from '../services/wsManager';
import { saveLoanNote, addAuditLog } from '../db/dashboardDb';

export async function handleDecisions(req: Request, pathname: string): Promise<Response | null> {
  const match = pathname.match(/^\/api\/decisions\/(APP-\d{3})$/);
  if (match && req.method === 'POST') {
    const appId = match[1];
    const body = await req.json() as { memo?: Record<string, string>; note?: string; analystId?: string };
    const { memo, note = '', analystId = 'analyst01' } = body;

    if (!memo) {
      return Response.json({ error: 'Memo content required' }, { status: 400 });
    }

    // Only the recommendation section + optional additional note in content
    const contentLines = [
      memo.executive_summary ?? memo.section8_rekomendasi ?? '',
      ...(note ? [`**Analyst Note:** ${note}`] : []),
    ].filter(Boolean);
    const content = contentLines.join('\n\n');

    // Save memo as agent note in LOS loan_notes table (shared SQLite DB)
    const memoJson = JSON.stringify(memo);
    saveLoanNote(appId, 'Copilot Analyst', 'agent', content, memoJson);

    addAuditLog(appId, body.analystId ?? 'system', 'MEMO_SUBMITTED', `Memo submitted with recommendation. Additional note: ${note || '(none)'}`);

    wsManager.broadcast({
      type: 'agent:decided',
      appId,
      decision: 'memo_submitted',
      analystId,
      decidedAt: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  }

  // GET /api/decisions — list all decisions
  if (pathname === '/api/decisions' && req.method === 'GET') {
    const { getAllDecisions } = await import('../db/dashboardDb');
    const decisions = getAllDecisions();
    return Response.json({ decisions });
  }

  // GET /api/decisions/:appId — get single decision
  const singleMatch = pathname.match(/^\/api\/decisions\/(APP-\d{3})$/);
  if (singleMatch && req.method === 'GET') {
    const { getDecision } = await import('../db/dashboardDb');
    const appId = singleMatch[1];
    const decision = getDecision(appId);
    if (!decision) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ decision });
  }

  return null;
}

export async function handleSessions(req: Request, pathname: string): Promise<Response | null> {
  const match = pathname.match(/^\/api\/sessions\/(APP-\d{3})$/);
  if (match) {
    const appId = match[1];

    // DELETE /api/sessions/APP-XXX — reset a ready/reviewed session so it can be run again
    if (req.method === 'DELETE') {
      sessionStore.delete(appId);
      wsManager.broadcast({ type: 'agent:reset', appId });
      return Response.json({ ok: true });
    }

    // GET /api/sessions/APP-XXX
    if (req.method === 'GET') {
      const session = sessionStore.get(appId);
      if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });
      return Response.json({ session });
    }
  }

  return null;
}
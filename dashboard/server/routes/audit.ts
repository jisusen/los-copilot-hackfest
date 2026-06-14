import { getDashboardDb, addAuditLog } from '../db/dashboardDb';

export async function handleAudit(req: Request, url: URL): Promise<Response | null> {
  const db = getDashboardDb();

  // POST /api/audit — log a new audit event
  if (req.method === 'POST') {
    const body = await req.json() as {
      appId: string;
      action: string;
      actor?: string;
      detail?: string;
    };
    if (!body.appId || !body.action) {
      return Response.json({ error: 'appId and action are required' }, { status: 400 });
    }
    addAuditLog(body.appId, body.actor ?? 'system', body.action, body.detail ?? '');
    return Response.json({ ok: true });
  }

  // GET /api/audit — fetch audit logs
  if (req.method === 'GET') {
    const appId = url.searchParams.get('appId');

    let rows: any[];
    if (appId) {
      rows = db.query(
        `SELECT a.*, COALESCE(d.full_name, '') as debtor_name
         FROM audit_logs a
         LEFT JOIN loan_applications la ON la.id = a.app_id
         LEFT JOIN debtors d ON d.loan_id = la.id
         WHERE a.app_id = ?
         ORDER BY a.created_at DESC`
      ).all(appId) as any[];
    } else {
      rows = db.query(
        `SELECT a.*, COALESCE(d.full_name, '') as debtor_name
         FROM audit_logs a
         LEFT JOIN loan_applications la ON la.id = a.app_id
         LEFT JOIN debtors d ON d.loan_id = la.id
         ORDER BY a.created_at DESC
         LIMIT 500`
      ).all() as any[];
    }

    return Response.json({
      audit: rows.map((r: any) => ({
        id: String(r.id),
        appId: r.app_id,
        action: r.action,
        actor: r.actor,
        details: r.detail ?? '',
        debtorName: r.debtor_name ?? '',
        timestamp: r.created_at,
      })),
    });
  }

  return null;
}

import { getDb } from '../db/client';

const VALID_STATUSES = ['Under Review', 'Approved', 'Rejected', 'Cancelled'];

export async function handleLoans(req: Request, pathname: string, url: URL): Promise<Response | null> {
  // PATCH /api/loans/:id/status — manual stage change
  const patchMatch = pathname.match(/^\/api\/loans\/(APP-\d{3})\/status$/);
  if (patchMatch && req.method === 'PATCH') {
    const id = patchMatch[1];
    const body = await req.json() as { status?: string; analystId?: string };
    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }
    const db = getDb();
    const isTerminal = ['Approved', 'Rejected', 'Cancelled'].includes(body.status);
    if (body.analystId) {
      if (isTerminal) {
        db.query('UPDATE loan_applications SET status = ?, analyst_id = ?, assigned_at = datetime("now"), decided_at = datetime("now") WHERE id = ?').run(body.status, body.analystId, id);
      } else {
        db.query('UPDATE loan_applications SET status = ?, analyst_id = ?, assigned_at = datetime("now") WHERE id = ?').run(body.status, body.analystId, id);
      }
    } else {
      if (isTerminal) {
        db.query('UPDATE loan_applications SET status = ?, decided_at = datetime("now") WHERE id = ?').run(body.status, id);
      } else {
        db.query('UPDATE loan_applications SET status = ? WHERE id = ?').run(body.status, id);
      }
    }
    return Response.json({ ok: true });
  }

  // POST /api/loans/:id/assign — auto-assign on open
  const assignMatch = pathname.match(/^\/api\/loans\/(APP-\d{3})\/assign$/);
  if (assignMatch && req.method === 'POST') {
    const id = assignMatch[1];
    const body = await req.json() as { analystId?: string };
    const analystId = body.analystId ?? 'analyst01';
    const db = getDb();
    db.query('UPDATE loan_applications SET analyst_id = ?, assigned_at = datetime("now"), status = ? WHERE id = ? AND (analyst_id IS NULL OR analyst_id = ?)').run(analystId, 'Under Review', id, analystId);
    const app = db.query('SELECT analyst_id, assigned_at FROM loan_applications WHERE id = ?').get(id);
    return Response.json({ ok: true, assigned: app });
  }

  // GET or POST /api/loans/:id/notes
  const notesMatch = pathname.match(/^\/api\/loans\/(APP-\d{3})\/notes$/);
  if (notesMatch) {
    const id = notesMatch[1];
    const db = getDb();
    if (req.method === 'GET') {
      const notes = db.query('SELECT * FROM loan_notes WHERE app_id = ? ORDER BY created_at ASC').all(id);
      return Response.json({ notes });
    }
    if (req.method === 'POST') {
      const body = await req.json() as { content?: string; author?: string };
      if (!body.content?.trim()) return Response.json({ error: 'content required' }, { status: 400 });
      db.query('INSERT INTO loan_notes (app_id, author, author_type, content, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(id, body.author ?? 'analyst01', 'manual', body.content.trim(), new Date().toISOString());
      return Response.json({ ok: true });
    }
  }

  if (req.method !== 'GET') return null;

  if (pathname === '/api/loans') {
    const status = url.searchParams.get('status') ?? '';
    const product = url.searchParams.get('product') ?? '';
    const search = url.searchParams.get('search') ?? '';

    const db = getDb();
    let query = `
      SELECT
        a.id, a.status, a.created_at, a.product_type, a.amount_requested, a.tenor_months,
        a.analyst_id,
        d.full_name as debtor_name,
        c.decision as crde_decision, c.risk_score
      FROM loan_applications a
      JOIN debtors d ON d.loan_id = a.id
      LEFT JOIN crde_results c ON c.loan_id = a.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (product) {
      query += ' AND a.product_type = ?';
      params.push(product);
    }
    if (search) {
      query += ' AND (d.full_name LIKE ? OR d.nik LIKE ? OR a.id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY a.created_at DESC';

    const loans = db.query(query).all(...params);
    const total = (loans as unknown[]).length;

    return Response.json({ loans, total });
  }

  const detailMatch = pathname.match(/^\/api\/loans\/(APP-\d{3})$/);
  if (detailMatch) {
    const id = detailMatch[1];
    const db = getDb();

    const application = db.query('SELECT * FROM loan_applications WHERE id = ?').get(id);
    if (!application) return Response.json({ error: 'Not found' }, { status: 404 });

    const debtor = db.query('SELECT * FROM debtors WHERE loan_id = ?').get(id);
    const financials = db.query('SELECT * FROM financials WHERE loan_id = ?').get(id);
    const slik = db.query('SELECT * FROM slik_ojk WHERE loan_id = ?').get(id);
    const amlFraud = db.query('SELECT * FROM aml_fraud WHERE loan_id = ?').get(id);
    const crde = db.query('SELECT * FROM crde_results WHERE loan_id = ?').get(id) as Record<string, unknown> | null;
    const collateral = db.query('SELECT * FROM collaterals WHERE loan_id = ?').get(id);

    if (crde && typeof crde.rules_triggered === 'string') {
      try {
        crde.rules_triggered = JSON.parse(crde.rules_triggered as string);
      } catch {
        crde.rules_triggered = [];
      }
    }

    return Response.json({ loan: { application, debtor, financials, slik, amlFraud, crde, collateral } });
  }

  // GET /api/loans/:id/audit — audit trail
  const auditMatch = pathname.match(/^\/api\/loans\/(APP-\d{3})\/audit$/);
  if (auditMatch && req.method === 'GET') {
    const id = auditMatch[1];
    const db = getDb();
    const logs = db.query('SELECT * FROM audit_logs WHERE app_id = ? ORDER BY created_at ASC').all(id);
    return Response.json({ logs });
  }

  return null;
}

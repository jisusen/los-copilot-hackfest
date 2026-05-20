import { getLosDb } from '../db/losClient';

export function handleLoans(req: Request, url: URL): Response | null {
  if (req.method !== 'GET') return null;

  const db = getLosDb();
  const status = url.searchParams.get('status') ?? '';

  let query = `
    SELECT
      a.id, a.status, a.created_at, a.product_type, a.amount_requested, a.tenor_months,
      d.full_name as debtor_name,
      c.decision as crde_decision, c.risk_score, c.numeric_score
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

  query += ' ORDER BY a.created_at DESC';

  const loans = db.query(query).all(...params);
  return Response.json({ loans, total: (loans as unknown[]).length });
}

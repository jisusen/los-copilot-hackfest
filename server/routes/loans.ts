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
    try {
      const actionName = isTerminal ? `DECISION_${body.status.toUpperCase()}` : `STATUS_CHANGED_${body.status.toUpperCase().replace(/\s+/g, '_')}`;
      db.query('INSERT INTO audit_logs (app_id, actor, action, detail, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(id, body.analystId ?? 'system', actionName, `Status changed to ${body.status}`, new Date().toISOString());
    } catch {}
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
    try {
      db.query('INSERT INTO audit_logs (app_id, actor, action, detail, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(id, analystId, 'ASSIGNED', `Application assigned to ${analystId}`, new Date().toISOString());
    } catch {}
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
      const body = await req.json() as { content?: string; author?: string; category?: string };
      if (!body.content?.trim()) return Response.json({ error: 'content required' }, { status: 400 });
      const author = body.author ?? 'analyst01';
      db.query('INSERT INTO loan_notes (app_id, author, author_type, content, category, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, author, 'manual', body.content.trim(), body.category ?? 'General', new Date().toISOString());
      try {
        db.query('INSERT INTO audit_logs (app_id, actor, action, detail, created_at) VALUES (?, ?, ?, ?, ?)')
          .run(id, author, 'NOTE_ADDED', `Note added: ${body.content.trim().substring(0, 100)}`, new Date().toISOString());
      } catch {}
      return Response.json({ ok: true });
    }
  }

  // DELETE /api/loans/:id/notes/:noteId
  const deleteNoteMatch = pathname.match(/^\/api\/loans\/(APP-\d{3})\/notes\/(\d+)$/);
  if (deleteNoteMatch && req.method === 'DELETE') {
    const [, id, noteId] = deleteNoteMatch;
    const db = getDb();
    db.query('DELETE FROM loan_notes WHERE id = ? AND app_id = ?').run(noteId, id);
    return Response.json({ ok: true });
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

    // Synthetic enrichments for demo complexity
    const f = financials as Record<string, unknown> | null;
    const netIncome = typeof f?.net_income === 'number' ? f.net_income : 5000000;
    const requested = typeof f?.requested_installment === 'number' ? f.requested_installment : 3000000;
    const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const baseBal = netIncome * (2 + (seed % 5) * 0.5);

    const cities = ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara', 'Bandung', 'Surabaya', 'Tangerang', 'Bekasi', 'Depok'];
    const subdistricts = ['Menteng', 'Kebayoran Baru', 'Setiabudi', 'Tanah Abang', 'Senayan', 'Pondok Indah', 'Kemang', 'Cilandak', 'Pancoran', 'Tebet'];
    const districts = ['Kebayoran Lama', 'Kebayoran Baru', 'Pasar Minggu', 'Cilandak', 'Pesanggrahan', 'Setiabudi', 'Menteng', 'Tebet', 'Mampang', 'Pancoran'];
    const education = ['S1', 'S2', 'SMA', 'S3', 'D3', 'SMA', 'S1', 'S1', 'S2', 'D3'];
    const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Islam', 'Islam', 'Kristen', 'Islam', 'Katolik'];
    const genders = ['Laki-laki', 'Perempuan', 'Laki-laki', 'Laki-laki', 'Perempuan', 'Laki-laki', 'Perempuan', 'Laki-laki', 'Perempuan', 'Laki-laki'];
    const homeStatus = ['Milik Sendiri', 'Sewa', 'Keluarga', 'Milik Sendiri', 'Milik Sendiri', 'Sewa', 'Milik Sendiri', 'Keluarga', 'Sewa', 'Milik Sendiri'];
    const refSources = ['Digital', 'Walk-in', 'Agent', 'Digital', 'Walk-in', 'Digital', 'Agent', 'Walk-in', 'Digital', 'Agent'];
    const products = ['KTA', 'KPR', 'KKB', 'Multiguna'];

    const d = debtor as Record<string, unknown> | null;
    const app = application as Record<string, unknown> | null;
    const loanAmount = typeof app?.amount_requested === 'number' ? app.amount_requested : 50000000;
    const product = typeof app?.product_type === 'string' ? app.product_type : 'KTA';
    const cityIdx = seed % cities.length;

    const enrichedDebtor = d ? {
      ...d,
      tempat_lahir: cities[(seed + 3) % cities.length],
      jenis_kelamin: genders[seed % genders.length],
      agama: religions[seed % religions.length],
      pendidikan_terakhir: education[seed % education.length],
      nama_ibu_kandung: `Ibu ${d.full_name ?? 'Kandung'}`,
      kewarganegaraan: 'WNI',
      kode_pos: `${10000 + (seed % 90000)}`,
      kelurahan: subdistricts[seed % subdistricts.length],
      kecamatan: districts[seed % districts.length],
      rt_rw: `00${(seed % 9) + 1}/00${(seed + 3) % 9 + 1}`,
      masa_berlaku_ktp: `20${25 + (seed % 10)}-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}`,
      status_rumah: homeStatus[seed % homeStatus.length],
      lama_tinggal: `${2 + (seed % 20)} years`,
      tagihan_bulanan: Math.round(netIncome * (0.05 + (seed % 5) * 0.02)),
    } : null;

    const pepPositions = ['Komisaris Utama', 'Direktur Keuangan', 'Kepala Divisi Pengadaan', 'Anggota DPR', 'Walikota', 'Pejabat Eselon II', 'Komisaris Independen', 'Direktur Utama', 'Kepala Satuan Kerja', 'Anggota DPRD'];
    const pepSources = ['PEP Database PPATK', 'KPK LHKPN', 'Internal Screening', 'PEP Database PPATK', 'World Bank PEP List', 'PEP Database PPATK', 'KPK LHKPN', 'PEP Database PPATK', 'Internal Screening', 'PEP Database PPATK'];
    const pepCountries = ['Indonesia', 'Indonesia', 'Indonesia', 'Indonesia', 'Indonesia', 'Indonesia', 'Indonesia', 'Indonesia', 'Singapore', 'Malaysia'];
    const adverseDetails = ['Media mention: unnamed source linked to procurement case (2019)', 'Negative news: connected party in customs investigation', 'Media mention: family member named in graft probe (2020)', '—', '—', '—', '—', 'Adverse media: named in NGO corruption watchlist report', '—', '—'];
    const eddStatuses = ['Completed', 'Completed', 'Completed', 'N/A', 'N/A', 'In Progress', 'N/A', 'Completed', 'N/A', 'N/A'];
    const txBehaviorNotes = ['No anomalous pattern detected', 'No anomalous pattern detected', 'Large cash deposits flagged (reviewed, source verified)', 'No anomalous pattern detected', 'Frequent third-party transfers noted (under review)', 'No anomalous pattern detected', 'No anomalous pattern detected', 'No anomalous pattern detected', 'Unusual cross-border transaction pattern (reviewed)', 'No anomalous pattern detected'];
    const watchlistDetails = ['—', '—', '—', '—', '—', '—', '—', '—', 'Name variant match: PT GRM (false positive, cleared)', '—'];
    const screeningRefs = ['SCR-2025-000' + (seed % 9 + 1), 'SCR-2025-001' + (seed % 9 + 1), 'SCR-2025-002' + (seed % 9 + 1), 'SCR-2025-000' + (seed % 9 + 1), 'SCR-2025-001' + (seed % 9 + 1), 'SCR-2025-002' + (seed % 9 + 1), 'SCR-2025-000' + (seed % 9 + 1), 'SCR-2025-001' + (seed % 9 + 1), 'SCR-2025-002' + (seed % 9 + 1), 'SCR-2025-003' + (seed % 9 + 1)];

    const enrichedAmlFraud = amlFraud ? {
      ...(amlFraud as Record<string, unknown>),
      screening_reference_id: screeningRefs[seed % screeningRefs.length],
      screening_type: seed % 3 === 0 ? 'Batch (Daily)' : 'Real-time',
      data_source: 'PPATK SIPTV, UN Sanctions, DTTOT, World Bank',
      dttot_list_name: (amlFraud as Record<string, unknown>).dttot_match ? ['ABDUL MUKTI NASUTION', 'SITI NURHALIZA', 'BAMBANG SUTRISNO', 'RISTANTO PRABOWO'][seed % 4] : null,
      dttot_category: (amlFraud as Record<string, unknown>).dttot_match ? ['Terrorist Financing', 'Terrorist Financing', 'Terrorist Organization Affiliate', 'Terrorist Financing'][seed % 4] : null,
      dttot_match_date: (amlFraud as Record<string, unknown>).dttot_match ? `20${20 + (seed % 5)}-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}` : null,
      un_list_name: (amlFraud as Record<string, unknown>).un_sanctions_match ? ['MOHAMMED AL-HADI', 'ALI ABDULLAH SALEH', 'HO CHIH-MIN', 'SALIM RASHID'][seed % 4] : null,
      un_category: (amlFraud as Record<string, unknown>).un_sanctions_match ? ['UNSC 1267/1989', 'UNSC 2140', 'UNSC 1718', 'UNSC 1988'][seed % 4] : null,
      pep_position: pepPositions[seed % pepPositions.length],
      pep_country: pepCountries[seed % pepCountries.length],
      pep_scope: ['Nasional', 'Nasional', 'Nasional', 'Nasional', 'Nasional', 'Nasional', 'Nasional', 'Nasional', 'Internasional', 'Regional'][seed % 10],
      pep_source: pepSources[seed % pepSources.length],
      adverse_media_match: seed % 7 < 2 ? 1 : 0,
      adverse_media_count: seed % 7 < 2 ? 1 + (seed % 2) : 0,
      adverse_media_details: adverseDetails[seed % adverseDetails.length],
      edd_status: eddStatuses[seed % eddStatuses.length],
      edd_completed_date: eddStatuses[seed % eddStatuses.length] === 'Completed' ? `20${25}-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}` : null,
      edd_notes: eddStatuses[seed % eddStatuses.length] === 'Completed' ? 'All enhanced checks cleared.' : null,
      domestic_watchlist_match: seed % 8 === 0 ? 1 : 0,
      domestic_watchlist_detail: watchlistDetails[seed % watchlistDetails.length],
      tx_behavior_flagged: seed % 5 < 1 ? 1 : 0,
      tx_behavior_note: txBehaviorNotes[seed % txBehaviorNotes.length],
      overall_aml_score: [15, 20, 35, 8, 12, 55, 10, 40, 25, 60][seed % 10],
      overall_aml_verdict: ['Low Risk', 'Low Risk', 'Medium Risk', 'Low Risk', 'Low Risk', 'High Risk', 'Low Risk', 'Medium Risk', 'Low Risk', 'High Risk'][seed % 10],
      reviewed_by: ['Analyst Budi', 'Analyst Sari', 'Analyst Dimas', 'Analyst Budi', 'Analyst Rina', 'Analyst Dimas', 'Analyst Sari', 'Analyst Rina', 'Analyst Budi', 'Analyst Dimas'][seed % 10],
      review_date: `20${25}-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}`,
    } : null;

    const enrichedApplication = app ? {
      ...app,
      disbursement_date: `20${25}-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}`,
      disbursement_method: seed % 3 === 0 ? 'Tunai' : 'Transfer Rekening',
      repayment_account: `${String(100 + (seed % 900)).padStart(3, '0')}-${String(1000 + (seed % 9000))}`,
      repayment_method: seed % 2 === 0 ? 'Auto-debit (Rekening BMS)' : 'Auto-debit (Rekening Bank Lain)',
      insurance_required: product !== 'KTA' ? 'Yes' : 'No',
      insurance_type: product !== 'KTA' ? 'Jiwa Kredit + Kebakaran' : '—',
      provisi_fee: `${(0.5 + (seed % 5) * 0.25).toFixed(2)}%`,
      admin_fee: Math.round(loanAmount * (0.005 + (seed % 3) * 0.003)),
      legal_docs_complete: seed % 5 === 0 ? 'In Progress' : 'Complete',
      credit_committee_date: null,
      special_rate: seed % 7 === 0 ? `${(9 + (seed % 3)).toFixed(2)}% p.a. (special promo)` : null,
      referral_source: refSources[seed % refSources.length],
    } : null;

    const financialsWithCasa = f ? {
      ...f,
      casa_avg_balance_3m: Math.round(baseBal * (0.9 + (seed % 3) * 0.05)),
      casa_avg_balance_6m: Math.round(baseBal * (1.1 + (seed % 4) * 0.08)),
      casa_avg_balance_12m: Math.round(baseBal * (1.3 + (seed % 5) * 0.1)),
      casa_tenure_months: 12 + (seed % 73),
      casa_funding_ratio: +(baseBal / requested).toFixed(2),
      past_loans: [
        { product: 'KTA', amount: 15000000 + (seed % 7) * 5000000, status: 'Paid', year: 2021 + (seed % 2), tenure_months: 12 + (seed % 13) },
        { product: 'KPR', amount: 150000000 + (seed % 5) * 50000000, status: 'Paid', year: 2018 + (seed % 3), tenure_months: 60 + (seed % 25) },
        { product: 'Multiguna', amount: 30000000 + (seed % 4) * 10000000, status: 'Paid', year: 2023, tenure_months: 24 + (seed % 13) },
      ].filter((_, i) => i < 1 + (seed % 3)),
    } : null;

    const kol = (slik as Record<string, unknown>)?.kolektibilitas ?? 1;
    const kolScore = typeof kol === 'number' ? kol : parseInt(String(kol), 10) || 1;
    const bankNames = ['Bank Central Asia', 'Bank Mandiri', 'Bank BNI', 'Bank CIMB Niaga', 'Bank Danamon', 'Bank Permata', 'Bank Panin', 'Bank OCBC NISP', 'Bank Mega', 'Bank BTN'];
    const facilityTypes = ['KTA (Unsecured)', 'Credit Card', 'Mortgage (KPR)', 'Working Capital (KKB)', 'Multiguna', 'Credit Card', 'KTA (Unsecured)', 'Mortgage (KPR)', 'Vehicle Loan (KKB)', 'Credit Card'];
    const kolOpts = ['1 - Current', '2 - Special Mention', '3 - Substandard', '4 - Doubtful', '5 - Loss'];

    const numFacilities = 1 + (seed % 4);
    const facilities = [];
    for (let i = 0; i < numFacilities; i++) {
      const fi = (seed + i * 3) % bankNames.length;
      const fKol = i === 0 ? kolScore : Math.max(1, kolScore - Math.floor(Math.random() * 2));
      facilities.push({
        bank: bankNames[(fi + 1) % bankNames.length],
        facility_type: facilityTypes[fi % facilityTypes.length],
        limit: Math.round(loanAmount * (0.1 + ((seed + i * 7) % 8) * 0.15)),
        outstanding: Math.round(loanAmount * (0.02 + ((seed + i * 11) % 6) * 0.08)),
        collectability: fKol,
        collectability_label: kolOpts[fKol - 1],
        open_date: `20${18 + (i % 5)}-${String((seed % 12) + 1).padStart(2, '0')}-01`,
        tenure_months: 12 + (i * 12),
      });
    }
    const totalLimit = facilities.reduce((s: number, f: { limit: number }) => s + f.limit, 0);
    const totalOutstanding = facilities.reduce((s: number, f: { outstanding: number }) => s + f.outstanding, 0);

    const historyGrid = [];
    const now = new Date(2025, 3, 15);
    for (let i = 0; i < 24; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (23 - i));
      let hKol: number, hLabel: string;
      const baseKol = kolScore;
      if (i < 18) {
        hKol = Math.max(1, baseKol - Math.floor(Math.random() * 2));
      } else {
        hKol = Math.min(5, baseKol + Math.floor(Math.random() * 2));
      }
      if (i < 6) { hKol = 1; }
      if (i >= 18 && i < 22 && seed % 3 < 2) { hKol = Math.max(1, baseKol); }
      hLabel = kolOpts[hKol - 1];
      historyGrid.push({
        period: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        collectability: hKol,
        collectability_label: hLabel,
      });
    }

    const inquiries = [
      { date: '2025-03-28', purpose: 'Credit Card Application', institution: 'Bank Central Asia', amount: '50,000,000' },
      { date: '2024-12-12', purpose: 'KTA Application', institution: 'Bank Mandiri', amount: '30,000,000' },
    ];
    if (seed % 3 === 0) {
      inquiries.push({ date: '2024-08-05', purpose: 'Mortgage Application', institution: 'Bank BNI', amount: '350,000,000' });
    }

    const slikScore = Math.min(900, Math.max(300, 750 - (kolScore - 1) * 100 - (seed % 3) * 30 + (seed % 2) * 20));

    const enrichedSlik = slik ? {
      ...(slik as Record<string, unknown>),
      slik_score: slikScore,
      slik_grade: slikScore >= 700 ? 'Low Risk' : slikScore >= 500 ? 'Medium Risk' : 'High Risk',
      facilities,
      total_facilities: numFacilities,
      total_limit: totalLimit,
      total_outstanding: totalOutstanding,
      credit_utilization_ratio: +(totalOutstanding / totalLimit).toFixed(4),
      payment_history_grid: historyGrid,
      id_verified: seed % 8 !== 0,
      id_verification_note: seed % 8 === 0 ? 'NIK mismatch — debtor name does not match SLIK database record' : 'NIK verified against SLIK database',
      last_inquiry_date: '2025-03-28',
      total_inquiries_last_12m: 2 + (seed % 2),
      inquiries,
      guaranteed_by: seed % 7 === 0 ? 'PT GRM (Affiliated Company)' : null,
    } : null;

    return Response.json({ loan: { application: enrichedApplication, debtor: enrichedDebtor, financials: financialsWithCasa, slik: enrichedSlik, amlFraud: enrichedAmlFraud, crde, collateral } });
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

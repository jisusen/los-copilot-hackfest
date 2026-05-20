// Additional flows: Decision Submit, Print Memo (A4), Disbursement, Mobile Detail

// ============ DECISION SUBMIT (modal-style screen) ============

function DecisionSubmit({ crdeState = 'approve' }) {
  const s = CRDE_STATES[crdeState];
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', position: 'relative' }}>
          {/* Faded background page */}
          <div style={{ opacity: 0.25, pointerEvents: 'none' }}>
            <DetailHeader crdeState={crdeState} />
            <TabBar tabs={TABS} active="Summary" />
            <div className="wf-fill" style={{ height: 280, marginTop: 4 }} />
          </div>
          {/* Modal */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,20,20,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="wf-box" style={{ width: 640, background: 'white', padding: 24 }}>
              <div className="wf-row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                <div className="wf-meta">Submit final decision</div>
                <div className="wf-tiny">×</div>
              </div>
              <div className="wf-h2" style={{ marginBottom: 4 }}>APP-001 · Budi Santoso</div>
              <div className="wf-tiny" style={{ marginBottom: 16 }}>KTA · Rp 50.000.000 · 24 mo</div>

              <div className="wf-fill" style={{ padding: 12, marginBottom: 16, borderLeft: `3px solid var(--wf-${s.pill === 'success' ? 'success' : s.pill === 'warn' ? 'warn' : 'danger'})` }}>
                <div className="wf-row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div className="wf-meta">CRDE Recommendation</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
                  </div>
                  <div className="wf-tiny wf-mono">Score {s.score}/1000 · {s.risk}</div>
                </div>
              </div>

              <div className="wf-h3" style={{ marginBottom: 8 }}>Your Decision</div>
              <div className="wf-row wf-gap-8" style={{ marginBottom: 16 }}>
                <div className="wf-btn wf-btn-primary" style={{ flex: 1 }}>✓ Approve</div>
                <div className="wf-btn" style={{ flex: 1 }}>↳ Refer to committee</div>
                <div className="wf-btn wf-btn-ghost" style={{ flex: 1 }}>✗ Reject</div>
              </div>

              <div className="wf-h3" style={{ marginBottom: 6 }}>Override CRDE?</div>
              <div className="wf-row wf-gap-8" style={{ marginBottom: 16 }}>
                <div className="wf-row wf-gap-6" style={{ fontSize: 12 }}><span className="wf-badge-sq" /> Following recommendation</div>
                <div className="wf-row wf-gap-6" style={{ fontSize: 12 }}><span className="wf-badge-sq" /> Overriding (justification required)</div>
              </div>

              <div className="wf-label" style={{ marginBottom: 4 }}>Analyst Note</div>
              <div className="wf-input" style={{ width: '100%', height: 72, alignItems: 'flex-start', paddingTop: 8, color: 'var(--wf-ink-3)' }}>
                Cleared all RAC checks. DTI well within KTA limit. Stable employment confirmed via slip + bank statement.
              </div>

              <div className="wf-row" style={{ marginTop: 8, fontSize: 11, color: 'var(--wf-ink-2)' }}>
                <span className="wf-badge-sq" /> &nbsp; I confirm I have reviewed all 8 tabs and supporting documents.
              </div>

              <div className="wf-row wf-gap-8" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
                <div className="wf-btn wf-btn-ghost">Save draft</div>
                <div className="wf-btn wf-btn-ghost">Cancel</div>
                <div className="wf-btn wf-btn-primary">Submit decision →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ DECISION CONFIRMATION ============

function DecisionConfirm() {
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div className="wf-box" style={{ width: 520, padding: 32, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, border: '2px solid var(--wf-success)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--wf-success)' }}>✓</div>
            <div className="wf-h2" style={{ marginBottom: 4 }}>Decision submitted</div>
            <div className="wf-tiny" style={{ marginBottom: 20 }}>APP-001 · Budi Santoso</div>
            <div className="wf-fill" style={{ padding: 12, textAlign: 'left', marginBottom: 16 }}>
              <div className="wf-row" style={{ justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="wf-label">Decision</span>
                <span className="wf-pill success">APPROVED</span>
              </div>
              <div className="wf-row" style={{ justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="wf-label">Reference</span>
                <span className="wf-mono">DEC-2026-04018-001</span>
              </div>
              <div className="wf-row" style={{ justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="wf-label">Submitted by</span>
                <span>analyst01</span>
              </div>
              <div className="wf-row" style={{ justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="wf-label">Timestamp</span>
                <span className="wf-mono">18 Apr 2026 · 14:08:42 WIB</span>
              </div>
            </div>
            <div className="wf-tiny" style={{ marginBottom: 20 }}>Disbursement queued · debtor will be notified within 1 business day.</div>
            <div className="wf-row wf-gap-8" style={{ justifyContent: 'center' }}>
              <div className="wf-btn wf-btn-ghost">📄 Print memo</div>
              <div className="wf-btn wf-btn-primary">Back to queue →</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ PRINT MEMO (A4) ============

function PrintMemo() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#d8d8d4', padding: 20, overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
      <div className="wf" style={{ width: 794, minHeight: 1123, padding: 60, background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div className="wf-row" style={{ justifyContent: 'space-between', borderBottom: '2px solid var(--wf-ink)', paddingBottom: 14, marginBottom: 20 }}>
          <div className="wf-row wf-gap-12">
            <div style={{ width: 44, height: 44, border: '1.5px solid var(--wf-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>BMS</div>
            <div>
              <div style={{ fontWeight: 700 }}>Bank Mitra Sejahtera</div>
              <div className="wf-tiny">Sistem Informasi Kredit Konsumer</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="wf-meta">Memo</div>
            <div className="wf-mono" style={{ fontSize: 11 }}>DEC-2026-04018-001</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="wf-h1" style={{ fontSize: 18, letterSpacing: '0.04em' }}>CONSUMER CREDIT ANALYSIS MEMO</div>
          <div className="wf-tiny" style={{ marginTop: 4 }}>For internal use only · Confidential</div>
        </div>

        {/* Meta block */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, fontSize: 11 }}>
          <div><strong>Application:</strong> APP-001</div>
          <div><strong>Date:</strong> 18 April 2026</div>
          <div><strong>Debtor:</strong> Budi Santoso</div>
          <div><strong>Branch:</strong> Cabang Jakarta Selatan</div>
          <div><strong>Product:</strong> KTA · Rp 50.000.000 · 24 mo</div>
          <div><strong>Analyst:</strong> analyst01</div>
        </div>

        {/* Decision banner */}
        <div className="wf-fill" style={{ padding: 12, marginBottom: 20, borderLeft: '3px solid var(--wf-success)' }}>
          <div className="wf-meta">Final Decision</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>APPROVED</div>
          <div className="wf-tiny" style={{ marginTop: 2 }}>CRDE recommendation: APPROVED · Risk LOW · Score 847/1000 · No rules triggered</div>
        </div>

        {/* Sections */}
        <div className="wf-h3" style={{ marginTop: 16, marginBottom: 6 }}>1. Executive Summary</div>
        <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0 }}>
          Budi Santoso applies for a Rp 50,000,000 KTA with 24-month tenor. Borrower presents stable employment (8y3m at PT Astra International Tbk) with verified gross income of Rp 18,500,000/month. DTI ratio of 28% is well within the KTA threshold of 40%. SLIK kolektibilitas is 1 (Lancar) with no late payments in the past 24 months. AML and PEP screening returned no matches. CRDE recommends approval with a score of 847/1000.
        </p>

        <div className="wf-h3" style={{ marginTop: 16, marginBottom: 6 }}>2. Financial Position</div>
        <table className="wf-table" style={{ marginBottom: 8 }}>
          <tbody>
            <tr><td>Gross income / month</td><td className="wf-mono" style={{ textAlign: 'right' }}>Rp 18.500.000</td></tr>
            <tr><td>Net income / month</td><td className="wf-mono" style={{ textAlign: 'right' }}>Rp 14.800.000</td></tr>
            <tr><td>Existing obligations</td><td className="wf-mono" style={{ textAlign: 'right' }}>Rp 2.100.000</td></tr>
            <tr><td>Requested installment</td><td className="wf-mono" style={{ textAlign: 'right' }}>Rp 2.000.000</td></tr>
            <tr><td><strong>DTI ratio</strong></td><td className="wf-mono" style={{ textAlign: 'right' }}><strong>28%</strong> (limit 40%)</td></tr>
          </tbody>
        </table>

        <div className="wf-h3" style={{ marginTop: 16, marginBottom: 6 }}>3. Credit History (SLIK OJK)</div>
        <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0 }}>
          Current kolektibilitas: 1 — Lancar. Worst kolektibilitas in past 12 months: 1. Existing facility: KTA at Bank Central Asia, outstanding Rp 15,000,000. Total existing obligations across all banks: Rp 15,000,000. No DTTOT or blacklist entries.
        </p>

        <div className="wf-h3" style={{ marginTop: 16, marginBottom: 6 }}>4. AML & Fraud Screening</div>
        <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0 }}>
          DTTOT, UN Sanctions, OFAC, and EU sanctions: no matches. PEP status: not a PEP. Income consistency: confirmed. Address verification: no flags. Document tampering: none detected. Cleared by BMS AML Engine v2.3 on 18 Apr 2026.
        </p>

        <div className="wf-h3" style={{ marginTop: 16, marginBottom: 6 }}>5. Analyst Recommendation</div>
        <p style={{ fontSize: 11, lineHeight: 1.6, margin: 0, marginBottom: 8 }}>
          The application meets all RAC criteria. I recommend <strong>APPROVAL</strong> at the requested terms. No additional verification required.
        </p>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 60 }}>
          <div>
            <div style={{ borderTop: '1px solid var(--wf-ink)', paddingTop: 6 }}>
              <div className="wf-tiny">Credit Analyst</div>
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>analyst01</div>
              <div className="wf-tiny">Date: 18 April 2026</div>
            </div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid var(--wf-ink)', paddingTop: 6 }}>
              <div className="wf-tiny">Supervisor</div>
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>—</div>
              <div className="wf-tiny">Date: —</div>
            </div>
          </div>
        </div>

        <div className="wf-tiny" style={{ marginTop: 40, textAlign: 'center' }}>BMS-CONS-MEMO-2026-001 · Page 1 of 1 · Generated 18 Apr 2026 14:08 WIB</div>
      </div>
    </div>
  );
}

// ============ DISBURSEMENT FLOW ============

// Step 1: Disbursement Queue
function DisbursementQueue() {
  const rows = [
    ['DSB-2026-0142', 'APP-001', 'Budi Santoso',  'KTA',       'Rp 50.000.000',   'Approved', 'Today',     'Pending'],
    ['DSB-2026-0141', 'APP-006', 'Rina Susanti',  'KTA',       'Rp 25.000.000',   'Approved', 'Today',     'Pending'],
    ['DSB-2026-0140', 'APP-003', 'Ahmad Fauzi',   'KPR',       'Rp 500.000.000',  'Approved', 'Yesterday', 'Doc check'],
    ['DSB-2026-0139', 'APP-005', 'Rudi Hartono',  'KKB',       'Rp 150.000.000',  'Approved', 'Yesterday', 'Disbursed'],
    ['DSB-2026-0138', 'APP-009', 'Doni Pratama',  'KPR',       'Rp 800.000.000',  'Approved', '2d ago',    'Disbursed'],
    ['DSB-2026-0137', 'APP-002', 'Siti Rahayu',   'KTA',       'Rp 30.000.000',   'Approved', '3d ago',    'Disbursed'],
  ];
  const statusPill = (s) => {
    if (s === 'Pending') return <span className="wf-pill warn">{s}</span>;
    if (s === 'Doc check') return <span className="wf-pill">{s}</span>;
    if (s === 'Disbursed') return <span className="wf-pill success">{s}</span>;
    return <span className="wf-pill">{s}</span>;
  };
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="disb" />
        <div className="wf-content" style={{ overflow: 'auto' }}>
          <PageHead
            title="Disbursement Queue"
            sub="6 approved applications · 2 awaiting disbursement"
            agentTrace="agent active · processing DSB-2026-0142"
            right={<div className="wf-row wf-gap-8">
              <div className="wf-btn wf-btn-ghost">Export</div>
              <div className="wf-btn wf-btn-primary">Run batch disbursement →</div>
            </div>}
          />
          <div className="wf-row wf-gap-12" style={{ marginBottom: 16 }}>
            {[['Awaiting','2'],['Doc check','1'],['Disbursed today','3'],['Total volume','Rp 1.555M']].map(([l,v])=>(
              <div key={l} className="wf-fill" style={{ flex: 1, padding: 12 }}>
                <div className="wf-label">{l}</div>
                <div style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="wf-row wf-gap-8" style={{ marginBottom: 12 }}>
            <div className="wf-input" style={{ width: 240 }}>🔍 Search disbursement…</div>
            <div className="wf-input" style={{ width: 140 }}>Status: All ▾</div>
            <div className="wf-input" style={{ width: 140 }}>Date: Today ▾</div>
          </div>
          <table className="wf-table">
            <thead><tr>
              <th>Disbursement ID</th><th>App</th><th>Debtor</th><th>Product</th><th>Amount</th><th>Decision</th><th>Approved</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={i % 2 ? 'zebra' : ''}>
                  <td className="wf-mono">{r[0]}</td>
                  <td className="wf-mono">{r[1]}</td>
                  <td style={{ fontWeight: 500 }}>{r[2]}</td>
                  <td><span className="wf-pill">{r[3]}</span></td>
                  <td className="wf-mono">{r[4]}</td>
                  <td><span className="wf-pill success">{r[5]}</span></td>
                  <td>{r[6]}</td>
                  <td>{statusPill(r[7])}</td>
                  <td><span style={{ fontSize: 11, color: 'var(--wf-accent)', cursor: 'pointer' }}>Open ›</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Step 2: Disbursement Detail
function DisbursementDetail() {
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="disb" />
        <div className="wf-content" style={{ overflow: 'auto' }}>
          <div className="wf-row wf-gap-12" style={{ marginBottom: 4 }}>
            <span className="wf-tiny">‹ Back</span>
            <span className="wf-mono wf-tiny">DSB-2026-0142</span>
            <span className="wf-tiny">·</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Budi Santoso</span>
            <span className="wf-tiny">·</span>
            <span className="wf-tiny">KTA · Rp 50.000.000</span>
            <span className="wf-grow" />
            <span className="wf-pill warn">Pending disbursement</span>
          </div>
          <div style={{ marginBottom: 16 }}><AgentTrace>agent · awaiting analyst confirm · 14:09</AgentTrace></div>

          {/* Stepper */}
          <div className="wf-row wf-gap-12" style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--wf-bg-2)', border: '1px solid var(--wf-line)' }}>
            {[
              ['Approved',     'success'],
              ['Doc check',    'success'],
              ['Pre-disburse', 'warn'],
              ['Transfer',     null],
              ['Confirmed',    null],
            ].map(([l, c], i, arr) => (
              <React.Fragment key={l}>
                <div className="wf-row wf-gap-6" style={{ flex: 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid var(--wf-line-strong)', background: c === 'success' ? 'var(--wf-success)' : c === 'warn' ? 'var(--wf-warn)' : 'white', color: c ? 'white' : 'var(--wf-ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{i + 1}</div>
                  <span style={{ fontSize: 12, fontWeight: c ? 600 : 400, color: c ? 'var(--wf-ink)' : 'var(--wf-ink-3)' }}>{l}</span>
                </div>
                {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: 'var(--wf-line)' }} />}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
            <div>
              <div className="wf-h3" style={{ marginBottom: 12 }}>Disbursement Details</div>
              <FieldGrid rows={[
                ['Application',        <span className="wf-mono">APP-001</span>],
                ['Debtor',             'Budi Santoso'],
                ['Product',            'KTA · Unsecured'],
                ['Approved Amount',    <span className="wf-mono">Rp 50.000.000</span>],
                ['Provision Fee',      <span className="wf-mono">Rp 500.000 (1%)</span>],
                ['Admin Fee',          <span className="wf-mono">Rp 100.000</span>],
                ['Net Disbursement',   <span className="wf-mono" style={{ fontWeight: 600 }}>Rp 49.400.000</span>],
                ['First Installment',  '15 May 2026'],
              ]} />

              <div className="wf-h3" style={{ marginTop: 24, marginBottom: 12 }}>Beneficiary Account</div>
              <FieldGrid rows={[
                ['Bank',               'Bank Mitra Sejahtera (BMS)'],
                ['Account No.',        <span className="wf-mono">1234-567-890</span>],
                ['Account Name',       'BUDI SANTOSO'],
                ['Verified',           <span className="wf-pill success">✓ Match (name + NIK)</span>],
              ]} />
            </div>
            <div className="wf-stack" style={{ gap: 16 }}>
              <div className="wf-h3">Pre-disbursement Checks</div>
              <div className="wf-stack" style={{ gap: 6 }}>
                {[
                  ['Loan agreement signed', 'success'],
                  ['Account validated', 'success'],
                  ['Insurance bound', 'success'],
                  ['Tax forms collected', 'success'],
                  ['Final supervisor sign-off', 'warn'],
                ].map(([l, c]) => (
                  <div key={l} className="wf-row" style={{ padding: '8px 10px', background: 'var(--wf-bg-2)', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12 }}>{l}</span>
                    <span className={`wf-pill ${c}`}>{c === 'success' ? '✓ Done' : 'Awaiting'}</span>
                  </div>
                ))}
              </div>

              <div className="wf-h3" style={{ marginTop: 8 }}>Actions</div>
              <div className="wf-stack" style={{ gap: 8 }}>
                <div className="wf-btn wf-btn-primary">Release funds →</div>
                <div className="wf-btn">Request supervisor approval</div>
                <div className="wf-btn wf-btn-ghost">Hold disbursement</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MOBILE DETAIL VIEW ============

function MobileDetail({ crdeState = 'approve', amlBanner = false }) {
  const s = CRDE_STATES[crdeState];
  return (
    <div style={{ width: '100%', height: '100%', background: '#f0eee9', padding: 16, display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
      <div className="wf" style={{ width: 390, height: 'auto', minHeight: 760, border: '1px solid var(--wf-line-strong)', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile topbar */}
        <div style={{ height: 52, padding: '0 14px', borderBottom: '1px solid var(--wf-line-strong)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>‹</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>APP-001</span>
          <span className="wf-grow" />
          <span style={{ fontSize: 18 }}>⋯</span>
        </div>

        <div style={{ padding: 14, flex: 1 }}>
          {/* Header card */}
          <div className="wf-fill" style={{ padding: 12, marginBottom: 12 }}>
            <div className="wf-row" style={{ justifyContent: 'space-between' }}>
              <span className="wf-mono wf-tiny">APP-001 · KTA</span>
              <span className="wf-pill warn">In Review</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>Budi Santoso</div>
            <div className="wf-tiny">Rp 50.000.000 · 24 mo · 10.5% p.a.</div>
            <div style={{ marginTop: 8 }}><AgentTrace>agent · 14:02:19</AgentTrace></div>
          </div>

          {amlBanner && (
            <div className="wf-box" style={{ borderColor: 'var(--wf-danger)', background: 'var(--wf-danger-bg)', padding: 10, marginBottom: 12, fontSize: 11, color: 'var(--wf-danger)' }}>
              ⚠ <strong>PEP flag.</strong> Manual review required.
            </div>
          )}

          {/* Verdict */}
          <div className="wf-fill" style={{ padding: 14, marginBottom: 12, background: `var(--wf-${s.pill}-bg)`, borderColor: `var(--wf-${s.pill === 'success' ? 'success' : s.pill === 'warn' ? 'warn' : 'danger'})` }}>
            <div className="wf-meta">CRDE</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
            <div className="wf-tiny" style={{ marginTop: 4 }}>{s.risk} · {s.score}/1000</div>
          </div>

          {/* Mini-KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[['DTI', '28%'], ['SLIK', 'Kol 1'], ['AML', 'Clear'], ['Fraud', 'None']].map(([l, v]) => (
              <div key={l} className="wf-fill" style={{ padding: 10 }}>
                <div className="wf-label" style={{ fontSize: 9 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Mobile tabs (segmented) */}
          <div className="wf-row" style={{ overflow: 'auto', gap: 6, marginBottom: 12, paddingBottom: 4 }}>
            {['Summary', 'Profile', 'Financials', 'SLIK', 'AML', 'CRDE', 'Loan'].map((t, i) => (
              <span key={t} className={`wf-pill ${i === 0 ? 'accent' : ''}`} style={{ flex: 'none' }}>{t}</span>
            ))}
          </div>

          {/* Borrower snapshot */}
          <div className="wf-h3" style={{ marginBottom: 6 }}>Borrower</div>
          <div className="wf-stack" style={{ gap: 0, marginBottom: 12 }}>
            {[['Name', 'Budi Santoso'], ['NIK', '3174051203850003'], ['Employer', 'PT Astra Int. Tbk'], ['Tenure', '8y 3m']].map(([l, v]) => (
              <div key={l} className="wf-row" style={{ padding: '6px 0', borderBottom: '1px solid var(--wf-line)', justifyContent: 'space-between' }}>
                <span className="wf-label" style={{ fontSize: 10 }}>{l}</span>
                <span style={{ fontSize: 12 }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="wf-h3" style={{ marginBottom: 6 }}>Compliance</div>
          <div className="wf-row" style={{ flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
            {['DTI', 'SLIK', 'AML', 'PEP', 'DTTOT', 'Fraud', 'Income'].map(c => (
              <span key={c} className="wf-pill success" style={{ fontSize: 10 }}>✓ {c}</span>
            ))}
          </div>
        </div>

        {/* Sticky bottom action bar */}
        <div style={{ borderTop: '1px solid var(--wf-line-strong)', padding: 12, background: 'white', display: 'flex', gap: 8 }}>
          <div className="wf-btn wf-btn-ghost" style={{ flex: 1 }}>Reject</div>
          <div className="wf-btn" style={{ flex: 1 }}>Refer</div>
          <div className="wf-btn wf-btn-primary" style={{ flex: 1.4 }}>Approve →</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DecisionSubmit, DecisionConfirm, PrintMemo, DisbursementQueue, DisbursementDetail, MobileDetail });

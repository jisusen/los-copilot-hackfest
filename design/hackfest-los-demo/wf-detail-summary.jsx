// Detail header + tab shell variations + Summary tab (HERO)

// ============ DETAIL HEADER + TAB SHELL ============

const TABS = ['Summary', 'Profile', 'Financials', 'SLIK OJK', 'AML & Fraud', 'CRDE Result', 'Collateral', 'Application'];

function DetailShellA({ crdeState }) {
  // Horizontal tabs (per PRD)
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'auto' }}>
          <DetailHeader crdeState={crdeState} />
          <TabBar tabs={TABS} active="Summary" />
          <div style={{ padding: 16, border: '1px solid var(--wf-line-strong)', borderTop: 'none', minHeight: 360 }}>
            <div className="wf-placeholder" style={{ height: 320 }}>Tab content area · Summary</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailShellB({ crdeState }) {
  // Vertical rail tabs
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} />
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, flex: 1, minHeight: 0 }}>
            <div className="wf-stack" style={{ gap: 2, borderRight: '1px solid var(--wf-line)', paddingRight: 8 }}>
              {TABS.map((t, i) => (
                <div key={t} style={{
                  padding: '8px 10px', fontSize: 12, fontWeight: i === 0 ? 600 : 400,
                  background: i === 0 ? 'var(--wf-accent-bg)' : 'transparent',
                  borderLeft: i === 0 ? '2px solid var(--wf-accent)' : '2px solid transparent',
                  color: i === 0 ? 'var(--wf-accent)' : 'var(--wf-ink-2)',
                  cursor: 'pointer'
                }}>{t}</div>
              ))}
            </div>
            <div className="wf-box" style={{ padding: 16, overflow: 'auto' }}>
              <div className="wf-placeholder" style={{ height: 320 }}>Tab content area</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailShellC({ crdeState }) {
  // Single-scroll page (no tabs) with anchor nav
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} />
          <div className="wf-row wf-gap-8" style={{ marginBottom: 12, padding: '8px 0', borderTop: '1px solid var(--wf-line)', borderBottom: '1px solid var(--wf-line)' }}>
            <span className="wf-tiny">Jump to:</span>
            {TABS.map((t, i) => (
              <a key={t} className="wf-tiny" style={{ color: i === 0 ? 'var(--wf-accent)' : 'var(--wf-ink-2)', textDecoration: 'underline', cursor: 'pointer' }}>{t}</a>
            ))}
          </div>
          <div className="wf-stack" style={{ gap: 12, overflow: 'auto', flex: 1 }}>
            {TABS.slice(0, 3).map((t) => (
              <div key={t} className="wf-box" style={{ padding: 12 }}>
                <div className="wf-h3" style={{ marginBottom: 8 }}>{t}</div>
                <div className="wf-placeholder" style={{ height: 80 }}>Section</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ SUMMARY TAB (HERO — 3 variations) ============

function SummaryA({ crdeState = 'approve', amlBanner = false }) {
  // Scoreboard layout — large CRDE verdict + checklist
  const s = CRDE_STATES[crdeState];
  const checks = [
    ['DTI', '28%', 'Limit 40%', 'pass'],
    ['SLIK Kol.', '1 — Lancar', 'Required ≤ 2', 'pass'],
    ['AML', 'Clear', 'No PEP / DTTOT', amlBanner ? 'fail' : 'pass'],
    ['Fraud signals', 'None', '0 flags', 'pass'],
    ['Income verif.', '✓ Verified', 'Slip + Rek. 3M', 'pass'],
    ['LTV', 'N/A (KTA)', '—', 'pass'],
  ];
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} amlBanner={amlBanner} />
          <TabBar tabs={TABS} active="Summary" />
          <div style={{ padding: 16, border: '1px solid var(--wf-line-strong)', borderTop: 'none', flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
            <div className="wf-stack" style={{ gap: 16 }}>
              <div className="wf-fill" style={{ padding: 16, background: `var(--wf-${s.pill}-bg)`, borderColor: `var(--wf-${s.pill === 'success' ? 'success' : s.pill === 'warn' ? 'warn' : 'danger'})` }}>
                <div className="wf-meta">CRDE Recommendation</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, letterSpacing: '-0.01em' }}>{s.label}</div>
                <div className="wf-row wf-gap-16" style={{ marginTop: 8 }}>
                  <div><span className="wf-label">Risk</span> <span style={{ fontWeight: 600 }}>{s.risk}</span></div>
                  <div><span className="wf-label">Score</span> <span className="wf-mono" style={{ fontWeight: 600 }}>{s.score}/1000</span></div>
                  <div><span className="wf-label">Engine</span> <span className="wf-mono">v3.1.0</span></div>
                </div>
              </div>
              <div>
                <div className="wf-h3" style={{ marginBottom: 8 }}>Checklist</div>
                <div className="wf-stack" style={{ gap: 0 }}>
                  {checks.map(([l, v, t, p]) => (
                    <div key={l} className="wf-row" style={{ padding: '8px 0', borderBottom: '1px solid var(--wf-line)' }}>
                      <span style={{ width: 18 }}>{p === 'pass' ? '✓' : '✗'}</span>
                      <span style={{ width: 140, fontSize: 12, color: 'var(--wf-ink-2)' }}>{l}</span>
                      <span style={{ flex: 1, fontWeight: 500 }}>{v}</span>
                      <span className="wf-tiny">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="wf-h3" style={{ marginBottom: 8 }}>Notes</div>
                <div className="wf-fill" style={{ padding: 12, fontSize: 12 }}>
                  Application meets all RAC criteria. DTI well within KTA threshold. Clean SLIK history. Verified employment 8y3m at PT Astra International Tbk.
                </div>
              </div>
            </div>
            <div className="wf-stack" style={{ gap: 12 }}>
              <div className="wf-h3">Key Metrics</div>
              <div className="wf-fill" style={{ padding: 12 }}>
                <div className="wf-stack" style={{ gap: 10 }}>
                  {[['DTI','28%','40%','success', 0.28/0.5],['Score','847','1000','success', 0.847],['LTV','—','—', null, 0]].map(([l,v,m,c,p],i) => (
                    <div key={i}>
                      <div className="wf-row" style={{ justifyContent: 'space-between' }}>
                        <span className="wf-label">{l}</span>
                        <span className="wf-mono" style={{ fontSize: 12 }}>{v} / {m}</span>
                      </div>
                      {c && <div className="wf-bar" style={{ marginTop: 4 }}><div className={`wf-bar-fill ${c}`} style={{ width: `${p*100}%` }} /></div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="wf-h3">Decision</div>
              <div className="wf-stack" style={{ gap: 8 }}>
                <div className="wf-btn wf-btn-primary" style={{ width: '100%' }}>✓ Approve</div>
                <div className="wf-btn" style={{ width: '100%' }}>↳ Refer to committee</div>
                <div className="wf-btn wf-btn-ghost" style={{ width: '100%' }}>✗ Reject</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryB({ crdeState = 'approve', amlBanner = false }) {
  // Memo-style — narrative summary + sidebar metrics (matches Copilot pattern)
  const s = CRDE_STATES[crdeState];
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} amlBanner={amlBanner} />
          <TabBar tabs={TABS} active="Summary" />
          <div style={{ padding: 20, border: '1px solid var(--wf-line-strong)', borderTop: 'none', flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 240px', gap: 24 }}>
            <div className="wf-stack" style={{ gap: 16 }}>
              <div>
                <div className="wf-meta">Application Memo</div>
                <div className="wf-h2" style={{ fontSize: 18, marginTop: 4 }}>Consumer Credit Analysis · APP-001</div>
                <div className="wf-tiny" style={{ marginTop: 2 }}>Generated 18 Apr 2026 · CRDE v3.1.0 · pending analyst decision</div>
              </div>
              <div className="wf-fill" style={{ padding: 14, borderLeft: `3px solid var(--wf-${s.pill === 'success' ? 'success' : s.pill === 'warn' ? 'warn' : 'danger'})` }}>
                <div className="wf-meta">CRDE Recommendation</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
                <div className="wf-tiny" style={{ marginTop: 6 }}>Risk {s.risk} · Score {s.score}/1000 · Rules triggered: 0</div>
              </div>
              <div>
                <div className="wf-h3" style={{ marginBottom: 6 }}>Executive Summary</div>
                <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--wf-ink)' }}>
                  Budi Santoso applies for a <strong>Rp 50M KTA</strong> with 24-month tenor. DTI 28% (limit 40%); SLIK kol. 1 with no late payments in 24 months; AML/PEP screening clear; income verified via slip and bank statement. CRDE recommends <strong>{s.label}</strong> with score {s.score}/1000.
                </div>
              </div>
              <div>
                <div className="wf-h3" style={{ marginBottom: 6 }}>Strengths</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
                  <li>DTI 28% — well below 40% RAC limit</li>
                  <li>Clean SLIK kolektibilitas (1 — Lancar) for 24 months</li>
                  <li>Stable employment · 8y3m at PT Astra International Tbk</li>
                  <li>No AML, PEP, or fraud flags</li>
                </ul>
              </div>
              <div>
                <div className="wf-h3" style={{ marginBottom: 6 }}>Areas to Verify</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: 'var(--wf-ink-2)' }}>
                  <li>Confirm purpose of funds (renovation) is consistent with declared</li>
                  <li>No additional verification required</li>
                </ul>
              </div>
            </div>
            <div className="wf-stack" style={{ gap: 12 }}>
              <div className="wf-h3">Key Metrics</div>
              <div className="wf-stack" style={{ gap: 6 }}>
                {[['DTI','28%','success'],['SLIK','Kol. 1','success'],['AML','Clear','success'],['Score','847','success'],['Rules','0','success']].map(([k,v,c]) => (
                  <div key={k} className="wf-row" style={{ justifyContent: 'space-between', padding: '6px 8px', background: 'var(--wf-bg-2)', borderLeft: `2px solid var(--wf-${c})` }}>
                    <span className="wf-label">{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="wf-h3" style={{ marginTop: 8 }}>Decision</div>
              <span className={`wf-pill ${s.pill}`} style={{ alignSelf: 'flex-start' }}>{s.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryC({ crdeState = 'approve', amlBanner = false }) {
  // Dashboard-style — all key data in cards (data-rich agent-friendly)
  const s = CRDE_STATES[crdeState];
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} amlBanner={amlBanner} />
          <TabBar tabs={TABS} active="Summary" />
          <div style={{ padding: 16, border: '1px solid var(--wf-line-strong)', borderTop: 'none', flex: 1, overflow: 'auto' }}>
            {/* Row 1: 4 KPI cards */}
            <div className="wf-row wf-gap-12" style={{ marginBottom: 12 }}>
              <div className="wf-fill" style={{ flex: 1, padding: 12, borderLeft: `3px solid var(--wf-${s.pill === 'success' ? 'success' : s.pill === 'warn' ? 'warn' : 'danger'})` }}>
                <div className="wf-label">Recommendation</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
                <div className="wf-tiny">CRDE v3.1.0</div>
              </div>
              <div className="wf-fill" style={{ flex: 1, padding: 12 }}>
                <div className="wf-label">Risk Score</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }} className="wf-mono">{s.score}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--wf-ink-3)' }}>/1000</span></div>
                <div className="wf-tiny">{s.risk} risk</div>
              </div>
              <div className="wf-fill" style={{ flex: 1, padding: 12 }}>
                <div className="wf-label">DTI Ratio</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }} className="wf-mono">28%</div>
                <div className="wf-bar" style={{ marginTop: 4 }}><div className="wf-bar-fill success" style={{ width: '56%' }} /></div>
              </div>
              <div className="wf-fill" style={{ flex: 1, padding: 12 }}>
                <div className="wf-label">SLIK Kol.</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>1 — Lancar</div>
                <div className="wf-tiny">24 mo clean</div>
              </div>
            </div>
            {/* Row 2: Two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="wf-box-soft" style={{ padding: 12 }}>
                <div className="wf-h3" style={{ marginBottom: 8 }}>Borrower Snapshot</div>
                <FieldGrid rows={[
                  ['Name', 'Budi Santoso'],
                  ['NIK', <span className="wf-mono">3174051203850003</span>],
                  ['Employer', 'PT Astra International Tbk'],
                  ['Income', <span className="wf-mono">Rp 14.800.000 net/mo</span>],
                  ['Tenure', '8y 3m'],
                ]} />
              </div>
              <div className="wf-box-soft" style={{ padding: 12 }}>
                <div className="wf-h3" style={{ marginBottom: 8 }}>Loan Snapshot</div>
                <FieldGrid rows={[
                  ['Product', 'KTA'],
                  ['Amount', <span className="wf-mono">Rp 50.000.000</span>],
                  ['Tenor', '24 months'],
                  ['Rate', '10.5% p.a.'],
                  ['Installment', <span className="wf-mono">Rp 2.308.333/mo</span>],
                ]} />
              </div>
            </div>
            {/* Row 3: Checks strip */}
            <div className="wf-box-soft" style={{ padding: 12 }}>
              <div className="wf-h3" style={{ marginBottom: 8 }}>Compliance Strip</div>
              <div className="wf-row wf-gap-8" style={{ flexWrap: 'wrap' }}>
                {['DTI','SLIK','AML/PEP','DTTOT','UN Sanctions','Fraud signals','Income verif','Address verif'].map(c => (
                  <span key={c} className="wf-pill success">✓ {c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TABS, DetailShellA, DetailShellB, DetailShellC, SummaryA, SummaryB, SummaryC });

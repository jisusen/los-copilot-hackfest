// Tabs: AML, CRDE, Collateral, Application

function AmlTab({ crdeState, amlBanner = false }) {
  const flagged = amlBanner;
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} amlBanner={amlBanner} />
          <TabBar tabs={TABS} active="AML & Fraud" />
          <div style={{ padding: 20, border: '1px solid var(--wf-line-strong)', borderTop: 'none', flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div className="wf-h3" style={{ marginBottom: 12 }}>Sanctions Screening</div>
              <FieldGrid rows={[
                ['DTTOT (Indonesia)', <span className="wf-pill success">✓ Not listed</span>],
                ['UN Sanctions',      <span className="wf-pill success">✓ Not listed</span>],
                ['OFAC',              <span className="wf-pill success">✓ Not listed</span>],
                ['EU Sanctions',      <span className="wf-pill success">✓ Not listed</span>],
              ]} />
              <div className="wf-h3" style={{ marginTop: 24, marginBottom: 12 }}>PEP Screening</div>
              <FieldGrid rows={[
                ['PEP Status', flagged ? <span className="wf-pill danger">⚠ Identified as PEP</span> : <span className="wf-pill success">✓ Not a PEP</span>],
                ['Detail', flagged ? 'Spouse holds public office (Kepala Dinas, 2022–present)' : '—'],
                ['Risk level', flagged ? 'HIGH' : '—'],
              ]} />
            </div>
            <div>
              <div className="wf-h3" style={{ marginBottom: 12 }}>Fraud Signals</div>
              <FieldGrid rows={[
                ['Income consistency',  <span className="wf-pill success">✓ Consistent</span>],
                ['Address verification', <span className="wf-pill success">✓ No flag</span>],
                ['Document tampering',  <span className="wf-pill success">✓ None detected</span>],
                ['Velocity check',      <span className="wf-pill success">✓ Normal</span>],
                ['Device fingerprint',  <span className="wf-pill success">✓ Trusted device</span>],
              ]} />
              <div className="wf-h3" style={{ marginTop: 24, marginBottom: 12 }}>Screening Metadata</div>
              <FieldGrid rows={[
                ['Engine', 'BMS AML Engine v2.3'],
                ['Run on', '18 Apr 2026 · 09:14 WIB'],
                ['Run by', 'system (auto)'],
                ['Notes', flagged ? 'PEP match — manual escalation required' : 'Cleared all checks. No further action required.'],
              ]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrdeTab({ crdeState = 'approve' }) {
  const s = CRDE_STATES[crdeState];
  const rules = crdeState === 'approve'
    ? []
    : crdeState === 'refer'
      ? ['DTI 51% exceeds KTA threshold (40%)', 'Kolektibilitas 2 (DPK) — manual review required']
      : ['DTI 73% far exceeds KTA limit (40%)', 'Kolektibilitas 2 (Special Mention) — repeated late payments', 'Income inconsistency detected', 'Address flag', 'Loan purpose high-risk category'];
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} />
          <TabBar tabs={TABS} active="CRDE Result" />
          <div style={{ padding: 20, border: '1px solid var(--wf-line-strong)', borderTop: 'none', flex: 1, overflow: 'auto' }}>
            <div className="wf-fill" style={{ padding: 16, marginBottom: 16, background: `var(--wf-${s.pill}-bg)`, borderColor: `var(--wf-${s.pill === 'success' ? 'success' : s.pill === 'warn' ? 'warn' : 'danger'})`, borderWidth: 1, borderStyle: 'solid' }}>
              <div className="wf-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="wf-meta">Credit Risk Decision Engine — Result</div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{s.label}</div>
                  <div className="wf-tiny" style={{ marginTop: 4 }}>Processed 18 Apr 2026 · 09:14 WIB · BMS CRDE v3.1.0</div>
                </div>
                <div className="wf-stack" style={{ alignItems: 'flex-end', gap: 4 }}>
                  <div className="wf-meta">Risk Score</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{s.risk}</div>
                  <div className="wf-mono wf-tiny">{s.score} / 1000</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div className="wf-h3" style={{ marginBottom: 12 }}>Gate Checks</div>
                <table className="wf-table">
                  <thead><tr><th>Check</th><th>Actual</th><th>Threshold</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr><td>DTI</td><td className="wf-mono">28%</td><td className="wf-mono">≤ 40%</td><td><span className="wf-pill success">PASS</span></td></tr>
                    <tr className="zebra"><td>SLIK Kol.</td><td>1 — Lancar</td><td>≤ 2</td><td><span className="wf-pill success">PASS</span></td></tr>
                    <tr><td>AML</td><td>Clear</td><td>No match</td><td><span className="wf-pill success">PASS</span></td></tr>
                    <tr className="zebra"><td>Fraud</td><td>None</td><td>0 signals</td><td><span className="wf-pill success">PASS</span></td></tr>
                    <tr><td>Income verif.</td><td>Verified</td><td>Required</td><td><span className="wf-pill success">PASS</span></td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <div className="wf-h3" style={{ marginBottom: 12 }}>Rules Triggered</div>
                {rules.length === 0 ? (
                  <div className="wf-fill" style={{ padding: 12, fontSize: 13, color: 'var(--wf-ink-2)' }}>
                    No rules triggered. Application meets all RAC criteria.
                  </div>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
                    {rules.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}
                <div className="wf-h3" style={{ marginTop: 24, marginBottom: 8 }}>CRDE Notes</div>
                <div className="wf-fill" style={{ padding: 12, fontSize: 12 }}>
                  Application {s.label.toLowerCase()}. {rules.length === 0 ? 'All gate checks passed.' : `${rules.length} rule(s) triggered — see list.`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollateralTab({ crdeState }) {
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} appId="APP-003" name="Ahmad Fauzi" amount="Rp 500.000.000" product="KPR" />
          <TabBar tabs={TABS} active="Collateral" />
          <div style={{ padding: 20, border: '1px solid var(--wf-line-strong)', borderTop: 'none', flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
            <div>
              <div className="wf-h3" style={{ marginBottom: 12 }}>Asset</div>
              <FieldGrid rows={[
                ['Required',          'Yes (KPR product)'],
                ['Asset Type',        'SHM (Hak Milik)'],
                ['Description',       'Single-family residence, 2 floors, LB 220m² / LT 120m²'],
                ['Address',           'Jl. Kemang Selatan IV No. 8, Jakarta Selatan'],
                ['Certificate No.',   <span className="wf-mono">SHM-12345/JKT-SEL</span>],
                ['Legal Status',      <span className="wf-pill success">✓ Clean (no encumbrance)</span>],
              ]} />
              <div className="wf-h3" style={{ marginTop: 24, marginBottom: 12 }}>Valuation</div>
              <FieldGrid rows={[
                ['Market Value',       <span className="wf-mono">Rp 850.000.000</span>],
                ['Liquidation Value',  <span className="wf-mono">Rp 680.000.000</span>],
                ['Appraisal Date',     '10 April 2026'],
                ['Appraiser',          'KJPP Hermawan & Rekan (registered)'],
              ]} />
            </div>
            <div className="wf-stack" style={{ gap: 16 }}>
              <div className="wf-fill" style={{ padding: 14 }}>
                <div className="wf-meta">LTV Ratio</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }} className="wf-mono">59%</div>
                <div className="wf-tiny" style={{ marginBottom: 8 }}>Limit 80% (SHM) · PASS</div>
                <div className="wf-bar" style={{ height: 14 }}>
                  <div className="wf-bar-fill success" style={{ width: '59%' }} />
                  <div className="wf-bar-mark" style={{ left: '80%' }} />
                </div>
              </div>
              <div className="wf-h3">Documents</div>
              <div className="wf-stack" style={{ gap: 6 }}>
                {['SHM certificate (orig.)', 'PBB latest', 'IMB / PBG', 'Appraisal report', 'Photos (8 angles)'].map(d => (
                  <div key={d} className="wf-row" style={{ padding: '6px 8px', background: 'var(--wf-bg-2)', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12 }}>{d}</span>
                    <span className="wf-pill success">✓</span>
                  </div>
                ))}
              </div>
              <div className="wf-placeholder" style={{ height: 100 }}>property photo · placeholder</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationTab({ crdeState }) {
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} />
          <TabBar tabs={TABS} active="Application" />
          <div style={{ padding: 20, border: '1px solid var(--wf-line-strong)', borderTop: 'none', flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div className="wf-h3" style={{ marginBottom: 12 }}>Loan Request</div>
              <FieldGrid rows={[
                ['Product',       'KTA (Unsecured Personal Loan)'],
                ['Amount',        <span className="wf-mono">Rp 50.000.000</span>],
                ['Tenor',         '24 months'],
                ['Interest Rate', '10.5% p.a. (effective)'],
                ['Installment',   <span className="wf-mono">Rp 2.308.333 / month</span>],
                ['Total Repay',   <span className="wf-mono">Rp 55.400.000</span>],
              ]} />
              <div className="wf-h3" style={{ marginTop: 24, marginBottom: 12 }}>Purpose & Source</div>
              <FieldGrid rows={[
                ['Purpose of Funds',    'Home renovation'],
                ['Repayment Source',    'Monthly salary (auto-debit)'],
                ['Disbursement Bank',   'BMS Account · 1234-567-890'],
              ]} />
            </div>
            <div>
              <div className="wf-h3" style={{ marginBottom: 12 }}>Application Lifecycle</div>
              <div className="wf-stack" style={{ gap: 10 }}>
                {[
                  ['Submitted',    '15 Apr 2026 · 10:32 WIB', 'Marketing Officer', 'success'],
                  ['SLIK fetched', '15 Apr 2026 · 10:34 WIB', 'system',            'success'],
                  ['AML screened', '15 Apr 2026 · 10:35 WIB', 'system',            'success'],
                  ['CRDE scored',  '18 Apr 2026 · 09:14 WIB', 'CRDE v3.1.0',       'success'],
                  ['In review',    '18 Apr 2026 · 14:02 WIB', 'analyst01 (agent)', 'warn'],
                  ['Disposition',  '— pending —',             '—',                  null],
                ].map(([l, t, by, c], i) => (
                  <div key={i} className="wf-row wf-gap-12" style={{ padding: '8px 10px', background: i === 4 ? 'var(--wf-accent-bg)' : 'var(--wf-bg-2)' }}>
                    <span className="wf-dot" style={{ background: c ? `var(--wf-${c})` : 'var(--wf-line-strong)' }} />
                    <div className="wf-stack" style={{ gap: 2, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{l}</div>
                      <div className="wf-tiny">{t} · by {by}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="wf-h3" style={{ marginTop: 24, marginBottom: 12 }}>Origin</div>
              <FieldGrid rows={[
                ['Branch',           'Cabang Jakarta Selatan (JKT-SEL-04)'],
                ['Marketing Officer','Ahmad Riyadi · MO-047'],
                ['Channel',          'Branch walk-in'],
                ['Application Date', '15 April 2026'],
              ]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AmlTab, CrdeTab, CollateralTab, ApplicationTab });

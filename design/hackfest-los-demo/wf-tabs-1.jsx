// Tabs: Profile, Financials, SLIK OJK

function ProfileTab({ crdeState }) {
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} />
          <TabBar tabs={TABS} active="Profile" />
          <div style={{ padding: 20, border: '1px solid var(--wf-line-strong)', borderTop: 'none', flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <div className="wf-h3" style={{ marginBottom: 12 }}>Personal Information</div>
              <FieldGrid rows={[
                ['Full Name', 'Budi Santoso'],
                ['NIK', <span className="wf-mono">3174051203850003</span>],
                ['NPWP', <span className="wf-mono">12.345.678.9-012.000</span>],
                ['Date of Birth', '12 March 1985 (age 41)'],
                ['Marital Status', 'Married'],
                ['Dependents', '2 persons'],
              ]} />
              <div className="wf-h3" style={{ marginTop: 24, marginBottom: 12 }}>Contact</div>
              <FieldGrid rows={[
                ['Domicile', 'Jakarta Selatan, DKI Jakarta'],
                ['Address', 'Jl. Kebagusan Raya No. 12, RT 03/RW 05, Jagakarsa'],
                ['Phone', <span className="wf-mono">0812-3456-7890</span>],
                ['Email', <span className="wf-mono">budi.santoso@email.com</span>],
              ]} />
            </div>
            <div>
              <div className="wf-h3" style={{ marginBottom: 12 }}>Employment</div>
              <FieldGrid rows={[
                ['Type', 'Salaried · Private Sector'],
                ['Employer', 'PT Astra International Tbk'],
                ['Position', 'Senior Engineer'],
                ['Tenure', '8 years 3 months'],
                ['Office Address', 'Jl. Gaya Motor Raya, Sunter II, Jakarta Utara'],
                ['Office Phone', <span className="wf-mono">021-6504800</span>],
              ]} />
              <div className="wf-h3" style={{ marginTop: 24, marginBottom: 12 }}>KYC Documents</div>
              <div className="wf-stack" style={{ gap: 6 }}>
                {[['KTP', 'verified', '12 Apr'], ['NPWP card', 'verified', '12 Apr'], ['Family Card', 'verified', '12 Apr'], ['Salary slip (3 mo)', 'verified', '13 Apr'], ['Bank statement (3 mo)', 'verified', '13 Apr']].map(([d, s, t]) => (
                  <div key={d} className="wf-row" style={{ padding: '6px 8px', background: 'var(--wf-bg-2)', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12 }}>{d}</span>
                    <div className="wf-row wf-gap-8">
                      <span className="wf-pill success">✓ {s}</span>
                      <span className="wf-tiny">{t}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialsTab({ crdeState }) {
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} />
          <TabBar tabs={TABS} active="Financials" />
          <div style={{ padding: 20, border: '1px solid var(--wf-line-strong)', borderTop: 'none', flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
            <div>
              <div className="wf-h3" style={{ marginBottom: 12 }}>Income & Obligations (monthly)</div>
              <FieldGrid rows={[
                ['Gross Income',           <span className="wf-mono">Rp 18.500.000</span>],
                ['Net Income',             <span className="wf-mono">Rp 14.800.000</span>],
                ['Existing Obligations',   <span className="wf-mono">Rp 2.100.000</span>],
                ['Requested Installment',  <span className="wf-mono">Rp 2.000.000</span>],
                ['Total Obligations',      <span className="wf-mono" style={{ fontWeight: 600 }}>Rp 4.100.000</span>],
                ['Remaining Income',       <span className="wf-mono">Rp 10.700.000</span>],
              ]} />
              <div className="wf-h3" style={{ marginTop: 24, marginBottom: 12 }}>Verification</div>
              <FieldGrid rows={[
                ['Method', 'Salary slip + Bank statement (3 months)'],
                ['Status', <span className="wf-pill success">✓ Verified</span>],
                ['Verified by', 'system + analyst02'],
                ['Verified on', '13 Apr 2026'],
              ]} />
            </div>
            <div className="wf-stack" style={{ gap: 16 }}>
              <div className="wf-fill" style={{ padding: 14 }}>
                <div className="wf-meta">DTI Ratio</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }} className="wf-mono">28%</div>
                <div className="wf-tiny" style={{ marginBottom: 8 }}>Threshold: 40% (KTA) · PASS</div>
                <div className="wf-bar" style={{ height: 14 }}>
                  <div className="wf-bar-fill success" style={{ width: '56%' }} />
                  <div className="wf-bar-mark" style={{ left: '80%' }} />
                </div>
                <div className="wf-row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                  <span className="wf-tiny">0%</span>
                  <span className="wf-tiny">40% limit</span>
                  <span className="wf-tiny">50%</span>
                </div>
              </div>
              <div className="wf-h3">Disposable Income Breakdown</div>
              <div className="wf-stack" style={{ gap: 6 }}>
                {[['Net income', 100, 'success'], ['Existing oblig.', 14, 'warn'], ['Requested install.', 14, 'warn'], ['Disposable', 72, 'success']].map(([l, p, c], i) => (
                  <div key={i}>
                    <div className="wf-row" style={{ justifyContent: 'space-between' }}>
                      <span className="wf-tiny">{l}</span>
                      <span className="wf-tiny wf-mono">{p}%</span>
                    </div>
                    <div className="wf-bar" style={{ marginTop: 2 }}><div className={`wf-bar-fill ${c}`} style={{ width: `${p}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlikTab({ crdeState }) {
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DetailHeader crdeState={crdeState} />
          <TabBar tabs={TABS} active="SLIK OJK" />
          <div style={{ padding: 20, border: '1px solid var(--wf-line-strong)', borderTop: 'none', flex: 1, overflow: 'auto' }}>
            <div className="wf-row wf-gap-12" style={{ marginBottom: 16 }}>
              <div className="wf-fill" style={{ flex: 1, padding: 12 }}>
                <div className="wf-label">Current Kolektibilitas</div>
                <div className="wf-row wf-gap-8" style={{ marginTop: 4 }}>
                  <span className="wf-pill success">1 — Lancar</span>
                </div>
              </div>
              <div className="wf-fill" style={{ flex: 1, padding: 12 }}>
                <div className="wf-label">Worst Kol. (12 mo)</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>1 — Lancar</div>
              </div>
              <div className="wf-fill" style={{ flex: 1, padding: 12 }}>
                <div className="wf-label">Blacklist Status</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: 'var(--wf-success)' }}>✓ Not listed</div>
              </div>
              <div className="wf-fill" style={{ flex: 1, padding: 12 }}>
                <div className="wf-label">Last checked</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>18 Apr 2026 · 09:14 WIB</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div className="wf-h3" style={{ marginBottom: 12 }}>Existing Facilities</div>
                <table className="wf-table">
                  <thead><tr><th>Bank</th><th>Type</th><th>Outstanding</th><th>Kol.</th></tr></thead>
                  <tbody>
                    <tr><td>Bank Central Asia</td><td>KTA</td><td className="wf-mono">Rp 15.000.000</td><td><span className="wf-pill success">1</span></td></tr>
                    <tr className="zebra"><td>—</td><td>—</td><td>—</td><td>—</td></tr>
                  </tbody>
                </table>
                <div className="wf-row" style={{ marginTop: 8, padding: '8px 10px', background: 'var(--wf-bg-2)', justifyContent: 'space-between' }}>
                  <span className="wf-label">Total Obligations (SLIK)</span>
                  <span className="wf-mono" style={{ fontWeight: 600 }}>Rp 15.000.000</span>
                </div>
              </div>
              <div>
                <div className="wf-h3" style={{ marginBottom: 12 }}>24-month Payment History</div>
                <div className="wf-row" style={{ flexWrap: 'wrap', gap: 3 }}>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} title={`M-${24 - i}`} style={{ width: 18, height: 22, background: 'var(--wf-success-bg)', border: '1px solid var(--wf-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--wf-success)', fontWeight: 600 }}>1</div>
                  ))}
                </div>
                <div className="wf-tiny" style={{ marginTop: 8 }}>24/24 months on time. No late payments.</div>
                <div className="wf-h3" style={{ marginTop: 24, marginBottom: 8 }}>Notes</div>
                <div className="wf-fill" style={{ padding: 12, fontSize: 12 }}>
                  Debtor has a clean track record with no late payments in 24 months. Single existing facility (KTA at BCA, Rp 15M outstanding).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileTab, FinancialsTab, SlikTab });

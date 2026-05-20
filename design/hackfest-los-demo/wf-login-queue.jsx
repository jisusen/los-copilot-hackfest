// Login + Loan Queue wireframes — 3 variations each

// ============ LOGIN ============

function LoginA() {
  return (
    <div className="wf" style={{ background: 'var(--wf-bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="wf-box" style={{ width: 360, padding: 32, background: 'white' }}>
        <div className="wf-row wf-gap-8" style={{ marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, border: '1.5px solid var(--wf-line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>BMS</div>
          <div className="wf-stack" style={{ gap: 0 }}>
            <div style={{ fontWeight: 600 }}>Bank Mitra Sejahtera</div>
            <div className="wf-tiny">Credit Origination System</div>
          </div>
        </div>
        <div className="wf-h2" style={{ marginBottom: 16 }}>Sign in</div>
        <div className="wf-stack" style={{ gap: 12 }}>
          <div>
            <div className="wf-label" style={{ marginBottom: 4 }}>Username</div>
            <div className="wf-input" style={{ width: '100%' }}>analyst01</div>
          </div>
          <div>
            <div className="wf-label" style={{ marginBottom: 4 }}>Password</div>
            <div className="wf-input" style={{ width: '100%' }}>••••••••</div>
          </div>
          <div className="wf-btn wf-btn-primary" style={{ width: '100%', marginTop: 4 }}>Login</div>
        </div>
        <div className="wf-tiny" style={{ marginTop: 24, textAlign: 'center' }}>BMS © 2026 · Internal System</div>
      </div>
    </div>
  );
}

function LoginB() {
  return (
    <div className="wf" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ background: 'var(--wf-accent)', padding: 40, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ width: 40, height: 40, border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>BMS</div>
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Bank Mitra Sejahtera</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Credit Origination System · Personal Loans Division</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 24, fontFamily: "'IBM Plex Mono', monospace" }}>v3.1.0 · build 2026.04.18</div>
        </div>
        <div style={{ fontSize: 10, opacity: 0.5 }}>Authorized personnel only. All sessions are logged.</div>
      </div>
      <div style={{ padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="wf-h1" style={{ marginBottom: 4 }}>Sign in</div>
        <div className="wf-muted" style={{ fontSize: 12, marginBottom: 24 }}>Use your BMS internal credentials</div>
        <div className="wf-stack" style={{ gap: 14 }}>
          <div>
            <div className="wf-label" style={{ marginBottom: 4 }}>Username</div>
            <div className="wf-input" style={{ width: '100%' }}>analyst01</div>
          </div>
          <div>
            <div className="wf-label" style={{ marginBottom: 4 }}>Password</div>
            <div className="wf-input" style={{ width: '100%' }}>••••••••</div>
          </div>
          <div className="wf-row wf-gap-8" style={{ fontSize: 11, color: 'var(--wf-ink-2)' }}>
            <span className="wf-badge-sq" /> Remember device for 8 hours
          </div>
          <div className="wf-btn wf-btn-primary" style={{ width: '100%' }}>Login →</div>
          <div className="wf-tiny" style={{ textAlign: 'center' }}>Forgot password? Contact IT Helpdesk · ext. 1100</div>
        </div>
      </div>
    </div>
  );
}

function LoginC() {
  return (
    <div className="wf" style={{ background: 'white', padding: 0 }}>
      <div style={{ borderBottom: '1px solid var(--wf-line-strong)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 28, height: 28, border: '1.5px solid var(--wf-line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>BMS</div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>Bank Mitra Sejahtera · LOS</div>
        <div className="wf-grow" />
        <div className="wf-tiny">Help · Status · v3.1.0</div>
      </div>
      <div style={{ padding: '60px 80px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60 }}>
        <div>
          <div className="wf-meta" style={{ marginBottom: 8 }}>Internal System Login</div>
          <div className="wf-h1" style={{ fontSize: 28, marginBottom: 12 }}>Credit Origination System</div>
          <div style={{ fontSize: 13, color: 'var(--wf-ink-2)', maxWidth: 360 }}>
            Process consumer loan applications, review CRDE results, and submit underwriting decisions.
          </div>
          <div className="wf-stack" style={{ gap: 6, marginTop: 24 }}>
            <div className="wf-row wf-gap-8 wf-tiny"><span className="wf-dot success" /> All systems operational</div>
            <div className="wf-row wf-gap-8 wf-tiny"><span className="wf-dot success" /> SLIK OJK feed live · last sync 2 min ago</div>
            <div className="wf-row wf-gap-8 wf-tiny"><span className="wf-dot success" /> CRDE engine v3.1 ready</div>
          </div>
        </div>
        <div className="wf-box" style={{ padding: 28, alignSelf: 'center' }}>
          <div className="wf-h2" style={{ marginBottom: 16 }}>Login</div>
          <div className="wf-stack" style={{ gap: 12 }}>
            <div className="wf-input" style={{ width: '100%' }}>analyst01</div>
            <div className="wf-input" style={{ width: '100%' }}>••••••••</div>
            <div className="wf-btn wf-btn-primary" style={{ width: '100%' }}>Login</div>
          </div>
          <div className="wf-tiny" style={{ marginTop: 16 }}>Demo creds: analyst01 / bms2025</div>
        </div>
      </div>
    </div>
  );
}

// ============ LOAN QUEUE ============

function StatusPill({ status }) {
  const map = { 'Pending': '', 'In Review': 'warn', 'Approved': 'success', 'Rejected': 'danger' };
  return <span className={`wf-pill ${map[status] || ''}`}>{status}</span>;
}
function CrdeMicro({ d }) {
  const m = { Approve: 'success', Refer: 'warn', Reject: 'danger' };
  return <span className={`wf-pill ${m[d]}`}>● {d}</span>;
}

function QueueA() {
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'auto' }}>
          <PageHead
            title="Consumer Credit Application Queue"
            sub="10 pending applications · last refresh 14:02:01"
            agentTrace="agent reviewed 4 of 10 · last APP-006 at 14:02:19"
            right={<div className="wf-row wf-gap-8">
              <div className="wf-btn wf-btn-ghost">Export</div>
              <div className="wf-btn wf-btn-primary">+ New Application</div>
            </div>}
          />
          <div className="wf-row wf-gap-12" style={{ marginBottom: 16 }}>
            {[['Total Pending','10'],['Today','4'],['Awaiting Review','6'],['Decided Today','3']].map(([l,v])=>(
              <div key={l} className="wf-fill" style={{ flex: 1, padding: 12 }}>
                <div className="wf-label">{l}</div>
                <div style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="wf-row wf-gap-8" style={{ marginBottom: 12 }}>
            <div className="wf-input" style={{ width: 240 }}>🔍 Search by name or NIK…</div>
            <div className="wf-input" style={{ width: 140 }}>Status: All ▾</div>
            <div className="wf-input" style={{ width: 140 }}>Product: All ▾</div>
            <div className="wf-input" style={{ width: 180 }}>Date: 11–18 Apr 2026 ▾</div>
            <div className="wf-grow" />
            <div className="wf-tiny">Showing 10 of 10</div>
          </div>
          <table className="wf-table">
            <thead><tr>
              <th>App ID</th><th>Debtor</th><th>Product</th><th>Amount</th><th>Tenor</th><th>Submitted</th><th>Status</th><th>CRDE</th><th></th>
            </tr></thead>
            <tbody>
              {APPS.map((a, i) => (
                <tr key={a.id} className={i % 2 ? 'zebra' : ''}>
                  <td className="wf-mono">{a.id}</td>
                  <td style={{ fontWeight: 500 }}>{a.name}</td>
                  <td><span className="wf-pill">{a.product}</span></td>
                  <td className="wf-mono">{a.amount}</td>
                  <td>{a.tenor}</td>
                  <td>{a.date}</td>
                  <td><StatusPill status={a.status} /></td>
                  <td><CrdeMicro d={a.crde} /></td>
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

function QueueB() {
  // Master-detail split: list on left, preview on right
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, overflow: 'hidden', padding: 20 }}>
          <div className="wf-stack" style={{ gap: 12, overflow: 'hidden' }}>
            <div>
              <div className="wf-h2">Loan Queue</div>
              <div className="wf-tiny">10 pending</div>
            </div>
            <div className="wf-input">🔍 Search…</div>
            <div className="wf-stack" style={{ gap: 6, overflow: 'auto' }}>
              {APPS.map((a, i) => (
                <div key={a.id} className="wf-box-soft" style={{ padding: 10, background: i === 1 ? 'var(--wf-accent-bg)' : 'white', borderColor: i === 1 ? 'var(--wf-accent)' : undefined, borderWidth: i === 1 ? 1 : undefined }}>
                  <div className="wf-row" style={{ justifyContent: 'space-between' }}>
                    <span className="wf-mono wf-tiny">{a.id}</span>
                    <CrdeMicro d={a.crde} />
                  </div>
                  <div style={{ fontWeight: 500, marginTop: 2 }}>{a.name}</div>
                  <div className="wf-tiny">{a.product} · {a.amount} · {a.tenor}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="wf-box" style={{ padding: 16, overflow: 'auto' }}>
            <div className="wf-row wf-gap-8" style={{ marginBottom: 8 }}>
              <span className="wf-mono">APP-002</span>
              <span style={{ fontWeight: 600 }}>Siti Rahayu</span>
              <span className="wf-grow" />
              <span className="wf-pill warn">In Review</span>
              <CrdePill state="approve" />
            </div>
            <AgentTrace>last touched by agent · 14:02:19</AgentTrace>
            <div className="wf-row wf-gap-12" style={{ marginTop: 16 }}>
              {[['Product','KTA'],['Amount','Rp 30.000.000'],['Tenor','12 mo'],['DTI','42%'],['SLIK','Kol 1'],['Score','791']].map(([l,v])=>(
                <div key={l} className="wf-fill" style={{ flex: 1, padding: 8 }}>
                  <div className="wf-label">{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div className="wf-h3" style={{ marginTop: 20, marginBottom: 8 }}>CRDE Summary</div>
            <div className="wf-fill" style={{ padding: 12 }}>
              <div className="wf-row" style={{ marginBottom: 6 }}><span className="wf-label" style={{ width: 120 }}>Decision</span><span style={{ fontWeight: 600 }}>APPROVED</span></div>
              <div className="wf-row" style={{ marginBottom: 6 }}><span className="wf-label" style={{ width: 120 }}>Numeric score</span><span className="wf-mono">791 / 1000</span></div>
              <div className="wf-row"><span className="wf-label" style={{ width: 120 }}>Rules triggered</span><span>—</span></div>
            </div>
            <div className="wf-row wf-gap-8" style={{ marginTop: 16 }}>
              <div className="wf-btn wf-btn-primary">Open full detail →</div>
              <div className="wf-btn wf-btn-ghost">Mark in review</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QueueC() {
  // Card-grid variant — lower density per row but visual at a glance
  return (
    <div className="wf">
      <div className="wf-shell">
        <TopBar />
        <SideNav active="queue" />
        <div className="wf-content" style={{ overflow: 'auto' }}>
          <PageHead
            title="Loan Queue"
            sub="Card view · 10 applications"
            agentTrace="agent active · processing APP-006"
            right={<div className="wf-row wf-gap-8">
              <div className="wf-btn wf-btn-ghost">⊞ Cards</div>
              <div className="wf-btn wf-btn-ghost">☰ Table</div>
            </div>}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {APPS.map((a) => (
              <div key={a.id} className="wf-box-soft" style={{ padding: 12 }}>
                <div className="wf-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="wf-mono wf-tiny">{a.id}</span>
                  <CrdeMicro d={a.crde} />
                </div>
                <div className="wf-row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                    <div className="wf-tiny">{a.product} · {a.amount} · {a.tenor} · {a.date}</div>
                  </div>
                  <div className="wf-stack" style={{ alignItems: 'flex-end', gap: 4 }}>
                    <StatusPill status={a.status} />
                    <span className="wf-tiny wf-mono">score {a.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginA, LoginB, LoginC, QueueA, QueueB, QueueC, StatusPill, CrdeMicro });

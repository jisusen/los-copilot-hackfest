// Shared wireframe primitives + sample data

const APPS = [
  { id: 'APP-001', name: 'Budi Santoso',    product: 'KTA',       amount: 'Rp 50.000.000',  tenor: '24 mo',  date: '15 Apr 2026', status: 'Pending',     crde: 'Approve', risk: 'LOW',    score: 847 },
  { id: 'APP-002', name: 'Siti Rahayu',     product: 'KTA',       amount: 'Rp 30.000.000',  tenor: '12 mo',  date: '15 Apr 2026', status: 'In Review',   crde: 'Approve', risk: 'LOW',    score: 791 },
  { id: 'APP-003', name: 'Ahmad Fauzi',     product: 'KPR',       amount: 'Rp 500.000.000', tenor: '180 mo', date: '14 Apr 2026', status: 'Pending',     crde: 'Approve', risk: 'LOW',    score: 823 },
  { id: 'APP-004', name: 'Dewi Lestari',    product: 'KTA',       amount: 'Rp 75.000.000',  tenor: '36 mo',  date: '14 Apr 2026', status: 'In Review',   crde: 'Refer',   risk: 'MEDIUM', score: 612 },
  { id: 'APP-005', name: 'Rudi Hartono',    product: 'KKB',       amount: 'Rp 150.000.000', tenor: '48 mo',  date: '13 Apr 2026', status: 'Pending',     crde: 'Approve', risk: 'LOW',    score: 808 },
  { id: 'APP-006', name: 'Rina Susanti',    product: 'KTA',       amount: 'Rp 25.000.000',  tenor: '12 mo',  date: '13 Apr 2026', status: 'Pending',     crde: 'Approve', risk: 'LOW',    score: 861 },
  { id: 'APP-007', name: 'Hendra Wijaya',   product: 'KTA',       amount: 'Rp 100.000.000', tenor: '36 mo',  date: '12 Apr 2026', status: 'In Review',   crde: 'Reject',  risk: 'HIGH',   score: 341 },
  { id: 'APP-008', name: 'Maya Putri',      product: 'Multiguna', amount: 'Rp 200.000.000', tenor: '60 mo',  date: '12 Apr 2026', status: 'In Review',   crde: 'Refer',   risk: 'MEDIUM', score: 589 },
  { id: 'APP-009', name: 'Doni Pratama',    product: 'KPR',       amount: 'Rp 800.000.000', tenor: '240 mo', date: '11 Apr 2026', status: 'Pending',     crde: 'Approve', risk: 'LOW',    score: 835 },
  { id: 'APP-010', name: 'Yuli Andari',     product: 'KTA',       amount: 'Rp 40.000.000',  tenor: '24 mo',  date: '11 Apr 2026', status: 'In Review',   crde: 'Reject',  risk: 'HIGH',   score: 298 },
];

const CRDE_STATES = {
  approve: { label: 'APPROVED',   pill: 'success', risk: 'LOW',    score: 847, threshold: 'PASS' },
  refer:   { label: 'REFER',      pill: 'warn',    risk: 'MEDIUM', score: 612, threshold: 'REVIEW' },
  reject:  { label: 'REJECTED',   pill: 'danger',  risk: 'HIGH',   score: 298, threshold: 'FAIL' },
};

// CRDE pill in header — reflects current state
function CrdePill({ state = 'approve' }) {
  const s = CRDE_STATES[state];
  return <span className={`wf-pill ${s.pill}`}>CRDE · {s.label}</span>;
}

// Agent trace line — small footnote
function AgentTrace({ children = 'last touched by agent · 14:02:19 · trace #a8c2' }) {
  return <span className="wf-agent-trace">{children}</span>;
}

// Topbar
function TopBar() {
  return (
    <div className="wf-topbar">
      <div style={{ width: 32, height: 32, border: '1.5px solid var(--wf-line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>BMS</div>
      <div className="wf-stack" style={{ gap: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>Bank Mitra Sejahtera</div>
        <div className="wf-tiny">Sistem Informasi Kredit Konsumer</div>
      </div>
      <div className="wf-grow" />
      <div className="wf-row wf-gap-12">
        <div className="wf-tiny">v3.1.0</div>
        <div className="wf-fill" style={{ height: 28, padding: '0 10px', display: 'flex', alignItems: 'center', fontSize: 11 }}>analyst01 · Cabang JKT</div>
      </div>
    </div>
  );
}

function SideNav({ active = 'queue' }) {
  const items = [
    ['Dashboard', 'dashboard'],
    ['Loan Queue', 'queue'],
    ['Applications', 'apps'],
    ['Disbursement', 'disb'],
    ['Reports', 'reports'],
    ['—', 'sep'],
    ['Customers', 'cust'],
    ['Risk Engine', 'risk'],
    ['SLIK Tools', 'slik'],
    ['—', 'sep2'],
    ['Settings', 'settings'],
  ];
  return (
    <div className="wf-sidebar">
      <div className="wf-meta" style={{ padding: '4px 10px 12px' }}>Menu</div>
      <div className="wf-stack" style={{ gap: 2 }}>
        {items.map(([label, key]) =>
          label === '—'
            ? <div key={key} style={{ height: 1, background: 'var(--wf-line)', margin: '8px 6px' }} />
            : <div key={key} className={`wf-sidebar-link ${key === active ? 'active' : ''}`}>{label}</div>
        )}
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 12, right: 12 }} className="wf-tiny">
        Build 3.1.0 · Internal use only
      </div>
    </div>
  );
}

function PageHead({ title, sub, right, agentTrace }) {
  return (
    <div className="wf-page-head">
      <div>
        <div className="wf-h1">{title}</div>
        {sub && <div className="wf-muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>}
        {agentTrace && <div style={{ marginTop: 6 }}><AgentTrace>{agentTrace}</AgentTrace></div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function TabBar({ tabs, active }) {
  return (
    <div className="wf-tabs">
      {tabs.map(t => (
        <div key={t} className={`wf-tab ${t === active ? 'active' : ''}`}>{t}</div>
      ))}
    </div>
  );
}

// Field grid renderer
function FieldGrid({ rows }) {
  return (
    <div className="wf-fieldgrid">
      {rows.map(([l, v], i) => (
        <React.Fragment key={i}>
          <div className="wf-fg-label">{l}</div>
          <div className="wf-fg-value">{v}</div>
        </React.Fragment>
      ))}
    </div>
  );
}

// Detail header reused across all tab wireframes
function DetailHeader({ crdeState = 'approve', appId = 'APP-001', name = 'Budi Santoso', amount = 'Rp 50.000.000', product = 'KTA', amlBanner = false }) {
  return (
    <>
      <div className="wf-row wf-gap-12" style={{ marginBottom: 4 }}>
        <span className="wf-tiny">‹ Back to queue</span>
        <span className="wf-mono wf-tiny">{appId}</span>
        <span className="wf-tiny">·</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
        <span className="wf-tiny">·</span>
        <span className="wf-tiny">{product} · {amount}</span>
        <span className="wf-grow" />
        <CrdePill state={crdeState} />
        <span className="wf-pill">Status: In Review</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <AgentTrace>last touched by agent · 14:02:19 · trace #a8c2</AgentTrace>
      </div>
      {amlBanner && (
        <div className="wf-box" style={{ borderColor: 'var(--wf-danger)', background: 'var(--wf-danger-bg)', padding: 10, marginBottom: 12, fontSize: 12, color: 'var(--wf-danger)' }}>
          <strong>⚠ ATTENTION:</strong> Debtor flagged as PEP. Manual review mandatory before disposition.
        </div>
      )}
    </>
  );
}

Object.assign(window, { APPS, CRDE_STATES, CrdePill, AgentTrace, TopBar, SideNav, PageHead, TabBar, FieldGrid, DetailHeader });

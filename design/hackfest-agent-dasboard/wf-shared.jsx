// Shared wireframe atoms used across dashboard + detail explorations.

const SAMPLE_LOANS = [
  { id: "APP-010", name: "Yuli Andari",     prod: "KTA",       amt: "Rp 40jt",  risk: "HIGH",   crde: "REJECTED",  state: "ready"   },
  { id: "APP-006", name: "Rina Susanti",    prod: "KTA",       amt: "Rp 25jt",  risk: "LOW",    crde: "APPROVED",  state: "running", pct: 60 },
  { id: "APP-003", name: "Ahmad Fauzi",     prod: "KPR",       amt: "Rp 500jt", risk: "LOW",    crde: "APPROVED",  state: "running", pct: 28 },
  { id: "APP-008", name: "Maya Putri",      prod: "Multiguna", amt: "Rp 200jt", risk: "MEDIUM", crde: "REFER",     state: "ready"   },
  { id: "APP-004", name: "Dewi Lestari",    prod: "KTA",       amt: "Rp 75jt",  risk: "MEDIUM", crde: "REFER",     state: "queued"  },
  { id: "APP-002", name: "Siti Rahayu",     prod: "KTA",       amt: "Rp 30jt",  risk: "LOW",    crde: "APPROVED",  state: "queued"  },
  { id: "APP-005", name: "Rudi Hartono",    prod: "KKB",       amt: "Rp 150jt", risk: "LOW",    crde: "APPROVED",  state: "queued"  },
  { id: "APP-009", name: "Doni Pratama",    prod: "KPR",       amt: "Rp 800jt", risk: "LOW",    crde: "APPROVED",  state: "decided", decision: "APPROVED" },
  { id: "APP-001", name: "Budi Santoso",    prod: "KTA",       amt: "Rp 50jt",  risk: "LOW",    crde: "APPROVED",  state: "decided", decision: "APPROVED" },
  { id: "APP-007", name: "Hendra Wijaya",   prod: "KTA",       amt: "Rp 100jt", risk: "HIGH",   crde: "REJECTED",  state: "decided", decision: "REJECTED" },
];

function Topbar({ section, user="analyst01", right, dark=false, agentMode="real", liveOn=true, onAgentMode, onLive }) {
  // Real/Sim toggle — segmented control
  const seg = (active, label, onClick, color) => (
    <button onClick={onClick} style={{
      border: 0,
      padding: '4px 10px',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      background: active ? (color || 'var(--ink)') : 'transparent',
      color: active ? '#fff' : (dark ? '#bdb9ad' : 'var(--ink-3)'),
      borderRadius: 2,
    }}>{label}</button>
  );
  return (
    <div className="topbar" style={dark ? {background:'#1c1f25', borderColor:'#2a2e36', color:'#e8e6dd'} : null}>
      <div className="brand" style={dark ? {color:'#fff'} : null}>
        <span className="brand-mark" style={dark ? {background:'var(--accent)', color:'#fff'} : null}>B</span> Credit Analyst Copilot
      </div>
      <div className="breadcrumb" style={dark ? {color:'#8a8a8a'} : null}>
        / {section || "Pipeline"}
      </div>
      <div className="spacer" />
      {right}
      {/* Agent mode segmented */}
      <div style={{
        display:'inline-flex', alignItems:'center',
        border:'1px solid '+(dark ? '#3a3e46' : 'var(--line)'),
        borderRadius: 2, padding: 1, gap: 1, background: dark ? '#252830' : '#fff',
      }}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:9, color: dark ? '#8a8a8a' : 'var(--ink-3)', padding:'0 6px', textTransform:'uppercase', letterSpacing:'.08em'}}>Agent</span>
        {seg(agentMode==="real", "Real", () => onAgentMode && onAgentMode("real"), 'var(--blue)')}
        {seg(agentMode==="sim", "Simulation", () => onAgentMode && onAgentMode("sim"), 'var(--accent)')}
      </div>
      {/* Live view toggle */}
      <button onClick={() => onLive && onLive(!liveOn)} style={{
        border:'1px solid '+(dark ? '#3a3e46' : 'var(--line)'),
        background: liveOn ? (dark ? '#252830' : '#fff') : 'transparent',
        padding:'4px 10px', borderRadius: 2, cursor:'pointer',
        fontFamily:'var(--font-mono)', fontSize: 10, letterSpacing:'.06em', textTransform:'uppercase',
        color: liveOn ? (dark ? '#fff' : 'var(--ink)') : (dark ? '#8a8a8a' : 'var(--ink-3)'),
        display:'inline-flex', alignItems:'center', gap: 6,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: liveOn ? 'var(--red)' : (dark ? '#3a3e46' : 'var(--ink-4)'),
          animation: liveOn ? 'pulse 1.4s infinite' : 'none',
        }}/>
        Live view {liveOn ? "ON" : "OFF"}
      </button>
      <div className="pill" style={dark ? {borderColor:'#3a3e46', color:'#bdb9ad', fontFamily:'var(--font-mono)'} : {fontFamily: 'var(--font-mono)'}}>{user}</div>
    </div>
  );
}

// Left rail nav — only Dashboard active for now.
function NavRail({ dark=false, w=56 }) {
  const ic = (d) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={d}/></svg>;
  const items = [
    { k:"dash",   label:"Dashboard", icon:"M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z", on:true },
    { k:"queue",  label:"Queue",     icon:"M3 6h18M3 12h18M3 18h18", on:false },
    { k:"agents", label:"Agents",    icon:"M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z", on:false },
    { k:"audit",  label:"Audit",     icon:"M9 11l3 3 8-8M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0z", on:false },
    { k:"set",    label:"Settings",  icon:"M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M19 12l2 1-1 3-2-1m-12 0l-2 1 1 3 2-1m12-9l1-2-3-1-1 2m-8 0l-1-2-3 1 1 2", on:false },
  ];
  const bg     = dark ? '#1c1f25' : '#faf8f2';
  const border = dark ? '#2a2e36' : 'var(--line)';
  return (
    <div style={{
      width: w, borderRight: `1px solid ${border}`,
      background: bg, display:'flex', flexDirection:'column',
      alignItems:'center', padding: '12px 0', gap: 4, flexShrink: 0,
    }}>
      <div style={{
        width: 26, height: 26, background:'var(--accent)', color:'#fff',
        fontFamily:'var(--font-mono)', fontWeight: 700, fontSize: 11,
        display:'flex', alignItems:'center', justifyContent:'center',
        borderRadius: 4, marginBottom: 12,
      }}>B</div>
      {items.map(it => (
        <div key={it.k} title={it.label} style={{
          width: 36, height: 36, display:'flex', alignItems:'center', justifyContent:'center',
          borderRadius: 4, cursor: it.on ? 'default' : 'pointer',
          background: it.on ? (dark ? '#2c3038' : 'var(--paper-2)') : 'transparent',
          color: it.on ? (dark ? '#fff' : 'var(--ink)') : (dark ? '#6e6e6e' : 'var(--ink-3)'),
          opacity: it.on ? 1 : .55,
          position: 'relative',
        }}>
          {it.on && <span style={{position:'absolute', left:0, top: 6, bottom: 6, width: 2, background:'var(--accent)', borderRadius: 1}}/>}
          {ic(it.icon)}
        </div>
      ))}
      <div style={{flex:1}}/>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize: 9, color: dark ? '#5a5a5a' : 'var(--ink-4)',
        writingMode:'vertical-rl', transform:'rotate(180deg)', letterSpacing:'.1em',
      }}>BMS · v0.4</div>
    </div>
  );
}

function RiskTag({ risk }) {
  const m = { HIGH:"red", MEDIUM:"amber", LOW:"" }[risk] || "";
  return <span className={`tag ${m}`}>{risk}</span>;
}
function CrdeTag({ v, solid=false }) {
  if (!v) return null;
  const m = v === "APPROVED" ? "green" : v === "REJECTED" ? "red" : "amber";
  return <span className={`tag ${solid ? "solid-"+m : m}`}>{v}</span>;
}
function StateTag({ s }) {
  if (s === "running") return <span className="tag run"><span className="dot run"/> RUNNING</span>;
  if (s === "ready")   return <span className="tag ready"><span className="dot"/> READY</span>;
  if (s === "queued")  return <span className="tag"><span className="dot muted"/> QUEUED</span>;
  if (s === "decided") return <span className="tag"><span className="dot muted"/> DECIDED</span>;
  return null;
}

// Mini agent live screen
function AgentScreen({ size="md", showLog=true, label="APP-003" }) {
  return (
    <div className="agent-screen" style={{height: size==="lg" ? 280 : size==="sm" ? 100 : 160}}>
      <div className="live-badge"><i/> LIVE · {label}</div>
      <div className="browser" style={{width: size==="sm" ? "70%" : "78%"}}>
        <div className="urlbar"><i/><i/><i/></div>
        <div className="body">
          <div className="skel w20 h6"/>
          <div className="skel w80"/>
          <div className="skel w60"/>
          <div className="skel w40"/>
          <div className="skel w80"/>
          <div className="skel w60"/>
        </div>
      </div>
    </div>
  );
}

// Loan card (used in pipeline columns)
function LoanCard({ l, compact=false, sel=false, showProgress=false }) {
  return (
    <div className="card" style={sel ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)' } : null}>
      <div className="row1">
        <span className="appid">{l.id}</span>
        <div className="spacer" style={{flex:1}}/>
        {l.state === "running" && <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--blue)'}}>{l.pct||0}%</span>}
        {l.state === "decided" && <CrdeTag v={l.decision}/>}
      </div>
      <div className="name">{l.name}</div>
      <div className="meta">{l.prod} · {l.amt}</div>
      {!compact && (
        <div className="tags">
          <RiskTag risk={l.risk}/>
          {l.state !== "queued" && <CrdeTag v={l.crde}/>}
        </div>
      )}
      {showProgress && l.state === "running" && (
        <div className="progress"><div className="fill" style={{width:`${l.pct||0}%`}}/></div>
      )}
    </div>
  );
}

// Sticky note (handwritten margin annotation)
function MarginNote({ children, style }) {
  return (
    <div style={{
      fontFamily: 'var(--font-hand)', color: 'var(--accent)', fontSize: 18,
      lineHeight: 1.2, ...style
    }}>{children}</div>
  );
}

// Sketch box
function SketchBox({ children, style }) {
  return <div className="sketch-box" style={style}>{children}</div>;
}

Object.assign(window, {
  SAMPLE_LOANS, Topbar, NavRail, RiskTag, CrdeTag, StateTag, AgentScreen, LoanCard,
  MarginNote, SketchBox,
});

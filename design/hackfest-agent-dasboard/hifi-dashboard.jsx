// Hi-fi Dashboard — D3 Triage-First, navy corporate-banking aesthetic.

const { useState: useS } = React;

const queued  = HIFI_LOANS.filter(l => l.state === "queued");
const running = HIFI_LOANS.filter(l => l.state === "running");
const ready   = HIFI_LOANS.filter(l => l.state === "ready");
const decided = HIFI_LOANS.filter(l => l.state === "decided");

// Section header — subtle, serif
function SectionHead({ title, sub, right }) {
  return (
    <div style={{display:'flex', alignItems:'flex-end', gap:14, padding:'18px 24px 12px', borderBottom:'1px solid var(--line)'}}>
      <div>
        <h2 style={{
          margin:0, fontFamily:'var(--font-serif)', fontWeight:600,
          fontSize:18, letterSpacing:'-0.01em', color:'var(--ink)',
        }}>{title}</h2>
        {sub && <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)', marginTop:3, letterSpacing:'.02em'}}>{sub}</div>}
      </div>
      <div style={{flex:1}}/>
      {right}
    </div>
  );
}

// "Needs attention" hero card — the biggest reason to use this dashboard
function AttentionCard({ l }) {
  const isReject = l.crde === "REJECTED";
  return (
    <div className={"card " + (isReject ? "hot red" : "hot")}>
      <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:8}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{l.id}</span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-4)'}}>·</span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-4)'}}>agent done {l.agentDoneAt} · {l.elapsed}</span>
        <div style={{flex:1}}/>
        <RiskTag risk={l.risk}/>
      </div>
      <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:2}}>
        <h3 style={{margin:0, fontFamily:'var(--font-serif)', fontSize:22, fontWeight:600, letterSpacing:'-0.015em'}}>{l.name}</h3>
      </div>
      <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)', marginBottom:14, letterSpacing:'.02em'}}>
        {l.prod} · {l.amt} · {l.tenor} · {l.purpose}
      </div>

      {/* AI rec block */}
      <div style={{
        padding:'12px 14px',
        background: isReject ? 'var(--red-soft)' : 'var(--amber-soft)',
        border:'1px solid ' + (isReject ? 'var(--red-line)' : 'var(--amber-line)'),
        borderRadius:'var(--r)',
        marginBottom:12,
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
          <span style={{fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:'.1em', color: isReject ? 'var(--red)' : 'var(--amber)'}}>AI recommendation</span>
          <CrdeTag v={l.crde} solid/>
          <div style={{flex:1}}/>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color: isReject ? 'var(--red)' : 'var(--amber)'}}>Score {l.score}/1000</span>
        </div>
        <ul style={{margin:0, paddingLeft:18, fontSize:12, lineHeight:1.6, color:'var(--ink-2)'}}>
          {l.flags.slice(0,3).map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>

      {/* Metrics strip */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, marginBottom:14, border:'1px solid var(--line)', borderRadius:'var(--r)'}}>
        {[
          ["DTI", `${l.dti}%`,  l.dti > 40 ? "red" : ""],
          ["SLIK", l.slik,      l.slik !== "Kol.1" ? "amber" : ""],
          ["AML", l.aml,        ""],
          ["Rules", l.rules,    l.rules > 2 ? "red" : l.rules > 0 ? "amber" : ""],
        ].map(([k, v, color], i) => (
          <div key={k} style={{padding:'8px 12px', borderRight: i < 3 ? '1px solid var(--line)' : 0}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'.08em'}}>{k}</div>
            <div style={{
              fontFamily:'var(--font-mono)', fontSize:14, fontWeight:500,
              color: color === "red" ? 'var(--red)' : color === "amber" ? 'var(--amber)' : 'var(--ink)',
            }}>{v}</div>
          </div>
        ))}
      </div>

      <a href="Review.html" className="btn primary" style={{width:'100%'}}>
        Open & decide →
      </a>
    </div>
  );
}

// Queue row in left panel
function QueueRow({ l, sel, onToggle, kind = "queued" }) {
  const isReady   = l.state === "ready";
  const isRun     = l.state === "running";
  const isDec     = l.state === "decided";
  return (
    <div
      onClick={() => kind === "queued" && onToggle && onToggle(l.id)}
      style={{
        display:'grid', gridTemplateColumns:'auto 64px 1fr auto', gap:10,
        alignItems:'center', padding:'10px 12px',
        borderLeft:'2px solid ' + (sel ? 'var(--accent)' : 'transparent'),
        background: sel ? 'var(--accent-soft)' : 'transparent',
        borderBottom:'1px solid var(--line)',
        cursor: kind === "queued" ? 'pointer' : 'default',
        opacity: isDec ? 0.5 : 1,
      }}
    >
      {kind === "queued" ? (
        <div style={{
          width:14, height:14, border:'1.5px solid ' + (sel ? 'var(--accent)' : 'var(--ink-4)'),
          borderRadius:2, background: sel ? 'var(--accent)' : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {sel && <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M3 8l3 3 7-7"/></svg>}
        </div>
      ) : (
        <span/>
      )}
      <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{l.id}</span>
      <div>
        <div style={{fontWeight:500, fontSize:13, color:'var(--ink)'}}>{l.name}</div>
        <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-3)', marginTop:1}}>
          {l.prod} · {l.amtShort}
        </div>
      </div>
      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3}}>
        {isRun  && <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--blue)'}}>{l.pct}%</span>}
        {isReady && <CrdeTag v={l.crde}/>}
        {isDec && <CrdeTag v={l.decision}/>}
        {kind === "queued" && <RiskTag risk={l.risk}/>}
      </div>
    </div>
  );
}

// Running agent compact card
function RunningAgentCard({ l, liveOn }) {
  return (
    <div className="card" style={{padding:14}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{l.id}</span>
        <span style={{fontWeight:500, fontSize:13}}>{l.name}</span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-4)'}}>· {l.prod} · {l.amtShort}</span>
        <div style={{flex:1}}/>
        <StateTag s="running" pct={l.pct}/>
      </div>
      <LiveOrOff liveOn={liveOn} size="md" label={l.id} page={
        l.pct < 30 ? "data-keuangan" : l.pct < 60 ? "slik-ojk" : "hasil-crde"
      }/>
      <div style={{marginTop:10, display:'flex', alignItems:'center', gap:8}}>
        <div className="bar" style={{flex:1}}><div className="fill" style={{width:`${l.pct}%`}}/></div>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-3)', minWidth:60, textAlign:'right'}}>
          {l.elapsed}
        </span>
      </div>
      <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-3)', marginTop:6}}>
        ▶ {l.currentStep}
      </div>
    </div>
  );
}

// Decided row
function DecidedRow({ l }) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'auto 1fr auto auto auto',
      gap:14, alignItems:'center', padding:'10px 0',
      borderBottom:'1px solid var(--line)',
      fontSize:12,
    }}>
      <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)', minWidth:60}}>{l.id}</span>
      <span style={{color:'var(--ink-2)'}}>{l.name}</span>
      <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-3)'}}>{l.prod} · {l.amtShort}</span>
      <CrdeTag v={l.decision}/>
      <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-4)'}}>{l.analyst} · {l.decidedAt}</span>
    </div>
  );
}

function Dashboard() {
  const [agentMode, setAgentMode] = useS("real");
  const [liveStates, setLiveStates] = useS(() => window.__liveStates || {});
  const [sel, setSel] = useS(new Set(["APP-002", "APP-005"]));
  const [search, setSearch] = useS("");

  // Subscribe to per-task live-view toggles published by the Tweaks panel
  React.useEffect(() => {
    const handler = (e) => setLiveStates({ ...e.detail });
    window.addEventListener("liveStatesChanged", handler);
    // pick up any state already published before mount
    if (window.__liveStates) setLiveStates({ ...window.__liveStates });
    return () => window.removeEventListener("liveStatesChanged", handler);
  }, []);

  // Global "Live view" topbar toggle = ALL on / ALL off across all tasks
  const liveOn  = Object.values(liveStates).some(Boolean);
  const setLiveOn = (v) => {
    const patch = {};
    running.forEach(l => { patch[`live_${l.id}`] = !!v; });
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
    // optimistic local update
    const next = { ...liveStates };
    running.forEach(l => { next[l.id] = !!v; });
    setLiveStates(next);
  };

  const toggle = (id) => {
    setSel(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const visibleQueue = queued.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase())
  );

  // Sort ready by risk DESC for triage
  const triaged = [...ready].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.risk] - order[b.risk];
  });

  return (
    <div className="app">
      <div className="app-rail"><NavRail active="dash"/></div>
      <div className="app-top">
        <Topbar
          crumbs={["Pipeline", "Triage"]}
          agentMode={agentMode} onAgentMode={setAgentMode}
          liveOn={liveOn} onLive={setLiveOn}
        />
      </div>
      <div className="app-main">
        <SimBanner on={agentMode === "sim"}/>

        {/* Page header + stats */}
        <div className="page-head">
          <div>
            <h1>Pipeline · Triage</h1>
            <div className="sub">Sunday, 26 April 2026 · 10 active applications</div>
          </div>
          <div style={{flex:1}}/>
          <div className="stats" style={{minWidth:680}}>
            <div className="stat">
              <span className="lbl">In queue</span>
              <span className="val">{queued.length}</span>
            </div>
            <div className="stat">
              <span className="lbl">Running</span>
              <span className="val accent">{running.length}</span>
              <span className="delta">2 of 5 max parallel</span>
            </div>
            <div className="stat">
              <span className="lbl">Ready · need decision</span>
              <span className="val" style={{color:'var(--red)'}}>{ready.length}</span>
              <span className="delta">1 high-risk</span>
            </div>
            <div className="stat">
              <span className="lbl">Decided today</span>
              <span className="val">{decided.length}</span>
              <span className="delta up">↑ 33% vs avg</span>
            </div>
            <div className="stat">
              <span className="lbl">Avg agent time</span>
              <span className="val">3:42</span>
              <span className="delta">vs 47 min manual</span>
            </div>
          </div>
        </div>

        {/* ATTENTION STRIP — biggest, most important section */}
        <div style={{padding:'12px 24px 0'}}>
          <SectionHead
            title="Needs your attention"
            sub={`${triaged.length} applications ready · sorted by risk`}
            right={
              <div style={{display:'flex', gap:8}}>
                <button className="btn outline" style={{padding:'5px 10px', fontSize:12}}>Sort: Risk ▾</button>
                <button className="btn outline" style={{padding:'5px 10px', fontSize:12}}>Filter ▾</button>
              </div>
            }
          />
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14, padding:'14px 0 0'}}>
            {triaged.map(l => <AttentionCard key={l.id} l={l}/>)}
          </div>
        </div>

        {/* Bottom: Queue (left) + Agents working (right) */}
        <div style={{padding:'24px', display:'grid', gridTemplateColumns:'380px 1fr', gap:14}}>
          {/* Queue panel */}
          <div className="card" style={{padding:0, overflow:'hidden', display:'flex', flexDirection:'column', alignSelf:'flex-start'}}>
            <SectionHead
              title="Loan queue"
              sub={`${queued.length} pending`}
            />
            <div style={{padding:'12px 14px 0'}}>
              <input className="search" placeholder="Search by name or APP ID…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <div style={{padding:'12px 0 0', maxHeight:420, overflow:'auto'}}>
              {visibleQueue.map(l => (
                <QueueRow key={l.id} l={l} sel={sel.has(l.id)} onToggle={toggle}/>
              ))}
            </div>
            <div style={{padding:14, borderTop:'1px solid var(--line)', display:'flex', alignItems:'center', gap:10}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>
                {sel.size} selected
              </span>
              <div style={{flex:1}}/>
              <button className="btn primary" disabled={sel.size === 0} style={{padding:'8px 14px'}}>
                ▶ Run review
              </button>
            </div>
          </div>

          {/* Agents working */}
          <div>
            <SectionHead
              title="Agents working"
              sub={`${running.length} of 5 max parallel`}
              right={
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-3)'}}>
                    Auto-refresh · 2s
                  </span>
                  <button className="btn outline" style={{padding:'5px 10px', fontSize:12}}>Cinema mode</button>
                </div>
              }
            />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, padding:'14px 0 0'}}>
              {running.map(l => <RunningAgentCard key={l.id} l={l} liveOn={liveStates[l.id] ?? true}/>)}
            </div>

            {/* Decided today */}
            <div style={{marginTop:24}}>
              <SectionHead
                title="Decided today"
                sub={`${decided.length} applications`}
                right={<button className="btn outline" style={{padding:'5px 10px', fontSize:12}}>View audit log →</button>}
              />
              <div style={{padding:'8px 4px 0'}}>
                {decided.map(l => <DecidedRow key={l.id} l={l}/>)}
              </div>
            </div>
          </div>
        </div>

        <div style={{height:32}}/>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Dashboard/>);

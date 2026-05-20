// 5 dashboard direction wireframes
// All ~1280×800 frames so they read at canvas-zoom levels.

const queued  = SAMPLE_LOANS.filter(l => l.state === "queued");
const running = SAMPLE_LOANS.filter(l => l.state === "running");
const ready   = SAMPLE_LOANS.filter(l => l.state === "ready");
const decided = SAMPLE_LOANS.filter(l => l.state === "decided");

// Shell that owns Real/Sim + Live-view state and renders the nav rail + topbar
// for every dashboard direction. The frame's content is a function of (live).
function DashShell({ section, dark=false, children }) {
  const [agentMode, setAgentMode] = React.useState("real");
  const [liveOn, setLiveOn] = React.useState(true);
  return (
    <div className="wf wf-app" style={dark ? {background:'#15171c'} : null}>
      <div style={{display:'flex', flex: 1, minHeight: 0}}>
        <NavRail dark={dark}/>
        <div style={{flex:1, display:'flex', flexDirection:'column', minWidth: 0}}>
          <Topbar section={section} dark={dark}
            agentMode={agentMode} onAgentMode={setAgentMode}
            liveOn={liveOn} onLive={setLiveOn} />
          {agentMode === "sim" && (
            <div style={{
              padding:'6px 16px',
              background: dark ? 'rgba(217,119,66,.12)' : 'rgba(217,119,66,.08)',
              borderBottom: '1px solid '+(dark ? '#3a2e26' : 'var(--accent-soft)'),
              fontFamily:'var(--font-mono)', fontSize: 10,
              color: dark ? '#e6c890' : 'var(--accent)',
              display:'flex', alignItems:'center', gap: 8,
            }}>
              <span>⚙</span>
              <span>SIMULATION MODE — agents replay seeded fixtures (no live LOS calls). Useful for demo & dev.</span>
            </div>
          )}
          <div style={{flex:1, display:'flex', flexDirection:'column', minHeight: 0}}>
            {children({ liveOn, agentMode })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Live-or-placeholder: shows browser stream when liveOn=true, else a collapsed strip
function LiveOrCollapsed({ liveOn, size="md", label, dark=false }) {
  if (liveOn) return <AgentScreen size={size} label={label}/>;
  return (
    <div style={{
      height: size==="lg" ? 280 : size==="sm" ? 100 : 160,
      border:'1px dashed '+(dark ? '#3a3e46' : 'var(--line-2)'),
      background: dark ? '#1c1f25' : 'var(--paper)',
      borderRadius: 2, display:'flex', alignItems:'center', justifyContent:'center',
      color: dark ? '#6e6e6e' : 'var(--ink-3)',
      fontFamily:'var(--font-mono)', fontSize: 11, gap: 8,
    }}>
      <span style={{opacity:.6}}>👁</span> Live view hidden · click to show
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Direction 1 — Classic Kanban Pipeline
// ───────────────────────────────────────────────────────────
function D1ClassicKanban() {
  return (
    <DashShell section="Pipeline · 10 applications today">
      {({ liveOn }) => (
        <div style={{padding: 16, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12, flex: 1, minHeight: 0}}>
          <div className="pipe-col">
            <div className="col-h">Queue <span className="count">{queued.length}</span><div style={{flex:1}}/><span style={{fontSize:10, fontFamily:'var(--font-mono)', color:'var(--ink-3)'}}>2 selected</span></div>
            <div className="col-body">
              <LoanCard l={queued[0]} sel/>
              <LoanCard l={queued[1]} sel/>
              <LoanCard l={queued[2]}/>
            </div>
            <button className="btn accent" style={{width:'100%', marginTop: 6}}>▶ Run review · 2 selected</button>
          </div>
          <div className="pipe-col">
            <div className="col-h">Agent running <span className="count">{running.length}</span></div>
            <div className="col-body">
              {running.map(l => (
                <div key={l.id} className="card">
                  <div className="row1">
                    <span className="appid">{l.id}</span>
                    <div style={{flex:1}}/>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--blue)'}}>{l.pct}%</span>
                  </div>
                  <div className="name">{l.name}</div>
                  <div className="meta">{l.prod} · {l.amt}</div>
                  <LiveOrCollapsed liveOn={liveOn} size="sm" label={l.id}/>
                  <div className="log" style={{marginTop:6}}>
                    <div className="line"><span className="t">›</span><span className="ok">✓ Login successful</span></div>
                    <div className="line"><span className="t">›</span><span className="now">Reading SLIK OJK…</span></div>
                  </div>
                  <div className="progress"><div className="fill" style={{width:`${l.pct}%`}}/></div>
                </div>
              ))}
            </div>
          </div>
          <div className="pipe-col">
            <div className="col-h">Ready to review <span className="count">{ready.length}</span></div>
            <div className="col-body">
              {ready.map(l => (
                <div key={l.id} className="card hot" style={{borderColor:'var(--accent)'}}>
                  <div className="row1"><span className="appid">{l.id}</span><div style={{flex:1}}/><CrdeTag v={l.crde} solid/></div>
                  <div className="name">{l.name}</div>
                  <div className="meta">{l.prod} · {l.amt}</div>
                  <div className="tags"><RiskTag risk={l.risk}/><span className="tag">DTI 73%</span><span className="tag">Kol.2</span></div>
                  <button className="btn outline" style={{width:'100%', marginTop:8, justifyContent:'center'}}>Open & chat →</button>
                </div>
              ))}
            </div>
          </div>
          <div className="pipe-col">
            <div className="col-h">Decided <span className="count">{decided.length}</span></div>
            <div className="col-body">
              {decided.map(l => (
                <div key={l.id} className="card" style={{opacity:.65}}>
                  <div className="row1"><span className="appid">{l.id}</span><div style={{flex:1}}/><CrdeTag v={l.decision}/></div>
                  <div className="name">{l.name}</div>
                  <div className="meta">{l.prod} · {l.amt}</div>
                  <div className="meta" style={{marginTop:6}}>analyst01 · 14:32</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashShell>
  );
}

// ───────────────────────────────────────────────────────────
// Direction 2 — Pipeline + Featured Live Agent (split top/bottom)
// ───────────────────────────────────────────────────────────
function D2PipelineFeatured() {
  return (
    <DashShell section="Command — APP-006 featured">
      {({ liveOn }) => (
        <>
          <div style={{padding: 16, paddingBottom: 0}}>
            <div className="stat-strip">
              <div className="stat"><div className="lbl">In queue</div><div className="val">{queued.length}</div></div>
              <div className="stat"><div className="lbl">Agents running</div><div className="val accent">{running.length}</div></div>
              <div className="stat"><div className="lbl">Ready to decide</div><div className="val">{ready.length}</div></div>
              <div className="stat"><div className="lbl">Decided today</div><div className="val">{decided.length}</div></div>
              <div className="stat"><div className="lbl">Avg agent time</div><div className="val">3:42</div></div>
            </div>
          </div>

          <div style={{padding: 16, display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr', gap: 12, flex: 1, minHeight: 0}}>
            <div style={{border:'1px solid var(--line)', background:'#fff', padding: 14, borderRadius: 2, display:'flex', flexDirection:'column'}}>
              <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom: 6}}>
                <span className="appid" style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>APP-006</span>
                <span style={{fontWeight:700, fontSize:16}}>Rina Susanti</span>
                <span className="meta" style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>KTA · Rp 25jt</span>
                <div style={{flex:1}}/>
                <span className="tag run"><span className="dot run"/> AGENT RUNNING · 1m 13s</span>
              </div>
              <LiveOrCollapsed liveOn={liveOn} size="lg" label="APP-006"/>
              <div className="log" style={{marginTop: 10, padding: 10, background:'var(--paper)', border:'1px solid var(--line)', borderRadius: 2, height: 120, overflow:'auto'}}>
                <div className="line"><span className="t">14:32:01</span><span className="ok">✓ Opened LOS</span></div>
                <div className="line"><span className="t">14:32:04</span><span className="ok">✓ Login successful</span></div>
                <div className="line"><span className="t">14:32:09</span><span className="ok">✓ Read Profil Debitur</span></div>
                <div className="line"><span className="t">14:32:18</span><span className="ok">✓ Read Data Keuangan — DTI 29%</span></div>
                <div className="line"><span className="t">14:32:24</span><span className="now">▌Reading SLIK OJK…</span></div>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8, minHeight: 0}}>
              <div className="pipe-col">
                <div className="col-h">Queue<span className="count">{queued.length}</span></div>
                {queued.slice(0,3).map(l => <LoanCard key={l.id} l={l} compact/>)}
              </div>
              <div className="pipe-col">
                <div className="col-h">Running<span className="count">{running.length}</span></div>
                {running.map(l => (
                  <div key={l.id} className="card" style={l.id==="APP-006" ? {borderColor:'var(--accent)', boxShadow:'0 0 0 1px var(--accent)'} : null}>
                    <div className="row1"><span className="appid">{l.id}</span><div style={{flex:1}}/><span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--blue)'}}>{l.pct}%</span></div>
                    <div className="name" style={{fontSize:12}}>{l.name}</div>
                    <div className="progress"><div className="fill" style={{width:`${l.pct}%`}}/></div>
                  </div>
                ))}
              </div>
              <div className="pipe-col">
                <div className="col-h">Ready<span className="count">{ready.length}</span></div>
                {ready.map(l => <LoanCard key={l.id} l={l} compact/>)}
              </div>
              <div className="pipe-col">
                <div className="col-h">Decided<span className="count">{decided.length}</span></div>
                {decided.slice(0,3).map(l => (
                  <div key={l.id} className="card" style={{opacity:.65}}>
                    <div className="row1"><span className="appid">{l.id}</span><div style={{flex:1}}/><CrdeTag v={l.decision}/></div>
                    <div className="name" style={{fontSize:12}}>{l.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </DashShell>
  );
}

// ───────────────────────────────────────────────────────────
// Direction 3 — Triage-First (attention-required up top)
// ───────────────────────────────────────────────────────────
function D3TriageFirst() {
  return (
    <DashShell section="Triage · 3 require attention">
      {({ liveOn }) => (
      <div style={{padding: 16, display:'flex', flexDirection:'column', gap: 12, flex: 1, minHeight: 0}}>
        {/* Attention strip */}
        <div>
          <div style={{display:'flex', alignItems:'baseline', gap: 12, marginBottom: 8}}>
            <h2 style={{margin:0, fontFamily:'var(--font-disp)', fontSize: 20, fontWeight:700, letterSpacing: '.03em'}}>Needs your attention</h2>
            <span style={{fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--ink-3)'}}>3 ready · sorted by risk</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12}}>
            {ready.concat([decided[2]]).slice(0,3).map((l,i) => (
              <div key={i} className="card hot" style={{padding: 14, borderColor:'var(--accent)'}}>
                <div className="row1">
                  <span className="appid">{l.id}</span>
                  <div style={{flex:1}}/>
                  <RiskTag risk={l.risk}/>
                </div>
                <div className="name" style={{fontSize:15, marginTop: 2}}>{l.name}</div>
                <div className="meta">{l.prod} · {l.amt}</div>
                <div style={{marginTop: 10, padding: 10, background:'var(--paper)', border:'1px solid var(--line)', borderRadius:2}}>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.08em'}}>AI recommendation</div>
                  <div style={{display:'flex', alignItems:'center', gap: 8, marginTop: 4}}>
                    <CrdeTag v={l.crde || l.decision} solid/>
                    <span style={{fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--ink-2)'}}>Score 298/1000</span>
                  </div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--ink-2)', marginTop: 6, lineHeight: 1.5}}>
                    DTI 73% exceeds RAC limit · SLIK Kol.2 · address inconsistency flag
                  </div>
                </div>
                <button className="btn accent" style={{width:'100%', marginTop: 10, justifyContent:'center'}}>Open & decide →</button>
              </div>
            ))}
          </div>
        </div>

        {/* Lower split: queue + agents working */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1.4fr', gap: 12, flex: 1, minHeight: 0}}>
          <div className="pipe-col" style={{background:'#fff'}}>
            <div className="col-h">Queue <span className="count">{queued.length}</span><div style={{flex:1}}/>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-3)'}}>filter ▾  sort: risk ▾</span>
            </div>
            <div className="col-body" style={{borderTop:'1px solid var(--line)'}}>
              {queued.map((l,i) => (
                <div key={l.id} className={`qrow ${i<2 ? "sel" : ""}`}>
                  <div className={`check ${i<2 ? "on" : ""}`}/>
                  <span className="id">{l.id}</span>
                  <span className="n">{l.name}</span>
                  <span className="pr">{l.prod}</span>
                  <span className="am">{l.amt}</span>
                  <RiskTag risk={l.risk}/>
                </div>
              ))}
            </div>
            <div style={{padding: 10, borderTop:'1px solid var(--line)'}}>
              <button className="btn accent" style={{width:'100%', justifyContent:'center'}}>▶ Run review · 2 selected</button>
            </div>
          </div>

          <div style={{border:'1px solid var(--line)', background:'#fff', padding: 12, borderRadius: 2, display:'flex', flexDirection:'column'}}>
            <div className="col-h">Agents working <span className="count">{running.length}</span></div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, flex: 1}}>
              {running.map(l => (
                <div key={l.id} className="card" style={{margin:0}}>
                  <div className="row1"><span className="appid">{l.id}</span><span className="name" style={{fontSize:12}}>· {l.name}</span><div style={{flex:1}}/><span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--blue)'}}>{l.pct}%</span></div>
                  <LiveOrCollapsed liveOn={liveOn} size="sm" label={l.id}/>
                  <div className="progress" style={{marginTop: 8}}><div className="fill" style={{width:`${l.pct}%`}}/></div>
                  <div className="log" style={{marginTop:6}}>
                    <div className="line"><span className="t">›</span><span className="now">Reading SLIK OJK…</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </DashShell>
  );
}

// ───────────────────────────────────────────────────────────
// Direction 4 — Command Center (left rail pipeline + theater)
// ───────────────────────────────────────────────────────────
function D4CommandCenter() {
  return (
    <DashShell section="Command Center">
      {({ liveOn }) => (
      <div style={{display:'grid', gridTemplateColumns:'320px 1fr 280px', flex: 1, minHeight: 0}}>
        {/* Left: vertical pipeline rail */}
        <div className="side">
          <h3>Pipeline</h3>
          <div className="sub">10 applications · today</div>
          {[
            ["QUEUE", queued.slice(0,3), "muted"],
            ["RUNNING", running, "run"],
            ["READY", ready, "ready"],
            ["DECIDED", decided.slice(0,2), "muted"],
          ].map(([label, list, dot]) => (
            <div key={label} style={{padding: '0 14px 10px', borderTop:'1px solid var(--line)'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 0'}}>
                <span className={`dot ${dot}`}/>
                <span style={{fontFamily:'var(--font-disp)', fontWeight:600, fontSize: 11, textTransform:'uppercase', letterSpacing:'.08em'}}>{label}</span>
                <span className="count" style={{background:'var(--paper-2)', padding:'1px 6px', borderRadius: 2, fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--ink-3)'}}>{list.length}</span>
              </div>
              {list.map(l => (
                <div key={l.id} style={{padding:'6px 0', borderTop:'1px dashed var(--line)', fontSize: 11, fontFamily:'var(--font-mono)'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <span style={{color:'var(--ink-3)'}}>{l.id}</span>
                    <span style={{color:'var(--ink)'}}>{l.amt}</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 2}}>
                    <span style={{color:'var(--ink-2)', fontFamily:'var(--font-sans)', fontSize: 12}}>{l.name}</span>
                    {label==="RUNNING" && <span style={{color:'var(--blue)', fontSize:10}}>{l.pct}%</span>}
                    {label==="READY" && <CrdeTag v={l.crde}/>}
                    {label==="DECIDED" && <CrdeTag v={l.decision}/>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Center: agent theater */}
        <div style={{display:'flex', flexDirection:'column', padding: 16, gap: 12, minHeight: 0}}>
          <div style={{display:'flex', alignItems:'baseline', gap: 12}}>
            <h2 style={{margin:0, fontFamily:'var(--font-disp)', fontSize: 20, fontWeight:700}}>Agent theater</h2>
            <span style={{fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--ink-3)'}}>2 of 5 running</span>
            <div style={{flex:1}}/>
            <button className="btn outline">⊞ Grid</button>
            <button className="btn outline">▶ Cinema mode</button>
          </div>
          {/* Featured + sub thumbnails */}
          <div style={{flex:1, display:'flex', flexDirection:'column', gap: 12, minHeight: 0}}>
            <div style={{flex: 1, position:'relative', minHeight: 0}}>
              <LiveOrCollapsed liveOn={liveOn} size="lg" label="APP-006"/>
              <div style={{position:'absolute', right: 12, top: 12, background:'rgba(0,0,0,.7)', color:'#fff', padding:'6px 10px', borderRadius: 2, fontFamily:'var(--font-mono)', fontSize: 11}}>
                APP-006 · Rina Susanti · 60%
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8}}>
              <div className="card hot" style={{margin:0, padding: 8, borderColor:'var(--accent)'}}>
                <div style={{fontFamily:'var(--font-mono)', fontSize:10}}>APP-006 · 60%</div>
                <LiveOrCollapsed liveOn={liveOn} size="sm"/>
              </div>
              <div className="card" style={{margin:0, padding: 8}}>
                <div style={{fontFamily:'var(--font-mono)', fontSize:10}}>APP-003 · 28%</div>
                <LiveOrCollapsed liveOn={liveOn} size="sm"/>
              </div>
              <div className="card" style={{margin:0, padding: 8, opacity:.5}}>
                <div style={{fontFamily:'var(--font-mono)', fontSize:10}}>+ slot</div>
                <div style={{height: 100, border:'1px dashed var(--line-2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-4)', fontSize:11}}>empty</div>
              </div>
              <div className="card" style={{margin:0, padding: 8, opacity:.5}}>
                <div style={{fontFamily:'var(--font-mono)', fontSize:10}}>+ slot</div>
                <div style={{height: 100, border:'1px dashed var(--line-2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-4)', fontSize:11}}>empty</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: log + actions */}
        <div style={{borderLeft:'1px solid var(--line)', background:'#faf8f2', display:'flex', flexDirection:'column', minHeight: 0}}>
          <div style={{padding: '12px 14px', borderBottom: '1px solid var(--line)'}}>
            <div style={{fontFamily:'var(--font-disp)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', fontSize: 12}}>APP-006 · Activity</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--ink-3)', marginTop:2}}>Live · 1m 13s elapsed</div>
          </div>
          <div className="log" style={{flex:1, padding: 12, overflow:'auto'}}>
            <div className="line"><span className="t">14:32:01</span><span className="ok">✓ Opened LOS</span></div>
            <div className="line"><span className="t">14:32:04</span><span className="ok">✓ Login successful</span></div>
            <div className="line"><span className="t">14:32:09</span><span className="ok">✓ Profil Debitur read</span></div>
            <div className="line"><span className="t">14:32:18</span><span className="ok">✓ Data Keuangan · DTI 29%</span></div>
            <div className="line"><span className="t">14:32:24</span><span className="now">▌SLIK OJK…</span></div>
          </div>
          <div style={{padding: 12, borderTop: '1px solid var(--line)'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom: 6}}>Step progress</div>
            <div className="progress"><div className="fill" style={{width:'60%'}}/></div>
            <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--ink-3)', marginTop: 4}}>5 of 10 · Reading SLIK OJK</div>
          </div>
        </div>
      </div>
      )}
    </DashShell>
  );
}

// ───────────────────────────────────────────────────────────
// Direction 5 (WILD CARD) — Cinema Grid + Status River
// ───────────────────────────────────────────────────────────
function D5CinemaGrid() {
  return (
    <DashShell section="Cinema Mode · 4 agents live" dark>
      {({ liveOn }) => (
      <>
      {/* River status (collapsed pipeline) */}
      <div style={{padding: '10px 16px', background:'#1c1f25', borderBottom:'1px solid #2a2e36'}}>
        <div className="river" style={{background:'#252830', borderColor:'#2a2e36', color:'#bdb9ad'}}>
          <div className="step on"><span className="num" style={{background:'var(--accent)'}}>3</span> QUEUE</div>
          <span className="arr">›</span>
          <div className="step on" style={{color:'#fff'}}><span className="num" style={{background:'var(--blue)'}}>2</span> RUNNING</div>
          <span className="arr">›</span>
          <div className="step on" style={{color:'#fff'}}><span className="num" style={{background:'var(--green)'}}>2</span> READY</div>
          <span className="arr">›</span>
          <div className="step"><span className="num" style={{background:'#3a3e46', color:'#bdb9ad'}}>3</span> DECIDED</div>
          <div style={{flex:1}}/>
          <span style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'#8a8a8a'}}>auto-refreshes · 2s</span>
        </div>
      </div>

      {/* Cinema grid: equal-real-estate live tiles */}
      <div style={{padding: 16, display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gridTemplateRows:'repeat(2, 1fr)', gap: 12, flex: 1, minHeight: 0}}>
        {[
          { id:"APP-006", name:"Rina Susanti", state:"running", pct: 60, step:"Reading SLIK OJK" },
          { id:"APP-003", name:"Ahmad Fauzi",  state:"running", pct: 28, step:"Reading Data Keuangan" },
          { id:"APP-010", name:"Yuli Andari",  state:"ready",   crde:"REJECTED" },
          { id:"APP-008", name:"Maya Putri",   state:"ready",   crde:"REFER" },
        ].map(t => (
          <div key={t.id} style={{background:'#1c1f25', border:'1px solid #2a2e36', borderRadius: 2, padding: 10, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom: 8}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize: 11, color:'#8a8a8a'}}>{t.id}</span>
              <span style={{fontWeight: 600, fontSize: 13, color:'#fff'}}>{t.name}</span>
              <div style={{flex:1}}/>
              {t.state === "running" && (
                <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'#7da3d4', border:'1px solid #2c4868', padding:'2px 6px', borderRadius:2}}>
                  ● RUNNING · {t.pct}%
                </span>
              )}
              {t.state === "ready" && (
                <span style={{fontFamily:'var(--font-mono)', fontSize:10, color: t.crde==="REJECTED" ? "#e89292" : "#e6c890", border:'1px solid '+(t.crde==="REJECTED" ? "#5a2a2a":"#5a4a2a"), padding:'2px 6px', borderRadius:2}}>
                  ● READY · {t.crde}
                </span>
              )}
            </div>
            <div style={{flex:1, position:'relative', minHeight: 0}}>
              <LiveOrCollapsed liveOn={liveOn} label={t.id} dark/>
            </div>
            {t.state === "running" ? (
              <>
                <div style={{height: 3, background:'#2a2e36', marginTop: 8}}>
                  <div style={{height:'100%', background:'var(--blue)', width: `${t.pct}%`}}/>
                </div>
                <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'#bdb9ad', marginTop: 6}}>▌ {t.step}</div>
              </>
            ) : (
              <button className="btn accent" style={{marginTop: 8, justifyContent:'center'}}>Open & decide →</button>
            )}
          </div>
        ))}
      </div>
      </>
      )}
    </DashShell>
  );
}

Object.assign(window, { D1ClassicKanban, D2PipelineFeatured, D3TriageFirst, D4CommandCenter, D5CinemaGrid });

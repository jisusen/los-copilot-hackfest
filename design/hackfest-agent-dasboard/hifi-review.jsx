// Hi-fi Review page — Memo + Chat (Detail #1, professionalized).

const { useState: useS2, useRef: useR2, useEffect: useE2 } = React;

// Sub-header (back / app id / actions)
function ReviewSubhead({ loan }) {
  return (
    <div style={{
      padding:'14px 24px', borderBottom:'1px solid var(--line)', background:'#fff',
      display:'flex', alignItems:'center', gap:14,
    }}>
      <a href="Dashboard.html" className="btn-ghost" style={{textTransform:'none', fontSize:12}}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        Back to pipeline
      </a>
      <div style={{height:18, width:1, background:'var(--line)'}}/>
      <div style={{display:'flex', alignItems:'baseline', gap:10}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{loan.id}</span>
        <span style={{fontFamily:'var(--font-serif)', fontSize:18, fontWeight:600, color:'var(--ink)'}}>{loan.name}</span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{loan.prod} · {loan.amt} · {loan.tenor}</span>
        <RiskTag risk={loan.risk}/>
      </div>
      <div style={{flex:1}}/>
      <button className="btn outline" style={{padding:'6px 12px', fontSize:12}}>
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print
      </button>
      <button className="btn outline" style={{padding:'6px 12px', fontSize:12}}>
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
        Share
      </button>
    </div>
  );
}

// CRDE banner — full-width, pinned just below subhead
function CrdeBanner({ memo }) {
  const isReject = memo.crde.decision === "DITOLAK" || memo.crde.decision === "REJECTED";
  const color = isReject ? "red" : memo.crde.decision === "REFER" ? "amber" : "green";
  const palette = {
    red: { bg:'var(--red-soft)',   border:'var(--red-line)',   text:'var(--red)' },
    amber: { bg:'var(--amber-soft)', border:'var(--amber-line)', text:'var(--amber)' },
    green: { bg:'var(--green-soft)', border:'var(--green-line)', text:'var(--green)' },
  }[color];
  return (
    <div style={{
      margin:'24px 0',
      padding:'18px 22px',
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      borderLeft: `4px solid ${palette.text}`,
      borderRadius: 'var(--r-lg)',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:8}}>
        <span style={{
          fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase',
          letterSpacing:'.1em', color: palette.text, fontWeight:600,
        }}>CRDE Recommendation</span>
        <CrdeTag v={memo.crde.decision} solid/>
        <div style={{flex:1}}/>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, color: palette.text}}>
          Risk {memo.crde.risk} · Score {memo.crde.score}/{memo.crde.scoreOut} · {memo.crde.rules.length} rules triggered
        </span>
      </div>
      <p style={{margin:0, fontSize:13, lineHeight:1.6, color:'var(--ink-2)'}}>
        Application does not meet minimum credit standards. Key deal-breakers:
        DTI 73.0% exceeds RAC limit (40%); SLIK collectability 2 (Special Mention) — repeated late payment history;
        income inconsistency between salary slip and bank-statement mutation;
        address mismatch between KTP and stated residence with insufficient supporting documents.
      </p>
    </div>
  );
}

// Section block (memo)
function MemoSection({ s, idx }) {
  return (
    <section style={{padding:'22px 0', borderTop:'1px solid var(--line)'}}>
      <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:12}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-4)', minWidth:24}}>
          {String(s.n).padStart(2,'0')}
        </span>
        <h3 style={{
          margin:0, fontFamily:'var(--font-serif)', fontSize:16, fontWeight:600,
          letterSpacing:'-0.005em', color:'var(--ink)',
        }}>{s.title}</h3>
        <div style={{flex:1}}/>
        <button className="btn-ghost" style={{padding:'3px 8px', fontSize:10}}>Copy</button>
      </div>

      {s.editable ? (
        <textarea
          placeholder="Add your override notes, mitigating factors, or final reasoning…"
          style={{
            width:'100%', minHeight:120,
            padding:14,
            border:'1px dashed var(--accent-line)',
            background:'var(--accent-soft)',
            borderRadius:'var(--r)',
            fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink)',
            resize:'vertical', outline:'none',
          }}
        />
      ) : (
        <>
          <dl style={{
            margin:0, display:'grid',
            gridTemplateColumns:'180px 1fr',
            gap:'8px 24px',
          }}>
            {s.body.map(([k, v], i) => (
              <React.Fragment key={i}>
                <dt style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.04em', paddingTop:1}}>
                  {k}
                </dt>
                <dd style={{margin:0, fontFamily:'var(--font-mono)', fontSize:13, color:'var(--ink)'}}>
                  {v}
                </dd>
              </React.Fragment>
            ))}
          </dl>
          {s.note && (
            <div style={{
              marginTop:14, padding:'10px 14px',
              background:'var(--red-soft)', borderLeft:'2px solid var(--red)',
              fontSize:12, color:'var(--ink-2)', fontStyle:'italic',
              borderRadius:'0 var(--r) var(--r) 0',
            }}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--red)', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginRight:8}}>RAC violation</span>
              {s.note}
            </div>
          )}
          {s.rules && (
            <ol style={{margin:'14px 0 0', paddingLeft:22, fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-2)', lineHeight:1.7}}>
              {s.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          )}
        </>
      )}
    </section>
  );
}

// Right rail: chat
function ChatPanel({ loan }) {
  const [messages, setMessages] = useS2(CHAT_THREAD);
  const [input, setInput] = useS2("");
  const [showSuggestions, setSS] = useS2(false);
  const scrollRef = useR2(null);

  useE2(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const send = (text) => {
    const t = text || input.trim();
    if (!t) return;
    setMessages([...messages, { role: "analyst", time: "14:35", text: t },
      { role: "copilot", time: "14:35", text: "(In a real session, the copilot would stream a response here, citing the relevant memo sections.)", citations: [] }
    ]);
    setInput("");
  };

  return (
    <div style={{
      display:'flex', flexDirection:'column',
      height:'100%',
      background:'#fff',
      borderLeft:'1px solid var(--line)',
    }}>
      {/* Chat header */}
      <div style={{padding:'18px 20px 14px', borderBottom:'1px solid var(--line)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
          <div style={{
            width:24, height:24, background:'var(--accent)', color:'#fff',
            borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-serif)', fontWeight:700, fontSize:12,
          }}>C</div>
          <h3 style={{margin:0, fontFamily:'var(--font-serif)', fontSize:15, fontWeight:600}}>Copilot Chat</h3>
          <div style={{flex:1}}/>
          <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-4)'}}>
            <span style={{display:'inline-block', width:6, height:6, borderRadius:'50%', background:'var(--green)', marginRight:4}}/>
            Connected
          </span>
        </div>
        <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-3)', letterSpacing:'.02em'}}>
          Scoped to {loan.id} · grounded in agent-extracted LOS data
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{flex:1, overflow:'auto', padding:'18px 20px', display:'flex', flexDirection:'column', gap:18}}>
        {messages.map((m, i) => (
          <div key={i}>
            <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:6}}>
              <span style={{
                fontFamily:'var(--font-mono)', fontSize:10, fontWeight:600,
                color: m.role === "analyst" ? 'var(--ink-2)' : 'var(--accent)',
                textTransform:'uppercase', letterSpacing:'.08em',
              }}>{m.role === "analyst" ? "Analyst" : "Copilot"}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-4)'}}>{m.time}</span>
            </div>
            <div style={{
              fontSize:13, lineHeight:1.6,
              color: m.role === "analyst" ? 'var(--ink)' : 'var(--ink-2)',
              fontFamily: m.role === "analyst" ? 'var(--font-sans)' : 'var(--font-mono)',
              padding: m.role === "copilot" ? '12px 14px' : 0,
              background: m.role === "copilot" ? 'var(--paper-2)' : 'transparent',
              border: m.role === "copilot" ? '1px solid var(--line)' : 'none',
              borderRadius: m.role === "copilot" ? 'var(--r)' : 0,
              whiteSpace: 'pre-wrap',
            }}>{m.text}</div>
            {m.role === "copilot" && m.citations && m.citations.length > 0 && (
              <div style={{display:'flex', gap:6, marginTop:8, flexWrap:'wrap'}}>
                {m.citations.map((c, j) => (
                  <span key={j} className="tag" style={{fontSize:9, padding:'2px 6px'}}>
                    <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:2}}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested questions */}
      {showSuggestions && (
        <div style={{padding:'12px 20px', borderTop:'1px solid var(--line)', background:'var(--paper)'}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>
            Suggested questions
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:6}}>
            {SUGGESTED_QS.map((q, i) => (
              <button key={i} onClick={() => { send(q); setSS(false); }} style={{
                textAlign:'left', border:'1px solid var(--line)', background:'#fff',
                padding:'8px 10px', borderRadius:'var(--r)',
                fontSize:12, color:'var(--ink-2)', cursor:'pointer',
                fontFamily:'var(--font-sans)',
              }}>› {q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{padding:'12px 20px', borderTop:'1px solid var(--line)'}}>
        <div style={{position:'relative', display:'flex', gap:8}}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this application…"
            onFocus={() => setSS(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            style={{
              flex:1, padding:'10px 12px', minHeight:42, maxHeight:120,
              border:'1px solid var(--line)', borderRadius:'var(--r)',
              fontFamily:'var(--font-sans)', fontSize:13,
              outline:'none', resize:'none',
              color:'var(--ink)',
            }}
          />
          <button className="btn primary" onClick={() => send()} style={{padding:'8px 14px', alignSelf:'flex-end'}}>
            Send
          </button>
        </div>
        <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-4)', marginTop:6}}>
          Enter — send · Shift+Enter — newline
        </div>
      </div>
    </div>
  );
}

// Decision bar (sticky bottom of memo column)
function DecisionBar({ onDecide }) {
  const [decision, setD] = useS2(null);
  const [note, setNote] = useS2("");

  return (
    <div style={{
      position:'sticky', bottom:0, left:0, right:0,
      padding:'14px 24px',
      background:'rgba(255,255,255,0.96)',
      backdropFilter:'blur(10px)',
      borderTop:'1px solid var(--line)',
      boxShadow:'0 -4px 16px rgba(15,18,22,0.04)',
      zIndex: 10,
      display:'flex', alignItems:'center', gap:10,
    }}>
      <span style={{fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--ink-3)', fontWeight:600}}>
        Final decision
      </span>
      <button className={"btn " + (decision === "approve" ? "success" : "outline")} onClick={() => setD("approve")} style={{padding:'8px 14px', fontSize:13}}>
        ✓ Approve
      </button>
      <button className={"btn " + (decision === "refer" ? "warn" : "outline")} onClick={() => setD("refer")} style={{padding:'8px 14px', fontSize:13}}>
        ⚠ Refer to committee
      </button>
      <button className={"btn " + (decision === "reject" ? "danger" : "outline")} onClick={() => setD("reject")} style={{padding:'8px 14px', fontSize:13}}>
        ✗ Reject
      </button>
      <div style={{flex:1, display:'flex', alignItems:'center', gap:10, minWidth:0}}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional decision note…"
          style={{
            flex:1, padding:'8px 12px', border:'1px solid var(--line)', borderRadius:'var(--r)',
            fontFamily:'var(--font-sans)', fontSize:13, outline:'none',
          }}
        />
      </div>
      <button className="btn primary" disabled={!decision} style={{padding:'8px 18px'}}>
        Submit decision →
      </button>
    </div>
  );
}

// Right side metrics card (sticky)
function KeyMetrics({ memo }) {
  const m = memo.metrics;
  const items = [
    ["DTI",   m.dti,   "red"],
    ["SLIK",  m.slik,  "amber"],
    ["AML",   m.aml,   "green"],
    ["Score", m.score, "red"],
    ["Rules triggered", m.rules, "red"],
  ];
  return (
    <aside style={{
      padding:18, background:'var(--paper-2)',
      border:'1px solid var(--line)',
      borderRadius:'var(--r-lg)',
      position:'sticky', top: 24,
    }}>
      <div style={{fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--ink-3)', fontWeight:600, marginBottom:12}}>
        Key Metrics
      </div>
      <dl style={{margin:0, display:'flex', flexDirection:'column', gap:10}}>
        {items.map(([k, v, color]) => (
          <div key={k} style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', borderBottom:'1px dashed var(--line)', paddingBottom:8}}>
            <dt style={{fontSize:12, color:'var(--ink-3)'}}>{k}</dt>
            <dd style={{
              margin:0, fontFamily:'var(--font-mono)', fontSize:13, fontWeight:500,
              color: color === "red" ? 'var(--red)' : color === "amber" ? 'var(--amber)' : color === "green" ? 'var(--green)' : 'var(--ink)',
            }}>{v}</dd>
          </div>
        ))}
      </dl>
      <div style={{
        marginTop:18, padding:'10px 12px', borderRadius:'var(--r)',
        background:'var(--red-soft)', border:'1px solid var(--red-line)',
      }}>
        <div style={{fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--red)', fontWeight:600, marginBottom:4}}>
          AI Decision
        </div>
        <div style={{fontFamily:'var(--font-serif)', fontSize:18, fontWeight:600, color:'var(--red)'}}>
          REJECTED
        </div>
      </div>
    </aside>
  );
}

function Review() {
  const [agentMode, setAM] = useS2("real");
  const loan = HIFI_LOANS.find(l => l.id === MEMO_010.appId);

  return (
    <div className="app">
      <div className="app-rail"><NavRail active="dash"/></div>
      <div className="app-top">
        <Topbar
          crumbs={["Pipeline", "APP-010", "Review"]}
          agentMode={agentMode} onAgentMode={setAM}
        />
      </div>
      <div className="app-main" style={{display:'flex', flexDirection:'column', height:'calc(100vh - 56px)', overflow:'hidden'}}>
        <ReviewSubhead loan={loan}/>

        {/* 2-column: memo (scroll) | chat (fixed) */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 420px', flex:1, minHeight:0}}>
          {/* Memo + sticky decision bar */}
          <div style={{display:'flex', flexDirection:'column', minHeight:0, overflow:'hidden'}}>
            <div style={{flex:1, overflow:'auto', padding:'0 24px'}}>
              <div style={{maxWidth:980, margin:'0 auto'}}>
                {/* Memo header */}
                <div style={{padding:'28px 0 8px'}}>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6}}>
                    Consumer Credit Analysis Memorandum
                  </div>
                  <h1 style={{margin:0, fontFamily:'var(--font-serif)', fontSize:32, fontWeight:600, letterSpacing:'-0.02em'}}>
                    {loan.name}
                  </h1>
                  <div style={{display:'flex', gap:24, marginTop:10, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>
                    <span><b style={{color:'var(--ink)'}}>Application</b> {MEMO_010.appId}</span>
                    <span><b style={{color:'var(--ink)'}}>Date</b> {MEMO_010.date}</span>
                    <span><b style={{color:'var(--ink)'}}>Status</b> {MEMO_010.status}</span>
                  </div>
                </div>

                <CrdeBanner memo={MEMO_010}/>

                {/* 2-col: sections | metrics rail */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 240px', gap:32, paddingBottom:24}}>
                  <div>
                    {MEMO_010.sections.map((s, i) => <MemoSection key={s.n} s={s} idx={i}/>)}
                  </div>
                  <div>
                    <KeyMetrics memo={MEMO_010}/>
                  </div>
                </div>
              </div>
            </div>
            <DecisionBar/>
          </div>

          {/* Chat */}
          <ChatPanel loan={loan}/>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Review/>);

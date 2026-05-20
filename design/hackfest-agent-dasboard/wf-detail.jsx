// 3 detail-page direction wireframes (memo + chat redesigns).

const APP = {
  id: "APP-010",
  name: "Yuli Andari",
  prod: "KTA",
  amt: "Rp 40.000.000",
  tenor: "24 bulan",
  risk: "HIGH",
  crde: "REJECTED",
  score: 298,
  dti: "73.0%",
  dtiLimit: "40%",
  slik: "Kol.2",
  aml: "FLAGGED",
  rules: 5,
};

function DetailHeader({ extra }) {
  return (
    <div className="topbar" style={{height: 48}}>
      <button className="btn outline" style={{padding:'4px 10px', fontSize:11}}>← Back</button>
      <span className="appid" style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{APP.id}</span>
      <span style={{fontWeight: 700, fontSize: 14}}>{APP.name}</span>
      <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{APP.prod} · {APP.amt}</span>
      <RiskTag risk={APP.risk}/>
      <div style={{flex:1}}/>
      {extra}
      <button className="btn outline" style={{fontSize:11}}>Print memo</button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Detail 1 — Refined Memo + Chat (cleaner hierarchy)
// ───────────────────────────────────────────────────────────
function Det1MemoChat() {
  return (
    <div className="wf wf-app">
      <DetailHeader/>
      <div style={{display:'grid', gridTemplateColumns:'1fr 360px', flex: 1, minHeight: 0}}>
        <div style={{overflow:'auto', display:'flex', flexDirection:'column'}}>
          <div style={{padding:'18px 18px 4px'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.08em'}}>Consumer Credit Analysis Memo</div>
            <h1 style={{fontFamily:'var(--font-disp)', fontWeight: 700, fontSize: 28, margin:'4px 0 4px', letterSpacing:'.02em'}}>
              {APP.name} · {APP.prod} {APP.amt}
            </h1>
            <div style={{fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--ink-3)'}}>
              {APP.id} · April 26, 2026 · AI draft — pending analyst decision
            </div>
          </div>

          <div className="verdict-band" style={{marginTop: 12}}>
            <div className="lbl">CRDE recommendation</div>
            <div style={{display:'flex', alignItems:'baseline', gap: 14, marginTop: 4}}>
              <span className="verdict">REJECT</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-2)'}}>Score {APP.score} / 1000 · {APP.rules} rules triggered</span>
            </div>
          </div>

          <div style={{padding:'0 18px 12px'}}>
            <div className="metrics-grid">
              <div><div className="lbl">DTI</div><div className="val red">{APP.dti}</div><div style={{fontSize:9, color:'var(--ink-3)', marginTop:2}}>limit {APP.dtiLimit}</div></div>
              <div><div className="lbl">SLIK</div><div className="val amber">{APP.slik}</div><div style={{fontSize:9, color:'var(--ink-3)', marginTop:2}}>Special Mention</div></div>
              <div><div className="lbl">AML</div><div className="val red">FLAGGED</div><div style={{fontSize:9, color:'var(--ink-3)', marginTop:2}}>address</div></div>
              <div><div className="lbl">Score</div><div className="val">{APP.score}</div><div style={{fontSize:9, color:'var(--ink-3)', marginTop:2}}>of 1000</div></div>
              <div><div className="lbl">Rules</div><div className="val red">{APP.rules}</div><div style={{fontSize:9, color:'var(--ink-3)', marginTop:2}}>triggered</div></div>
            </div>
          </div>

          {[
            ["01", "Borrower Profile", "Yuli Andari, 32 — KTA applicant. Employment 2.1y. Address inconsistency flagged in supporting docs."],
            ["02", "Loan Request", "KTA Rp 40M, 24 months @ 10.5% p.a. Purpose: speculative investment (high-risk category)."],
            ["03", "Financial Capacity", "DTI 73.0% — exceeds RAC limit (40%). Applicant cannot meet minimum capacity-to-pay threshold."],
            ["04", "SLIK OJK History", "Kolektibilitas 2 (Special Mention) — repeated late payment history with BCA on existing KTA."],
            ["05", "AML & Fraud Screening", "Address inconsistency between application and supporting docs. Income inconsistency flagged for review."],
            ["06", "CRDE Decision", "REJECT — DTI failure, SLIK Kol.2, fraud signals, speculative purpose. 5 rules triggered."],
          ].map(([n, ttl, body]) => (
            <div key={n} className="memo-section">
              <h4><span className="num">{n}</span>{ttl}</h4>
              <p>{body}</p>
            </div>
          ))}

          <div className="memo-section" style={{background:'rgba(217,119,66,.05)'}}>
            <h4 style={{color:'var(--accent)'}}><span className="num">07</span>Analyst Notes <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--ink-3)', marginLeft:6}}>editable</span></h4>
            <div style={{border:'1px dashed var(--line-2)', padding: 10, fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--ink-4)', minHeight: 70, background:'#fff'}}>
              Add override notes before deciding…
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <div className="chat">
          <div className="chat-h">
            <div className="ttl">Copilot Chat</div>
            <div className="sub">{APP.id} · {APP.name}</div>
          </div>
          <div className="chat-body">
            <div className="sugg" style={{textTransform:'uppercase', letterSpacing:'.08em', marginBottom: 4}}>Suggested questions</div>
            {["Why did CRDE recommend reject?", "What is the DTI vs RAC limit?", "What existing credit obligations?", "Any AML or fraud signals?"].map((q,i) => (
              <span key={i} className="sugg-chip">› {q}</span>
            ))}
            <div style={{marginTop: 10, padding: 10, background:'#fff', border:'1px solid var(--line)', borderRadius: 2}}>
              <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--ink-3)'}}>ANALYST · 14:28</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize: 11, marginTop: 4}}>Why did CRDE recommend reject?</div>
            </div>
            <div style={{padding: 10, background:'rgba(217,119,66,.05)', border:'1px solid var(--accent-soft)', borderRadius: 2}}>
              <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--accent)'}}>COPILOT · 14:28</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize: 11, marginTop: 4, lineHeight: 1.55}}>
                Five rules triggered:<br/>• DTI 73% &gt; 40% RAC limit<br/>• SLIK Kol.2 (Special Mention)<br/>• Address inconsistency<br/>• Income inconsistency<br/>• Speculative purpose▌
              </div>
            </div>
          </div>
          <div className="chat-input">
            <input placeholder="Ask about this application…"/>
            <button className="btn accent">Send</button>
          </div>
        </div>
      </div>

      <div className="decision-bar">
        <span className="lbl">Final decision</span>
        <button className="btn green">✓ Approve</button>
        <button className="btn amber">⚠ Refer</button>
        <button className="btn red">✗ Reject</button>
        <input placeholder="Optional note…" style={{flex:1, border:'1px solid var(--line-2)', padding: '8px 10px', fontFamily:'var(--font-mono)', fontSize:11, borderRadius: 2}}/>
        <button className="btn">Submit</button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Detail 2 — Evidence-Linked Memo (left memo, right data inspector)
// ───────────────────────────────────────────────────────────
function Det2EvidenceLinked() {
  return (
    <div className="wf wf-app">
      <DetailHeader extra={<span className="pill" style={{color:'var(--ink-2)'}}><span className="dot"/> Evidence linked</span>}/>
      <div className="verdict-band" style={{margin:'12px 18px'}}>
        <div className="lbl">CRDE recommendation</div>
        <div style={{display:'flex', alignItems:'baseline', gap: 14, marginTop: 4}}>
          <span className="verdict">REJECT</span>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-2)'}}>Score {APP.score} · {APP.rules} rules triggered · click any claim to see source</span>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 360px', flex: 1, minHeight: 0}}>
        <div style={{overflow:'auto', padding: '0 18px 18px'}}>
          {[
            ["Financial Capacity", [
              ["DTI 73.0% exceeds RAC limit of 40% — applicant fails capacity check.", "src-dti"],
              ["Net income Rp 14.8M against total obligations Rp 10.8M.", "src-income"],
            ]],
            ["SLIK OJK", [
              ["Current kolektibilitas: 2 (Special Mention).", "src-slik"],
              ["Existing facility: BCA KTA Rp 15M with repeated 30+ day delinquencies.", "src-slik-history"],
            ]],
            ["AML & Fraud", [
              ["Address inconsistency between application and KTP.", "src-aml-addr"],
              ["Income inconsistency vs employer payroll record — manual review required.", "src-aml-income"],
            ]],
          ].map(([ttl, claims]) => (
            <div key={ttl} style={{marginTop: 18}}>
              <h4 style={{fontFamily:'var(--font-disp)', textTransform:'uppercase', letterSpacing:'.06em', fontSize: 11, color:'var(--ink-3)', margin: '0 0 8px'}}>{ttl}</h4>
              {claims.map(([c, ref], i) => (
                <div key={i} style={{display:'flex', gap: 10, padding: 10, borderTop:'1px solid var(--line)'}}>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', whiteSpace:'nowrap'}}>[{ref}]</span>
                  <span style={{fontFamily:'var(--font-mono)', fontSize: 12, lineHeight: 1.55, color:'var(--ink-2)'}}>{c}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="insp">
          <div style={{padding:'12px 14px', borderBottom:'1px solid var(--line)'}}>
            <div style={{fontFamily:'var(--font-disp)', fontSize: 12, fontWeight: 700, textTransform:'uppercase', letterSpacing:'.06em'}}>Source: Data Keuangan</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--accent)', marginTop: 2}}>[src-dti] · linked from claim</div>
          </div>
          {[
            ["Gross income", "Rp 18.5M"],
            ["Net income", "Rp 14.8M"],
            ["Existing obligations", "Rp 8.8M"],
            ["Requested installment", "Rp 2.0M"],
            ["Total obligations", "Rp 10.8M"],
            ["DTI ratio", "73.0%"],
            ["DTI limit (KTA)", "40%"],
            ["Status", "FAIL"],
          ].map(([k,v]) => (
            <div key={k} className="kv">
              <span className="k">{k}</span>
              <span className="v" style={k==="DTI ratio" ? {color:'var(--red)'} : k==="Status" ? {color:'var(--red)'} : null}>{v}</span>
            </div>
          ))}

          <h4>Other sources</h4>
          {["[src-income] Verifikasi Penghasilan", "[src-slik] SLIK OJK", "[src-slik-history] Riwayat 24 bln", "[src-aml-addr] AML Screening", "[src-aml-income] Income consistency"].map(s => (
            <div key={s} className="kv" style={{cursor:'pointer'}}>
              <span className="k" style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--ink-3)'}}>{s}</span>
              <span style={{color:'var(--ink-3)'}}>›</span>
            </div>
          ))}
        </div>
      </div>

      <div className="decision-bar">
        <span className="lbl">Final decision</span>
        <button className="btn green">✓ Approve</button>
        <button className="btn amber">⚠ Refer</button>
        <button className="btn red">✗ Reject</button>
        <button className="btn outline">Ask Copilot</button>
        <div style={{flex:1}}/>
        <button className="btn">Submit</button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Detail 3 — Verdict-First (top heroes the recommendation, memo + chat below)
// ───────────────────────────────────────────────────────────
function Det3VerdictFirst() {
  return (
    <div className="wf wf-app">
      <DetailHeader/>
      {/* Hero verdict band */}
      <div style={{padding: 18, background:'rgba(176,72,72,.04)', borderBottom:'1px solid var(--line)'}}>
        <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 24, alignItems:'center'}}>
          <div>
            <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.08em'}}>AI recommendation for {APP.id} · {APP.name}</div>
            <div style={{display:'flex', alignItems:'baseline', gap: 18, marginTop: 4}}>
              <span style={{fontFamily:'var(--font-disp)', fontWeight: 700, fontSize: 56, color:'var(--red)', lineHeight: 1, letterSpacing:'.02em'}}>REJECT</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize: 14, color:'var(--ink-2)'}}>Confidence HIGH · Score {APP.score}/1000</span>
            </div>
            <div style={{fontFamily:'var(--font-mono)', fontSize: 12, color:'var(--ink-2)', marginTop: 8, lineHeight: 1.55, maxWidth: 620}}>
              Application does not meet minimum credit standards. DTI 73% exceeds the 40% KTA limit, SLIK shows Kol.2 (Special Mention), and two fraud signals were detected. Suggest regret letter with explanation of RAC non-compliance.
            </div>
          </div>
          <div className="metrics-grid">
            <div><div className="lbl">DTI</div><div className="val red">{APP.dti}</div></div>
            <div><div className="lbl">SLIK</div><div className="val amber">{APP.slik}</div></div>
            <div><div className="lbl">AML</div><div className="val red">FLAG</div></div>
            <div><div className="lbl">Score</div><div className="val">{APP.score}</div></div>
            <div><div className="lbl">Rules</div><div className="val red">{APP.rules}</div></div>
          </div>
        </div>
      </div>

      {/* Decision-first inline */}
      <div style={{display:'flex', alignItems:'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--line)', background:'#fbfaf6'}}>
        <span style={{fontFamily:'var(--font-disp)', textTransform:'uppercase', fontWeight: 700, letterSpacing:'.06em', fontSize: 12}}>Your decision</span>
        <button className="btn green">✓ Approve override</button>
        <button className="btn amber">⚠ Refer to committee</button>
        <button className="btn red">✗ Confirm reject</button>
        <div style={{flex:1}}/>
        <span style={{fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--ink-3)'}}>Review the evidence below before confirming.</span>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 360px', flex: 1, minHeight: 0}}>
        <div style={{overflow:'auto', padding: '4px 18px 18px'}}>
          <div className="tabs" style={{padding: 0, marginBottom: 10, borderBottom:'1px solid var(--line)', marginLeft:-18, marginRight:-18, paddingLeft: 18}}>
            <div className="tab on">Red flags · 5</div>
            <div className="tab">Memo</div>
            <div className="tab">Source data</div>
            <div className="tab">Decision history</div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap: 10}}>
            {[
              ["DTI 73.0% exceeds RAC limit (40%)", "Net income Rp 14.8M vs total obligations Rp 10.8M.", "red"],
              ["SLIK Kol.2 — Special Mention", "Repeated 30+ day delinquencies on BCA KTA Rp 15M.", "amber"],
              ["Income inconsistency", "Self-reported income exceeds payroll record by 24%.", "red"],
              ["Address inconsistency", "Application address differs from KTP and supporting docs.", "amber"],
              ["Speculative loan purpose", "Stated use: \"investment\" — high-risk category.", "amber"],
            ].map(([t, d, c], i) => (
              <div key={i} className="card" style={{borderLeft: `3px solid var(--${c})`, margin: 0, padding: 12}}>
                <div style={{display:'flex', alignItems:'baseline', gap:8}}>
                  <span style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--ink-3)'}}>RULE {String(i+1).padStart(2,'0')}</span>
                  <span style={{fontWeight: 600, fontSize: 13}}>{t}</span>
                </div>
                <div style={{fontFamily:'var(--font-mono)', fontSize: 11, color:'var(--ink-2)', marginTop: 4, lineHeight: 1.55}}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat">
          <div className="chat-h">
            <div className="ttl">Copilot</div>
            <div className="sub">Ask about any flag</div>
          </div>
          <div className="chat-body">
            {["Why is DTI 73% disqualifying?", "Show the SLIK 24-month history", "Compare to similar approved KTAs", "What if tenor were extended to 36mo?"].map((q,i) => (
              <span key={i} className="sugg-chip">› {q}</span>
            ))}
            <div style={{padding: 10, background:'rgba(217,119,66,.05)', border:'1px solid var(--accent-soft)', borderRadius: 2, marginTop: 10}}>
              <div style={{fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--accent)'}}>COPILOT</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize: 11, marginTop: 4, lineHeight: 1.55}}>
                Even at 36 months, DTI would only fall to ~63% — still well above the 40% RAC limit. Capacity issue is structural, not tenor-related.▌
              </div>
            </div>
          </div>
          <div className="chat-input">
            <input placeholder="Ask…"/>
            <button className="btn accent">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Det1MemoChat, Det2EvidenceLinked, Det3VerdictFirst });

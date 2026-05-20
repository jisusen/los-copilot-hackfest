// Shared hi-fi components: Topbar, NavRail, Tags, AgentScreen, helpers.

const { useState, useEffect, useRef } = React;

function NavRail({ active = "dash" }) {
  const ic = (d) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
  const items = [
    { k: "dash",   label: "Dashboard", d: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
    { k: "queue",  label: "Queue",     d: "M3 6h18M3 12h18M3 18h18" },
    { k: "agents", label: "Agents",    d: "M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" },
    { k: "audit",  label: "Audit",     d: "M9 11l3 3 8-8M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0z" },
    { k: "rac",    label: "RAC Rules", d: "M4 6h16M4 12h16M4 18h10" },
    { k: "set",    label: "Settings",  d: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19 12l2 1-1 3-2-1m-12 0l-2 1 1 3 2-1m12-9l1-2-3-1-1 2m-8 0l-1-2-3 1 1 2" },
  ];
  return (
    <div className="rail">
      <div className="mark">B</div>
      {items.map(it => (
        <div key={it.k} className={"ic " + (active === it.k ? "on" : "")} title={it.label}>
          {ic(it.d)}
        </div>
      ))}
      <div style={{flex:1}}/>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize: 9,
        color:'var(--ink-4)', writingMode:'vertical-rl',
        transform:'rotate(180deg)', letterSpacing:'.1em',
      }}>BMS · v0.4</div>
    </div>
  );
}

function Topbar({ crumbs = [], agentMode, onAgentMode, liveOn, onLive, right, user = "analyst01" }) {
  return (
    <div className="top">
      <div className="brand">
        Bank Mitra Sejahtera
        <span className="sub">Credit Analyst Copilot</span>
      </div>
      <div className="crumb">
        {crumbs.map((c, i) => (
          <span key={i}>
            {" / "}
            {i === crumbs.length - 1 ? <b>{c}</b> : c}
          </span>
        ))}
      </div>
      <div className="spacer"/>
      {right}
      {onAgentMode && (
        <div className="seg">
          <span className="lbl">Agent</span>
          <button className={"" + (agentMode === "real" ? " on real" : "")} onClick={() => onAgentMode("real")}>Real</button>
          <button className={"" + (agentMode === "sim"  ? " on sim"  : "")} onClick={() => onAgentMode("sim")}>Sim</button>
        </div>
      )}
      {onLive && (
        <button className={"btn-ghost live " + (liveOn ? "" : "off")} onClick={() => onLive(!liveOn)}>
          <span className="dot"/>
          Live view {liveOn ? "ON" : "OFF"}
        </button>
      )}
      <div className="user-pill">
        <span>{user}</span>
        <span className="avatar">A</span>
      </div>
    </div>
  );
}

// Sim-mode banner
function SimBanner({ on }) {
  if (!on) return null;
  return (
    <div style={{
      padding:'8px 24px',
      background:'var(--amber-soft)',
      borderBottom:'1px solid var(--amber-line)',
      fontFamily:'var(--font-mono)', fontSize:11,
      color:'var(--amber)',
      display:'flex', alignItems:'center', gap:8,
    }}>
      <span>⚙</span>
      <span><b>SIMULATION MODE</b> — agents replay seeded fixtures from /data/los.db (no live LOS calls).</span>
    </div>
  );
}

// Tag helpers
function RiskTag({ risk }) {
  if (!risk) return null;
  const m = { HIGH:"red", MEDIUM:"amber", LOW:"green" }[risk] || "";
  return <span className={"tag " + m}>{risk}</span>;
}
function CrdeTag({ v, solid=false }) {
  if (!v) return null;
  const map = {
    APPROVED: "green", DISETUJUI: "green",
    REJECTED: "red",   DITOLAK: "red",
    REFER: "amber",
  };
  const m = map[v] || "amber";
  return <span className={"tag " + (solid ? "solid-"+m : m)}>{v}</span>;
}
function StateTag({ s, pct }) {
  if (s === "running") return <span className="tag run blue"><span className="dot"/> AGENT RUNNING{pct != null ? ` · ${pct}%` : ""}</span>;
  if (s === "ready")   return <span className="tag green"><span className="dot"/> READY</span>;
  if (s === "queued")  return <span className="tag"><span className="dot"/> QUEUED</span>;
  if (s === "decided") return <span className="tag"><span className="dot"/> DECIDED</span>;
  return null;
}

// Agent live browser screen — fake LOS view that's clearly the BMS LOS
function AgentScreen({ size = "md", label = "APP-006", page = "data-keuangan" }) {
  const heights = { sm: 100, md: 180, lg: 300, xl: 380 };
  return (
    <div className="live-screen" style={{height: heights[size] || 180}}>
      <div className="badge"><i/> LIVE · {label}</div>
      <div className="browser">
        <div className="url">
          <i style={{background:'#e87b6e'}}/>
          <i style={{background:'#e8c46e'}}/>
          <i style={{background:'#7bbb6e'}}/>
          <span className="addr">los.bms.local/loans/{label}?tab={page}</span>
        </div>
        <div className="body">
          <div className="skel h12 w40 bg-accent"/>
          <div style={{height:6}}/>
          <div className="skel h6 w20"/>
          <div className="skel w80"/>
          <div className="skel h6 w20"/>
          <div className="skel w60"/>
          <div className="skel h6 w20"/>
          <div className="skel w80"/>
          {size !== "sm" && <div className="skel w60"/>}
          {(size === "lg" || size === "xl") && <>
            <div style={{height:8}}/>
            <div className="skel h6 w20"/>
            <div className="skel w80"/>
            <div className="skel w60"/>
          </>}
        </div>
      </div>
    </div>
  );
}

function LiveOrOff({ liveOn, ...props }) {
  if (liveOn) return <AgentScreen {...props}/>;
  const heights = { sm: 100, md: 180, lg: 300, xl: 380 };
  return (
    <div className="live-screen off" style={{height: heights[props.size] || 180}}>
      <span className="label">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        Live view hidden — toggle to show agent browser
      </span>
    </div>
  );
}

// Format helpers
const fmtTime = (s) => {
  if (typeof s === "string") return s;
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${r.toString().padStart(2,"0")}`;
};

Object.assign(window, {
  NavRail, Topbar, SimBanner,
  RiskTag, CrdeTag, StateTag,
  AgentScreen, LiveOrOff,
  fmtTime,
});

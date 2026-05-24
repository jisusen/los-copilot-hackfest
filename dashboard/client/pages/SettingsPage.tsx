import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserMenu } from "../components/UserMenu";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/Toast";
import { SkeletonBlock, Skeleton } from "../components/Skeleton";

type SettingsData = {
  llmProvider: string;
  anthropicApiKey: string;
  anthropicModel: string;
  geminiApiKey: string;
  geminiModel: string;
  customEndpoint: string;
  customModel: string;
  customApiKey: string;
  browseProvider: string;
  browseModel: string;
  browseEndpoint: string;
  browseApiKey: string;
  memoSkill: string;
  losUrl: string;
  losUsername: string;
  losPassword: string;
  losLoginPath: string;
  extractionMode: string;
  mockAgent: boolean;
};

const DEFAULTS: SettingsData = {
  llmProvider: "anthropic",
  anthropicApiKey: "",
  anthropicModel: "claude-sonnet-4-6",
  geminiApiKey: "",
  geminiModel: "gemini-2.0-flash",
  customEndpoint: "",
  customModel: "",
  customApiKey: "",
  browseProvider: "",
  browseModel: "",
  browseEndpoint: "",
  browseApiKey: "",
  memoSkill: "",
  losUrl: "http://localhost:3333",
  losUsername: "analyst01",
  losPassword: "bms2025",
  losLoginPath: "/login",
  extractionMode: "browser",
  mockAgent: false,
};

function NavRail({ active = "set" }: { active?: string }) {
  const ic = (d: string) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  );
  const items = [
    { k: "dash", label: "Dashboard", d: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
    { k: "queue", label: "Queue", d: "M3 6h18M3 12h18M3 18h18" },
    { k: "agents", label: "Agents", d: "M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" },
    { k: "audit", label: "Audit", d: "M9 11l3 3 8-8M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0z" },
    { k: "set", label: "Settings", d: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19 12l2 1-1 3-2-1m-12 0l-2 1 1 3 2-1m12-9l1-2-3-1-1 2m-8 0l-1-2-3 1 1 2" },
  ];
  const navigate = useNavigate();
  return (
    <div className="rail">
      <div className="mark">B</div>
      {items.map((it) => (
        <div key={it.k} className={`ic${active === it.k ? " on" : ""}`} title={it.label} onClick={() => it.k === "dash" && navigate("/")} style={{ cursor: it.k === "dash" ? "pointer" : "default" }}>
          {ic(it.d)}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ink-4)", writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: ".1em" }}>BMB · v1</div>
    </div>
  );
}

function Topbar({ crumbs = [] }: { crumbs?: string[] }) {
  return (
    <div className="top">
      <div className="brand">Bank Maju Bersama<span className="sub">Credit Analyst Copilot</span></div>
      <div className="crumb">{crumbs.map((c, i) => (<span key={i}>{" / "}{i === crumbs.length - 1 ? <b>{c}</b> : c}</span>))}</div>
      <div className="spacer" />
      <UserMenu username="analyst01" />
    </div>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function CollapsibleSection({ title, desc, icon, defaultOpen = true, children, status }: {
  title: string; desc?: string; icon: string; defaultOpen?: boolean; children: React.ReactNode; status?: "ok" | "warn" | "empty";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const statusColors = { ok: "#1a7f4b", warn: "#c47d0e", empty: "var(--ink-3)" };
  const statusLabel = { ok: "Configured", warn: "Incomplete", empty: "Not set" };
  return (
    <div style={{ marginBottom: 12, border: "1px solid var(--line)", borderRadius: "var(--r)", overflow: "hidden", background: "#fff" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer", userSelect: "none", background: open ? "#f8fafc" : "transparent", borderBottom: open ? "1px solid var(--line)" : "none", transition: "background .15s" }}>
        <div style={{ flexShrink: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon path={icon} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
          {desc && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{desc}</div>}
        </div>
        {status && (
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: statusColors[status], background: `${statusColors[status]}11`, padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>
            {statusLabel[status]}
          </span>
        )}
        <div style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s", color: "var(--ink-3)" }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </div>
      {open && <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", password = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; password?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={password && !visible ? "password" : type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: "100%", padding: "8px 10px", paddingRight: password ? 36 : 10, border: "1px solid var(--line)", borderRadius: "var(--r)", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", background: "#fff", outline: "none", boxSizing: "border-box" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        {password && (
          <div onClick={() => setVisible(!visible)} style={{ position: "absolute", right: 8, top: 0, bottom: 0, display: "flex", alignItems: "center", cursor: "pointer", color: "var(--ink-3)", padding: 4 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {visible ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></> : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><path d="M14.12 14.12a3 3 0 11-4.24-4.24" /><path d="M2 2l20 20" /></>}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: "var(--r)", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", background: "#fff", outline: "none", boxSizing: "border-box" }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TestBtn({ label, onClick, result }: { label: string; onClick: () => Promise<void>; result: string }) {
  const [testing, setTesting] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button className="btn secondary" style={{ fontSize: 12, padding: "6px 14px" }} disabled={testing} onClick={async () => { setTesting(true); await onClick(); setTesting(false); }}>
        {testing ? "Testing..." : label}
      </button>
      {result && <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: result.includes("✓") ? "#1a7f4b" : "#b91c1c" }}>{result}</span>}
    </div>
  );
}

// ── LLM provider sub-form (shared by Analysis and Browsing) ──

function LlmProviderFields({ provider, model, apiKey, endpoint, onProvider, onModel, onKey, onEndpoint, showEndpoint = false }: {
  provider: string; model: string; apiKey: string; endpoint: string;
  onProvider: (v: string) => void; onModel: (v: string) => void; onKey: (v: string) => void; onEndpoint: (v: string) => void;
  showEndpoint?: boolean;
}) {
  const opts = [
    { value: "anthropic", label: "Anthropic (Claude)" },
    { value: "gemini", label: "Google Gemini" },
    { value: "custom", label: "Custom OpenAI-compatible" },
  ];
  return (
    <>
      <Select label="Provider" value={provider} onChange={onProvider} options={opts} />
      {provider === "anthropic" && (
        <><Field label="API Key" value={apiKey} onChange={onKey} password /><Field label="Model" value={model} onChange={onModel} placeholder="claude-sonnet-4-6" /></>
      )}
      {provider === "gemini" && (
        <><Field label="API Key" value={apiKey} onChange={onKey} password /><Field label="Model" value={model} onChange={onModel} placeholder="gemini-2.0-flash" /></>
      )}
      {provider === "custom" && (
        <>{showEndpoint && <Field label="Base URL" value={endpoint} onChange={onEndpoint} placeholder="https://api.example.com/v1" />}<Field label="Model" value={model} onChange={onModel} placeholder="llama-3.1-70b" /><Field label="API Key" value={apiKey} onChange={onKey} password /></>
      )}
    </>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsData>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testLos, setTestLos] = useState("");
  const toast = useToast();

  useEffect(() => {
    apiFetch<{ settings: SettingsData }>("/api/settings")
      .then((data) => { setSettings({ ...DEFAULTS, ...data.settings }); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function update<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    try {
      await apiFetch("/api/settings", { method: "POST", body: JSON.stringify(settings) });
      toast("Settings saved");
    } catch { toast("Failed to save settings", "error"); }
  }

  async function testLosConnection() {
    setTestLos("");
    try {
      const r = await fetch(`${settings.losUrl}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: settings.losUsername, password: settings.losPassword }) });
      setTestLos(r.ok ? "✓ Login successful" : `✗ HTTP ${r.status}`);
    } catch { setTestLos("✗ Cannot reach server"); }
  }

  const extractionOptions = [
    { value: "browser", label: "Browser (LLM navigates LOS UI)" },
    { value: "api", label: "API (direct REST calls — fast)" },
  ];

  return (
    <div className="app">
      <div className="app-rail"><NavRail active="set" /></div>
      <div className="app-top"><Topbar crumbs={["Settings"]} /></div>
      <div className="app-main" style={{ overflow: "auto" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600 }}>Settings</h1>
            <div style={{ flex: 1 }} />
            <button className="btn primary" onClick={save} disabled={loading}>{saved ? "✓ Saved" : "Save changes"}</button>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SkeletonBlock lines={4} />
              <SkeletonBlock lines={3} />
              <SkeletonBlock lines={5} />
            </div>
          ) : (
            <>
              <CollapsibleSection title="Analysis LLM" desc="Used for data extraction and memo generation" icon="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" status={settings.llmProvider ? "ok" : "empty"}>
                <LlmProviderFields
                  provider={settings.llmProvider} model={settings.anthropicModel} apiKey={settings.anthropicApiKey} endpoint={settings.customEndpoint}
                  onProvider={(v) => { update("llmProvider", v); }} onModel={(v) => update("anthropicModel", v)} onKey={(v) => update("anthropicApiKey", v)} onEndpoint={(v) => update("customEndpoint", v)}
                  showEndpoint
                />
                {settings.llmProvider === "gemini" && (
                  <Field label="Gemini API Key" value={settings.geminiApiKey} onChange={(v) => update("geminiApiKey", v)} password />
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Browsing LLM" desc="Fast/cheap model for vendor UI navigation. Leave empty to reuse Analysis LLM." icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" defaultOpen={false} status={settings.browseProvider ? "ok" : "empty"}>
                <Select label="Provider" value={settings.browseProvider} onChange={(v) => update("browseProvider", v)} options={[{ value: "", label: "Same as Analysis LLM" }, { value: "anthropic", label: "Anthropic (Claude)" }, { value: "gemini", label: "Google Gemini" }, { value: "custom", label: "Custom OpenAI-compatible" }]} />
                {settings.browseProvider !== "" && (
                  <LlmProviderFields
                    provider={settings.browseProvider} model={settings.browseModel} apiKey={settings.browseApiKey} endpoint={settings.browseEndpoint}
                    onProvider={(v) => update("browseProvider", v)} onModel={(v) => update("browseModel", v)} onKey={(v) => update("browseApiKey", v)} onEndpoint={(v) => update("browseEndpoint", v)}
                  />
                )}
              </CollapsibleSection>

              <CollapsibleSection title="LOS Connection" desc="Bank Maju Bersama Loan Origination System" icon="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" status={settings.losUrl ? "ok" : "empty"}>
                <Field label="LOS Base URL" value={settings.losUrl} onChange={(v) => update("losUrl", v)} placeholder="http://localhost:3333" />
                <Field label="Username" value={settings.losUsername} onChange={(v) => update("losUsername", v)} />
                <Field label="Password" value={settings.losPassword} onChange={(v) => update("losPassword", v)} password />
                <Field label="Login page path" value={settings.losLoginPath} onChange={(v) => update("losLoginPath", v)} placeholder="/login" />
                <TestBtn label="Test LOS Connection" onClick={testLosConnection} result={testLos} />
              </CollapsibleSection>

              <CollapsibleSection title="Agent" desc="Browser behavior and extraction strategy" icon="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" defaultOpen={false}>
                <Select label="Extraction mode" value={settings.extractionMode} onChange={(v) => update("extractionMode", v)} options={extractionOptions} />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" id="mockAgent" checked={settings.mockAgent} onChange={(e) => update("mockAgent", e.target.checked)} style={{ accentColor: "var(--accent)" }} />
                  <label htmlFor="mockAgent" style={{ fontSize: 13, color: "var(--ink-2)", cursor: "pointer" }}>Mock agent mode (no Python, uses seeded fixtures)</label>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Skills" desc="Custom SOP, Juknis, or guidelines injected into the agent" icon="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" defaultOpen={false} status={settings.memoSkill ? "ok" : "empty"}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Memo SOP / Juknis (Markdown)</label>
                  <textarea value={settings.memoSkill} onChange={(e) => update("memoSkill", e.target.value)}
                    placeholder="Leave empty to use the built-in default SOP. Paste your bank's Juknis or credit memo guidelines here as Markdown."
                    rows={10}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "var(--r)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink)", background: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5, marginTop: 6 }}>Overrides the built-in SOP when non-empty. Use it for bank-specific rules, CRDE decision mappings, or formatting guidelines.</div>
                </div>
              </CollapsibleSection>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

type SettingsData = {
  llmProvider: string;
  anthropicApiKey: string;
  anthropicModel: string;
  geminiApiKey: string;
  geminiModel: string;
  customEndpoint: string;
  customModel: string;
  customApiKey: string;
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
  losUrl: "http://localhost:3333",
  losUsername: "analyst01",
  losPassword: "bms2025",
  losLoginPath: "/login",
  extractionMode: "browser",
  mockAgent: false,
};

// ─── NavRail ───────────────────────────────────────────────────────────────
function NavRail({ active = "set" }: { active?: string }) {
  const ic = (d: string) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
  const items = [
    { k: "dash",   label: "Dashboard", d: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
    { k: "queue",  label: "Queue",     d: "M3 6h18M3 12h18M3 18h18" },
    { k: "agents", label: "Agents",    d: "M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" },
    { k: "audit",  label: "Audit",     d: "M9 11l3 3 8-8M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0z" },
    { k: "set",    label: "Settings",  d: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19 12l2 1-1 3-2-1m-12 0l-2 1 1 3 2-1m12-9l1-2-3-1-1 2m-8 0l-1-2-3 1 1 2" },
  ];
  const navigate = useNavigate();
  return (
    <div className="rail">
      <div className="mark">B</div>
      {items.map(it => (
        <div
          key={it.k}
          className={`ic${active === it.k ? " on" : ""}`}
          title={it.label}
          onClick={() => it.k === "dash" && navigate("/")}
          style={{ cursor: it.k === "dash" ? "pointer" : "default" }}
        >
          {ic(it.d)}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ink-4)", writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: ".1em" }}>
        BMB · v1
      </div>
    </div>
  );
}

// ─── Topbar ────────────────────────────────────────────────────────────────
function Topbar({ crumbs = [] }: { crumbs?: string[] }) {
  return (
    <div className="top">
      <div className="brand">
        Bank Maju Bersama
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
      <div className="spacer" />
      <div className="user-pill">
        <span>analyst01</span>
        <span className="avatar">A</span>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ margin: "0 0 16px", fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", password = false }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; password?: boolean;
}) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={password ? "password" : type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: "var(--r)",
          fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", background: "#fff",
          outline: "none", boxSizing: "border-box",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: "var(--r)",
          fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", background: "#fff",
          outline: "none", boxSizing: "border-box",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsData>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ settings: SettingsData }>("/api/settings")
      .then(data => {
        setSettings({ ...DEFAULTS, ...data.settings });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function update<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    try {
      await apiFetch("/api/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save settings");
    }
  }

  const providerOptions = [
    { value: "anthropic", label: "Anthropic (Claude)" },
    { value: "gemini", label: "Google Gemini" },
    { value: "custom", label: "Custom OpenAI-compatible" },
  ];

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
            <button className="btn primary" onClick={save} disabled={loading}>
              {saved ? "✓ Saved" : "Save changes"}
            </button>
          </div>

          {loading ? (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>Loading settings…</div>
          ) : (
            <>
              {/* ── LLM Provider ── */}
              <Section title="LLM Provider">
                <Select
                  label="Provider"
                  value={settings.llmProvider}
                  onChange={v => update("llmProvider", v)}
                  options={providerOptions}
                />

                {settings.llmProvider === "anthropic" && (
                  <>
                    <Field label="API Key" value={settings.anthropicApiKey} onChange={v => update("anthropicApiKey", v)} password />
                    <Field label="Model" value={settings.anthropicModel} onChange={v => update("anthropicModel", v)} placeholder="claude-sonnet-4-6" />
                  </>
                )}

                {settings.llmProvider === "gemini" && (
                  <>
                    <Field label="API Key" value={settings.geminiApiKey} onChange={v => update("geminiApiKey", v)} password />
                    <Field label="Model" value={settings.geminiModel} onChange={v => update("geminiModel", v)} placeholder="gemini-2.0-flash" />
                  </>
                )}

                {settings.llmProvider === "custom" && (
                  <>
                    <Field label="Base URL (endpoint)" value={settings.customEndpoint} onChange={v => update("customEndpoint", v)} placeholder="https://api.example.com/v1" />
                    <Field label="Model name" value={settings.customModel} onChange={v => update("customModel", v)} placeholder="llama-3.1-70b" />
                    <Field label="API Key" value={settings.customApiKey} onChange={v => update("customApiKey", v)} password />
                    <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
                      Any OpenAI-compatible endpoint works (OpenRouter, Ollama, vLLM, etc.).
                      The chat API must support <code>/chat/completions</code> with streaming.
                    </div>
                  </>
                )}
              </Section>

              {/* ── LOS Connection ── */}
              <Section title="LOS Connection">
                <Field label="LOS Base URL" value={settings.losUrl} onChange={v => update("losUrl", v)} placeholder="http://localhost:3333" />
                <Field label="Username" value={settings.losUsername} onChange={v => update("losUsername", v)} />
                <Field label="Password" value={settings.losPassword} onChange={v => update("losPassword", v)} password />
                <Field label="Login page path" value={settings.losLoginPath} onChange={v => update("losLoginPath", v)} placeholder="/login" />
                <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
                  The login page path is used by the browser agent to navigate to the LOS login screen.
                  Default is <code>/login</code>.
                </div>
              </Section>

              {/* ── Agent ── */}
              <Section title="Agent">
                <Select
                  label="Extraction mode"
                  value={settings.extractionMode}
                  onChange={v => update("extractionMode", v)}
                  options={extractionOptions}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    id="mockAgent"
                    checked={settings.mockAgent}
                    onChange={e => update("mockAgent", e.target.checked)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <label htmlFor="mockAgent" style={{ fontSize: 13, color: "var(--ink-2)", cursor: "pointer" }}>
                    Mock agent mode (no Python, uses seeded fixtures)
                  </label>
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

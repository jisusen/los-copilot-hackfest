import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/Toast";
import { SkeletonBlock } from "../components/Skeleton";
import { SkillsTab } from "../components/SkillsTab";
import { Settings, FileText } from "lucide-react";

type SettingsData = {
  llmProvider: string;
  apiKey: string;
  anthropicModel: string;
  geminiModel: string;
  customEndpoint: string;
  customModel: string;
  browseProvider: string;
  browseModel: string;
  browseEndpoint: string;
  browseApiKey: string;
  browseVertexProject: string;
  browseVertexLocation: string;
  browseVertexCredentials: string;
  losUrl: string;
  losUsername: string;
  losPassword: string;
  losLoginPath: string;
  extractionMode: string;
  mockAgent: boolean;
};

const DEFAULTS: SettingsData = {
  llmProvider: "custom",
  apiKey: "",
  anthropicModel: "claude-sonnet-4-6",
  geminiModel: "gemini-2.5-flash-lite",
  customEndpoint: "https://api.xiaomimimo.com/v1",
  customModel: "mimo-v2.5",
  browseProvider: "gemini",
  browseModel: "gemini-2.5-flash-lite",
  browseEndpoint: "",
  browseApiKey: "",
  browseVertexProject: "",
  browseVertexLocation: "asia-southeast1",
  browseVertexCredentials: "",
  losUrl: "http://localhost:3333",
  losUsername: "analyst01",
  losPassword: "bms2025",
  losLoginPath: "/login",
  extractionMode: "browser",
  mockAgent: false,
};

function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

function CollapsibleSection({
  title,
  desc,
  icon,
  defaultOpen = true,
  children,
  status,
}: {
  title: string;
  desc?: string;
  icon: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  status?: "ok" | "warn" | "empty";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const statusColors: Record<string, string> = {
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
    empty: "bg-slate-50 text-slate-400 border-slate-200",
  };
  const statusLabel = {
    ok: "Configured",
    warn: "Incomplete",
    empty: "Not set",
  };
  return (
    <div className="mb-3 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${open ? "bg-slate-50 border-b border-slate-200" : ""}`}
      >
        <div className="shrink-0 w-5 h-5 flex items-center justify-center text-slate-500">
          <Icon path={icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
        </div>
        {status && (
          <span
            className={`shrink-0 text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${statusColors[status]}`}
          >
            {statusLabel[status]}
          </span>
        )}
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="px-4 py-4 flex flex-col gap-3">{children}</div>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  password = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  password?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="block font-mono text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={password && !visible ? "password" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        />
        {password && (
          <button
            onClick={() => setVisible(!visible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              {visible ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                  <path d="M2 2l20 20" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TestBtn({
  label,
  onClick,
  result,
}: {
  label: string;
  onClick: () => Promise<void>;
  result: string;
}) {
  const [testing, setTesting] = useState(false);
  const isSuccess = result.includes("✓");
  return (
    <div className="flex items-center gap-2.5">
      <button
        className="inline-flex items-center gap-1.5 border border-slate-200 bg-white text-xs font-semibold text-slate-700 px-3.5 py-1.5 rounded-lg transition-colors hover:bg-slate-50 disabled:opacity-50"
        disabled={testing}
        onClick={async () => {
          setTesting(true);
          await onClick();
          setTesting(false);
        }}
      >
        {testing ? "Testing..." : label}
      </button>
      {result && (
        <span
          className={`text-[11px] font-mono ${isSuccess ? "text-emerald-600" : "text-red-600"}`}
        >
          {result}
        </span>
      )}
    </div>
  );
}

function InfoCallout({
  variant,
  children,
}: {
  variant: "info" | "warn";
  children: React.ReactNode;
}) {
  const styles =
    variant === "warn"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : "bg-sky-50 border-sky-200 text-sky-900";
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 text-xs leading-relaxed ${styles}`}
    >
      {children}
    </div>
  );
}

function memoLlmStatus(s: SettingsData): "ok" | "warn" | "empty" {
  if (!s.apiKey) return "empty";
  if (s.llmProvider === "custom" && (!s.customEndpoint || !s.customModel))
    return "warn";
  return "ok";
}

function browseLlmStatus(s: SettingsData): "ok" | "warn" | "empty" {
  if (!s.browseProvider) return "warn";
  if (s.browseProvider === "vertex") {
    if (!s.browseVertexProject.trim()) return "warn";
    if (!s.browseApiKey.trim() && !s.browseVertexCredentials.trim())
      return "warn";
    return "ok";
  }
  if (!s.browseApiKey.trim()) return "warn";
  return "ok";
}

function MemoLlmFields({
  settings,
  update,
}: {
  settings: SettingsData;
  update: <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K],
  ) => void;
}) {
  return (
    <>
      <InfoCallout variant="info">
        Default provider: <strong>mimo-v2.5</strong> (xiaomimimo). This LLM handles copilot conversations and generates credit analysis memos.
      </InfoCallout>
      <Select
        label="Provider"
        value={settings.llmProvider}
        onChange={(v) => update("llmProvider", v)}
        options={[
          {
            value: "custom",
            label: "Custom — mimo / OpenAI-compatible (recommended)",
          },
          { value: "anthropic", label: "Anthropic (Claude)" },
          { value: "gemini", label: "Google Gemini" },
        ]}
      />
      <Field
        label="API Key"
        value={settings.apiKey}
        onChange={(v) => update("apiKey", v)}
        password
        placeholder="mimo sk-... key"
      />
      {settings.llmProvider === "anthropic" && (
        <Field
          label="Model"
          value={settings.anthropicModel}
          onChange={(v) => update("anthropicModel", v)}
          placeholder="claude-sonnet-4-6"
        />
      )}
      {settings.llmProvider === "gemini" && (
        <Field
          label="Model"
          value={settings.geminiModel}
          onChange={(v) => update("geminiModel", v)}
          placeholder="gemini-2.5-flash-lite"
        />
      )}
      {settings.llmProvider === "custom" && (
        <>
          <Field
            label="Base URL"
            value={settings.customEndpoint}
            onChange={(v) => update("customEndpoint", v)}
            placeholder="https://api.xiaomimimo.com/v1"
          />
          <Field
            label="Model"
            value={settings.customModel}
            onChange={(v) => update("customModel", v)}
            placeholder="mimo-v2.5"
          />
        </>
      )}
    </>
  );
}

function BrowseLlmFields({
  settings,
  update,
}: {
  settings: SettingsData;
  update: <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K],
  ) => void;
}) {
  const provider = settings.browseProvider || "gemini";
  return (
    <>
      <InfoCallout variant="warn">
        <strong>Note:</strong> The Browsing LLM requires a separate provider configuration.
        The Copilot LLM API key (mimo) is not compatible with browser automation.
        Use Gemini, Claude, or Vertex AI for this provider.
      </InfoCallout>
      <Select
        label="Provider"
        value={provider}
        onChange={(v) => update("browseProvider", v)}
        options={[
          { value: "vertex", label: "Vertex AI (GCP project — hackfest)" },
          { value: "gemini", label: "Google AI Studio (AIzaSy key)" },
          { value: "anthropic", label: "Anthropic (Claude)" },
        ]}
      />
      {provider === "vertex" ? (
        <>
          <Field
            label="GCP Project ID"
            value={settings.browseVertexProject}
            onChange={(v) => update("browseVertexProject", v)}
            placeholder="my-hackfest-project-123"
          />
          <Field
            label="Region"
            value={settings.browseVertexLocation}
            onChange={(v) => update("browseVertexLocation", v)}
            placeholder="asia-southeast1"
          />
          <Field
            label="Model"
            value={settings.browseModel}
            onChange={(v) => update("browseModel", v)}
            placeholder="gemini-2.5-flash-lite"
          />
          <Field
            label="API Key (optional)"
            value={settings.browseApiKey}
            onChange={(v) => update("browseApiKey", v)}
            password
            placeholder="Vertex/Gemini key if hackfest gave one"
          />
          <Field
            label="Service account JSON path (optional)"
            value={settings.browseVertexCredentials}
            onChange={(v) => update("browseVertexCredentials", v)}
            placeholder="C:\path	o\service-account.json"
          />
          <InfoCallout variant="info">
            <strong>Configuration:</strong> API key authentication is sufficient for most deployments.
            Paste your Vertex/Gemini API key above — service account JSON is not required.
            Use model <code className="font-mono text-[11px]">gemini-2.5-flash-lite</code> for optimal quota usage.
            Project ID is for reference; authentication uses the provided API key.
          </InfoCallout>
        </>
      ) : (
        <>
          <Field
            label="API Key"
            value={settings.browseApiKey}
            onChange={(v) => update("browseApiKey", v)}
            password
            placeholder={
              provider === "gemini"
                ? "AIzaSy... from aistudio.google.com"
                : "sk-ant-... from console.anthropic.com"
            }
          />
          <Field
            label="Model"
            value={settings.browseModel}
            onChange={(v) => update("browseModel", v)}
            placeholder={
              provider === "gemini"
                ? "gemini-2.5-flash-lite"
                : "claude-sonnet-4-6"
            }
          />
        </>
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
      .then((data) => {
        const merged = { ...DEFAULTS, ...data.settings };
        if (merged.llmProvider === "custom" && !merged.browseProvider) {
          merged.browseProvider = "gemini";
          merged.browseModel = merged.browseModel || "gemini-2.5-flash-lite";
        }
        setSettings(merged);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function update<K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K],
  ) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "llmProvider" && value === "custom") {
        if (!next.browseProvider) next.browseProvider = "gemini";
        if (!next.browseModel) next.browseModel = "gemini-2.5-flash-lite";
      }
      return next;
    });
    setSaved(false);
  }

  async function save() {
    if (settings.llmProvider === "custom" && !settings.browseApiKey.trim()) {
      toast(
        "Add a Browsing LLM API key (Gemini) — mimo cannot navigate the LOS UI",
        "error",
      );
      return;
    }
    try {
      await apiFetch("/api/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });
      setSaved(true);
      toast("Settings saved");
    } catch {
      toast("Failed to save settings", "error");
    }
  }

  async function testLosConnection() {
    setTestLos("");
    try {
      const r = await fetch(`${settings.losUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: settings.losUsername,
          password: settings.losPassword,
        }),
      });
      setTestLos(r.ok ? "✓ Login successful" : `✗ HTTP ${r.status}`);
    } catch {
      setTestLos("✗ Cannot reach server");
    }
  }

  const extractionOptions = [
    {
      value: "browser",
      label: "Browser + API fallback (demo — browse UI, API fills gaps)",
    },
    { value: "api", label: "API only (fastest — skip browser navigation)" },
  ];

  const [activeTab, setActiveTab] = useState<"config" | "skills">("skills");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 ">
        <div className="max-w-3xl mx-auto px-6 flex items-center gap-1">
          <button
            onClick={() => setActiveTab("skills")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "skills" ? "border-amber-500 text-amber-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <FileText className="w-4 h-4" />
            Skills & SOP
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "config" ? "border-amber-500 text-amber-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <Settings className="w-4 h-4" />
            Configuration
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "config" ? (
          <div className="h-full overflow-auto">
            <div className="max-w-3xl mx-auto px-6 py-8">
              <div className="flex items-center gap-3 mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <div className="flex-1" />
                <button
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  onClick={save}
                  disabled={loading}
                >
                  {saved ? "✓ Saved" : "Save changes"}
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col gap-4">
                  <SkeletonBlock lines={4} />
                  <SkeletonBlock lines={3} />
                  <SkeletonBlock lines={5} />
                </div>
              ) : (
                <>
                  <InfoCallout variant="info">
                    <strong>Architecture Note:</strong> The system uses two separate LLM providers.
                    The <span className="font-medium">Copilot LLM</span> handles conversational AI and memo generation (OpenAI-compatible).
                    The <span className="font-medium">Browsing LLM</span> drives autonomous browser navigation for data extraction (Gemini or Claude required).
                  </InfoCallout>

                  <CollapsibleSection
                    title="Copilot LLM"
                    desc="Powers copilot chat and credit memo generation"
                    icon="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    status={memoLlmStatus(settings)}
                    defaultOpen={false}
                  >
                    <MemoLlmFields settings={settings} update={update} />
                  </CollapsibleSection>

                  <CollapsibleSection
                    title="Browsing LLM"
                    desc="Navigates the LOS UI in the browser"
                    icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    defaultOpen={false}
                    status={browseLlmStatus(settings)}
                  >
                    <BrowseLlmFields settings={settings} update={update} />
                  </CollapsibleSection>

                  <CollapsibleSection
                    title="LOS Connection"
                    desc="Bank CIMB Niaga Loan Origination System"
                    icon="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    status={settings.losUrl ? "ok" : "empty"}
                  >
                    <Field
                      label="LOS Base URL"
                      value={settings.losUrl}
                      onChange={(v) => update("losUrl", v)}
                      placeholder="http://localhost:3333"
                    />
                    <Field
                      label="Username"
                      value={settings.losUsername}
                      onChange={(v) => update("losUsername", v)}
                    />
                    <Field
                      label="Password"
                      value={settings.losPassword}
                      onChange={(v) => update("losPassword", v)}
                      password
                    />
                    <Field
                      label="Login page path"
                      value={settings.losLoginPath}
                      onChange={(v) => update("losLoginPath", v)}
                      placeholder="/login"
                    />
                    <TestBtn
                      label="Test LOS Connection"
                      onClick={testLosConnection}
                      result={testLos}
                    />
                  </CollapsibleSection>

                  <CollapsibleSection
                    title="Agent"
                    desc="Browser behavior and extraction strategy"
                    icon="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z"
                    defaultOpen={false}
                  >
                    <Select
                      label="Extraction mode"
                      value={settings.extractionMode}
                      onChange={(v) => update("extractionMode", v)}
                      options={extractionOptions}
                    />
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="mockAgent"
                        checked={settings.mockAgent}
                        onChange={(e) => update("mockAgent", e.target.checked)}
                        className="accent-amber-500 w-4 h-4 rounded border-slate-300"
                      />
                      <label
                        htmlFor="mockAgent"
                        className="text-sm text-slate-600 cursor-pointer"
                      >
                        Mock agent mode (no Python, uses seeded fixtures)
                      </label>
                    </div>
                  </CollapsibleSection>
                </>
              )}
            </div>
          </div>
        ) : (
          <SkillsTab />
        )}
      </div>
    </div>
  );
}

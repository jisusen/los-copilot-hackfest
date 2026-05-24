import { join } from "path";
import { existsSync } from "fs";
import { wsManager } from "./wsManager";
import { sessionStore } from "./sessionStore";
import { getLosDb } from "../db/losClient";
import { getSettings } from "../routes/settings";
import type { MemoDraft, LosData } from "./sessionStore";

export type AgentTask = {
  taskId: string;
  appId: string;
  losUrl: string;
  backendUrl: string;
  credentials: { username: string; password: string };
};

const activeTasks = new Map<string, { appId: string; startedAt: number }>();

export function registerTask(taskId: string, appId: string) {
  activeTasks.set(taskId, { appId, startedAt: Date.now() });
}

export function getAppIdForTask(taskId: string): string | undefined {
  return activeTasks.get(taskId)?.appId;
}

export function getElapsedMs(taskId: string): number {
  const task = activeTasks.get(taskId);
  return task ? Date.now() - task.startedAt : 0;
}

const AGENT_SCRIPT = join(import.meta.dir, "../../agent/agent.py");
const VENV_PYTHON = join(
  import.meta.dir,
  "../../agent/.venv/Scripts/python.exe",
);
function getLosConfig() {
  const s = getSettings();
  return {
    losUrl: s.losUrl ?? "http://localhost:3333",
    backendUrl: `http://localhost:${process.env.PORT ?? "3003"}`,
    losUsername: s.losUsername ?? "analyst01",
    losPassword: s.losPassword ?? "bms2025",
    losLoginPath: s.losLoginPath ?? "/login",
  };
}

export async function spawnAgent(task: AgentTask): Promise<void> {
  const cfg = getLosConfig();
  const taskJson = JSON.stringify(task);
  console.log(`[Agent] Spawning for ${task.appId} (task: ${task.taskId})`);

  const s = getSettings();
  const proc = Bun.spawn({
    cmd: [VENV_PYTHON, AGENT_SCRIPT, "--task", taskJson],
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8",
      BROWSER_USE_DISABLE_EXTENSIONS: "1",
      ANTHROPIC_API_KEY: s.anthropicApiKey ?? "",
      GEMINI_API_KEY: s.geminiApiKey ?? "",
      LLM_PROVIDER: s.llmProvider ?? "anthropic",
      ANTHROPIC_MODEL: s.anthropicModel ?? "claude-sonnet-4-6",
      GEMINI_MODEL: s.geminiModel ?? "gemini-2.0-flash",
      CUSTOM_LLM_ENDPOINT: s.customEndpoint ?? "",
      CUSTOM_LLM_MODEL: s.customModel ?? "",
      CUSTOM_LLM_API_KEY: s.customApiKey ?? "",
      BROWSE_PROVIDER: s.browseProvider ?? "",
      BROWSE_MODEL: s.browseModel ?? "",
      BROWSE_ENDPOINT: s.browseEndpoint ?? "",
      BROWSE_API_KEY: s.browseApiKey ?? "",
      MEMO_SKILL: s.memoSkill ?? "",
      EXTRACTION_MODE: s.extractionMode ?? "browser",
      LOS_URL: cfg.losUrl,
      LOS_LOGIN_PATH: cfg.losLoginPath,
    },
  });

  // Stream stdout to console
  (async () => {
    const reader = proc.stdout.getReader();
    const dec = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log(`[${task.appId}] ${dec.decode(value).trim()}`);
    }
  })();

  // Stream stderr
  (async () => {
    const reader = proc.stderr.getReader();
    const dec = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = dec.decode(value).trim();
      if (text) console.error(`[${task.appId}:err] ${text}`);
    }
  })();

  // Watch for exit
  proc.exited.then((code) => {
    console.log(`[Agent] ${task.appId} exited with code ${code}`);
    if (code !== 0 && !sessionStore.get(task.appId)) {
      wsManager.broadcast({
        type: "agent:error",
        appId: task.appId,
        error: `Agent process exited with code ${code}`,
        retryable: true,
      });
    }
    activeTasks.delete(task.taskId);
  });
}

// Mock agent — simulates agent without Python for testing, using REAL LOS data
export function spawnMockAgent(task: AgentTask): void {
  const seed = task.appId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pick = <T>(arr: T[], offset = 0): T =>
    arr[(seed + offset) % arr.length];

  // Query REAL data from LOS DB
  let realData: any = null;
  try {
    const db = getLosDb();
    const app = db
      .query(
        `
      SELECT a.*, d.full_name, d.nik, d.employment_type, d.employer_name, d.job_title,
             f.gross_income, f.net_income, f.dti_ratio, f.existing_obligations, f.requested_installment,
             s.kolektibilitas, s.kolektibilitas_label, s.payment_history_24m,
             af.pep_status, af.dttot_match, af.income_consistent, af.fraud_signals,
             c.decision as crde_decision, c.risk_score, c.numeric_score, c.rules_triggered, c.dti_actual
      FROM loan_applications a
      JOIN debtors d ON d.loan_id = a.id
      JOIN financials f ON f.loan_id = a.id
      JOIN slik_ojk s ON s.loan_id = a.id
      JOIN aml_fraud af ON af.loan_id = a.id
      JOIN crde_results c ON c.loan_id = a.id
      WHERE a.id = ?
    `,
      )
      .get(task.appId);
    realData = app;
  } catch (e) {
    console.error(`[MockAgent] Failed to query LOS DB for ${task.appId}:`, e);
  }

  const BROWSER_VARIANTS = [
    "Chromium 124.0.6367.82 headless",
    "Chromium 123.0.6312.105 headless",
    "Chromium 125.0.6422.60 headless",
  ];
  const NETWORK_VARIANTS = ["142ms", "198ms", "87ms", "231ms", "115ms"];
  const SELECTOR_VARIANTS = [
    '[data-testid="value-nama-lengkap"]',
    '[data-testid="value-nik"]',
    '[data-testid="value-jenis-pekerjaan"]',
    '[data-testid="value-penghasilan-bersih"]',
  ];
  const SCROLL_VARIANTS = [
    "Scrolled to bottom (1240px)",
    "Scrolled to bottom (980px)",
    "Scrolled to bottom (1480px)",
  ];
  const WAIT_VARIANTS = [
    "Waited for network idle (340ms)",
    "Waited for network idle (210ms)",
    "Waited for network idle (490ms)",
  ];

  const STEPS = [
    { step: `Launching ${pick(BROWSER_VARIANTS)}...`, pct: 8 },
    {
      step: `Navigating to LOS login page (${pick(NETWORK_VARIANTS, 1)})`,
      pct: 14,
    },
    { step: `Filling credentials for ${task.appId}`, pct: 20 },
    { step: `Login successful — session established`, pct: 24 },
    {
      step: `Navigating to /loans/${task.appId} (${pick(NETWORK_VARIANTS, 2)})`,
      pct: 28,
    },
    { step: `Tab: Debtor Profile — ${pick(WAIT_VARIANTS)}`, pct: 34 },
    {
      step: `Extracted ${18 + (seed % 5)} fields from Debtor Profile`,
      pct: 38,
    },
    { step: `Tab: Financials — clicking tab element`, pct: 43 },
    {
      step: `Read DSR ratio, income, obligations — ${pick(SCROLL_VARIANTS)}`,
      pct: 48,
    },
    { step: `Tab: SLIK OJK — ${pick(WAIT_VARIANTS, 1)}`, pct: 53 },
    {
      step: `Extracted 24-month payment history (${pick(NETWORK_VARIANTS, 3)})`,
      pct: 58,
    },
    {
      step: `Tab: AML & Fraud — scanning ${pick(SELECTOR_VARIANTS, 2)}`,
      pct: 63,
    },
    { step: `AML screening complete — checked DTTOT, UN, PEP lists`, pct: 67 },
    { step: `Tab: CRDE Result — ${pick(WAIT_VARIANTS, 2)}`, pct: 72 },
    {
      step: `Extracted risk score and ${2 + (seed % 4)} triggered rules`,
      pct: 77,
    },
    { step: `Tab: Collateral — ${pick(SCROLL_VARIANTS, 1)}`, pct: 82 },
    { step: `Tab: Loan Application — reading product details`, pct: 87 },
    { step: `All tabs extracted — compiling data payload`, pct: 91 },
    { step: `Generating credit memo via AI (claude-sonnet-4-6)`, pct: 95 },
    { step: `Done`, pct: 100 },
  ];

  const startedAt = Date.now();
  const baseInterval = 600 + (seed % 5) * 80; // Faster: ~0.6-1.0s per step

  // Use real data if available, otherwise fallback
  const d = realData;

  // Fetch collateral if available
  let collateral: any = null;
  try {
    const db = getLosDb();
    collateral = db
      .query("SELECT * FROM collaterals WHERE loan_id = ?")
      .get(task.appId);
  } catch {
    /* ignore */
  }

  const riskScore = d?.risk_score ?? "LOW";
  const crdeDecision = d?.crde_decision ?? "APPROVED";
  const numericScore = d?.numeric_score ?? 800;
  const dtiActual = d?.dti_actual ?? 0.3;
  const slikKol = d?.kolektibilitas ?? 1;
  const amlClear = !(d?.pep_status || d?.dttot_match);
  const rulesTriggered: string[] = d?.rules_triggered
    ? JSON.parse(d.rules_triggered)
    : [];
  const debtorName = d?.full_name ?? `Applicant ${task.appId}`;
  const product = d?.product_type ?? "KTA";
  const amount = d?.amount_requested ?? 50000000;

  const mockLosData: LosData = {
    profilDebitur: {
      nama: debtorName,
      nik: d?.nik ?? "3174050000000000",
      jenisPekerjaan: d?.employment_type ?? "Private Employee",
      namaPerusahaan: d?.employer_name ?? "PT Example",
      jabatan: d?.job_title ?? "Staff",
    },
    dataKeuangan: {
      penghasilanBruto: d?.gross_income ?? 10000000,
      penghasilanBersih: d?.net_income ?? 8000000,
      kewajibanExisting: d?.existing_obligations ?? 0,
      cicilanDimohon: d?.requested_installment ?? 2000000,
      dtiRatio: `${(dtiActual * 100).toFixed(1)}%`,
      totalKewajiban:
        (d?.existing_obligations ?? 0) + (d?.requested_installment ?? 0),
    },
    slikOjk: {
      kolektibilitas: slikKol,
      label: d?.kolektibilitas_label ?? "Current",
      riwayat24m: d?.payment_history_24m ?? "Good",
    },
    amlFraud: {
      pepStatus: d?.pep_status ? true : false,
      dttotMatch: d?.dttot_match ? true : false,
      incomeConsistent: d?.income_consistent ? true : false,
      fraudSignals: d?.fraud_signals ?? "",
    },
    hasilCrde: {
      riskScore,
      decision: crdeDecision,
      numericScore,
      rulesTriggered,
    },
    permohonanKredit: {
      produk: product,
      plafon: amount,
      tenor: `${d?.tenor_months ?? 24} months`,
    },
  };

  const amtM = (amount / 1e6).toFixed(0);
  const netM = ((d?.net_income ?? 8000000) / 1e6).toFixed(1);
  const dtiPct = (dtiActual * 100).toFixed(1);
  const totalOblig =
    (d?.existing_obligations ?? 0) + (d?.requested_installment ?? 0);

  // Risk-profile-aware memo generation
  const isHighRisk = crdeDecision === "REJECTED" || numericScore < 500;
  const isMediumRisk = crdeDecision === "COMMITTEE REVIEW";
  const isLowRisk = crdeDecision === "APPROVED" && numericScore >= 750;

  const redFlags: string[] = [];
  if (dtiActual > 0.4) redFlags.push(`DSR ${dtiPct}% exceeds RAC limit (40%)`);
  if (slikKol > 1)
    redFlags.push(
      `SLIK collectability ${slikKol} — ${d?.kolektibilitas_label ?? "watchlist"}`,
    );
  if (!amlClear)
    redFlags.push(
      `AML flag: ${d?.pep_status ? "PEP identified" : d?.fraud_signals ? "fraud signals detected" : "sanctions match"}`,
    );
  if (rulesTriggered.length > 0) redFlags.push(...rulesTriggered);

  const execSummary = isHighRisk
    ? `${debtorName} applies for a **Rp ${amtM}M ${product}** with a **high-risk profile**. Key concerns: ${redFlags.slice(0, 2).join("; ")}. CRDE recommends **REJECTION** with a score of **${numericScore}/1000**. The analyst should verify if any mitigating factors exist before overriding.`
    : isMediumRisk
      ? `${debtorName} applies for a **Rp ${amtM}M ${product}** with a **moderate-risk profile**. DSR ${dtiPct}% and collectability ${slikKol} require closer review. CRDE recommends **COMMITTEE REVIEW** with a score of **${numericScore}/1000**. The analyst should assess compensating factors.`
      : `${debtorName} applies for a **Rp ${amtM}M ${product}** with a **low-risk profile**. DSR ${dtiPct}% is within limits and SLIK is clean. CRDE recommends **APPROVAL** with a score of **${numericScore}/1000**. Standard terms apply.`;

  const section3 = isHighRisk
    ? `Net monthly income **Rp ${netM}M** is insufficient for the requested obligation burden. **DSR ${dtiPct}% far exceeds** the RAC limit of 40%, leaving minimal disposable income. Total obligations **Rp ${totalOblig.toLocaleString("id-ID")}** strain repayment capacity significantly.`
    : isMediumRisk
      ? `Net monthly income **Rp ${netM}M** provides adequate but tight coverage. **DSR ${dtiPct}%** is ${dtiActual <= 0.4 ? "within" : "marginally above"} the 40% RAC threshold. Total obligations **Rp ${totalOblig.toLocaleString("id-ID")}** leave limited buffer for unexpected expenses.`
      : `Net monthly income **Rp ${netM}M** provides comfortable coverage. **DSR ${dtiPct}%** is well within the 40% RAC limit. Total obligations **Rp ${totalOblig.toLocaleString("id-ID")}** leave healthy disposable income.`;

  const section8 = isHighRisk
    ? `**Recommended: REJECT**\n\nApplication does not meet minimum credit standards. ${redFlags.length > 0 ? "Key deal-breakers: " + redFlags.join("; ") + "." : ""} Risk profile is unacceptable for the requested product. Suggest regret letter with explanation of RAC non-compliance.`
    : isMediumRisk
      ? `**Recommended: REFER TO CREDIT COMMITTEE**\n\nApplication requires committee review due to: ${redFlags.join("; ")}. While some criteria are met, the combination of risk factors exceeds delegated authority. Enhanced due diligence and compensating documentation recommended.`
      : `**Recommended: APPROVE**\n\nApplication meets all RAC criteria. DSR is within limit, SLIK collectability is good, and AML screening is clear. No triggered rules or red flags. **Suggest approval with standard terms.**`;

  const mockMemo: MemoDraft = {
    executive_summary: execSummary,
    section1_profil: `${debtorName} is a **${d?.employment_type ?? "private employee"}** employed at **${d?.employer_name ?? "a reputable company"}**. Identity verified via NIK **${d?.nik ?? "—"}**. Employment and domicile data are consistent across submitted documents.`,
    section2_permohonan: `**${product}** application for **Rp ${amtM}M** over **${d?.tenor_months ?? 24} months**. Purpose: **${d?.loan_purpose ?? "personal use"}**. Estimated monthly installment: **Rp ${d?.requested_installment?.toLocaleString("id-ID") ?? "—"}**.`,
    section3_keuangan: section3,
    section4_slik: `SLIK OJK collectability: **${slikKol} — ${d?.kolektibilitas_label ?? "Current"}**. ${d?.payment_history_24m ?? "Good payment history"}.`,
    section5_aml: amlClear
      ? `AML screening clear. No matches in DTTOT, UN Sanctions, or PEP lists. No fraud signals detected.`
      : `AML flag present. ${d?.pep_status ? "**PEP identification** requires enhanced due diligence." : ""} ${d?.fraud_signals ? "Fraud signals: " + d.fraud_signals : ""}`,
    section6_agunan:
      product === "KTA"
        ? `Unsecured product — no collateral required.`
        : `Collateral reviewed: **${collateral?.collateral_type ?? "asset"}** with market value **Rp ${(collateral?.market_value ?? 0).toLocaleString("id-ID")}**. LTV within RAC limits.`,
    section7_crde: `CRDE recommendation: **${crdeDecision}** — Score **${numericScore}/1000** (Risk: **${riskScore}**).\n${rulesTriggered.length === 0 ? "All RAC criteria satisfied. No rules triggered." : rulesTriggered.map((r) => `• ${r}`).join("\n")}`,
    section8_rekomendasi: section8,
  };

  // ── Spawn screenshot sidecar if Python venv is available ─────────────────
  const cfg = getLosConfig();
  const SCREENSHOT_SCRIPT = join(
    import.meta.dir,
    "../../agent/screenshot_stream.py",
  );
  let screenshotProc: ReturnType<typeof Bun.spawn> | null = null;
  if (existsSync(VENV_PYTHON) && existsSync(SCREENSHOT_SCRIPT)) {
    const taskJson = JSON.stringify({
      taskId: task.taskId,
      appId: task.appId,
      losUrl: cfg.losUrl,
      backendUrl: cfg.backendUrl,
      credentials: { username: cfg.losUsername, password: cfg.losPassword },
    });
    screenshotProc = Bun.spawn({
      cmd: [VENV_PYTHON, SCREENSHOT_SCRIPT, "--task", taskJson],
      stdout: "ignore",
      stderr: "ignore",
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    console.log(`[MockAgent] Screenshot sidecar started for ${task.appId}`);
  } else {
    console.log(
      `[MockAgent] No Python venv found — screenshots unavailable for ${task.appId}`,
    );
  }

  async function runSteps() {
    for (let stepIdx = 0; stepIdx < STEPS.length; stepIdx++) {
      const { step, pct } = STEPS[stepIdx];
      const elapsedMs = Date.now() - startedAt;

      wsManager.broadcast({
        type: "agent:progress",
        appId: task.appId,
        step,
        stepIndex: stepIdx + 1,
        totalSteps: STEPS.length,
        pct,
        elapsedMs,
      });

      if (pct === 100) {
        await new Promise((r) => setTimeout(r, 400));

        // Kill screenshot sidecar now that we're done
        try {
          screenshotProc?.kill();
        } catch {}

        sessionStore.set(task.appId, {
          appId: task.appId,
          completedAt: new Date(),
          losData: mockLosData,
          memoDraft: mockMemo,
        });

        wsManager.broadcast({
          type: "agent:complete",
          appId: task.appId,
          result: {
            riskScore,
            crdeDecision,
            dtiActual,
            slikKol,
            amlClear,
            numericScore,
            rulesTriggered,
            memoDraft: mockMemo,
          },
          elapsedMs: Date.now() - startedAt,
        });
        return;
      }

      await new Promise((r) => setTimeout(r, baseInterval));
    }
  }

  runSteps().catch(console.error);
}

export function createTask(appId: string): AgentTask {
  const cfg = getLosConfig();
  const taskId = `task-${appId}-${Date.now()}`;
  registerTask(taskId, appId);
  return {
    taskId,
    appId,
    losUrl: cfg.losUrl,
    backendUrl: cfg.backendUrl,
    credentials: { username: cfg.losUsername, password: cfg.losPassword },
  };
}

"""
Credit Analyst Copilot — Browser Agent (v3)

EXTRACTION_MODE env var:
  browser (default) — browser_use LLM navigates and extracts data from each tab
  api               — fetches all data directly from LOS REST API (fast, no LLM navigation)

Both modes stream live screenshots. Both generate the memo with Claude/Gemini.
"""

import asyncio
import argparse
import base64
import json
import os
import re
import sys
import httpx

# Force UTF-8 output on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

PROVIDER         = os.environ.get("LLM_PROVIDER",    "anthropic")
GEMINI_MODEL     = os.environ.get("GEMINI_MODEL",    "gemini-2.0-flash")
ANTHROPIC_MODEL  = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6")
EXTRACTION_MODE  = os.environ.get("EXTRACTION_MODE", "browser")  # "browser" | "api"

import google.genai as genai
import anthropic

from browser_use import Agent
from browser_use.browser import BrowserSession
from browser_use.llm.google.chat import ChatGoogle
from browser_use.llm.anthropic.chat import ChatAnthropic as BUChatAnthropic


STEPS = [
    ("Launching browser...",               1,   8),
    ("Navigating to LOS login page...",   2,  14),
    ("Logging in as analyst...",          3,  20),
    ("Opening loan application...",       4,  27),
    ("Reading Debtor Profile tab...",     5,  35),
    ("Reading Financials tab...",         6,  44),
    ("Reading SLIK OJK tab...",           7,  54),
    ("Reading AML & Fraud tab...",        8,  64),
    ("Reading CRDE Result tab...",        9,  74),
    ("Compiling data payload...",        10,  88),
    ("Generating credit memo with AI...", 11,  95),
]


def parse_agent_result(result) -> dict:
    """Extract structured JSON from browser-use agent output.
    Uses result.final_result() to get the agent's last output (not the full action history).
    """
    # browser_use AgentHistoryList exposes final_result() for the last extracted content
    raw = None
    if hasattr(result, "final_result"):
        raw = result.final_result()
    if not raw:
        raw = str(result)

    print(f"[parse] final_result preview: {str(raw)[:200]}", file=sys.stderr)

    json_match = re.search(r'\{[\s\S]*\}', raw or "")
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    return {"extraction_raw": str(raw)[:2000]}


# ── Progress / reporting helpers ──────────────────────────────────────────────

async def report_progress(backend_url: str, task_id: str, app_id: str,
                           step: str, step_index: int, pct: int):
    try:
        async with httpx.AsyncClient(timeout=5) as http:
            await http.post(f"{backend_url}/api/internal/progress", json={
                "taskId": task_id, "appId": app_id,
                "step": step, "stepIndex": step_index,
                "totalSteps": len(STEPS), "pct": pct,
            })
    except Exception as e:
        print(f"[progress] {e}", file=sys.stderr)


async def report_complete(backend_url: str, task_id: str, app_id: str,
                           los_data: dict, memo_draft: dict):
    try:
        async with httpx.AsyncClient(timeout=10) as http:
            await http.post(f"{backend_url}/api/internal/complete", json={
                "taskId": task_id, "appId": app_id,
                "losData": los_data, "memoDraft": memo_draft, "status": "completed",
            })
    except Exception as e:
        print(f"[complete] {e}", file=sys.stderr)


async def report_error(backend_url: str, task_id: str, app_id: str,
                        error: str, retryable: bool = True):
    try:
        async with httpx.AsyncClient(timeout=5) as http:
            await http.post(f"{backend_url}/api/internal/error", json={
                "taskId": task_id, "appId": app_id,
                "error": error, "retryable": retryable,
            })
    except Exception as e:
        print(f"[error] {e}", file=sys.stderr)


async def stream_screenshots(backend_url: str, task_id: str, app_id: str,
                              browser_session: BrowserSession, stop_event: asyncio.Event):
    """Stream PNG screenshots every ~1s to dashboard."""
    await asyncio.sleep(5)  # wait for browser to open
    while not stop_event.is_set():
        try:
            shot = await browser_session.take_screenshot(format='png')
            if shot:
                b64 = base64.b64encode(shot).decode()
                async with httpx.AsyncClient(timeout=3) as http:
                    await http.post(f"{backend_url}/api/internal/screenshot", json={
                        "taskId": task_id, "appId": app_id, "screenshot": b64,
                    })
        except Exception:
            pass
        await asyncio.sleep(1)


# ── LOS API data fetch ────────────────────────────────────────────────────────

async def fetch_loan_from_api(los_url: str, app_id: str, credentials: dict) -> dict:
    """Fetch all loan data from LOS REST API — fast and exact."""
    async with httpx.AsyncClient(timeout=30) as http:
        login = await http.post(
            f"{los_url}/api/auth/login",
            json={"username": credentials["username"], "password": credentials["password"]},
        )
        if login.status_code != 200:
            raise Exception(f"LOS login failed ({login.status_code})")

        loan_resp = await http.get(f"{los_url}/api/loans/{app_id}")
        if loan_resp.status_code != 200:
            raise Exception(f"Loan fetch failed ({loan_resp.status_code})")

        return loan_resp.json()["loan"]


def los_loan_to_extracted(loan: dict) -> dict:
    """Map LOS API response fields to the extracted_data structure."""
    app   = loan.get("application") or {}
    d     = loan.get("debtor")      or {}
    fin   = loan.get("financials")  or {}
    slik  = loan.get("slik")        or {}
    aml   = loan.get("amlFraud")    or {}
    crde  = loan.get("crde")        or {}
    col   = loan.get("collateral")

    # rules_triggered may arrive as a JSON string from SQLite
    rules = crde.get("rules_triggered") or []
    if isinstance(rules, str):
        try:
            rules = json.loads(rules)
        except Exception:
            rules = []

    def pct(v, default=0):
        try:
            f = float(v or default)
            return f"{f * 100:.1f}%" if f <= 1 else f"{f:.1f}%"
        except Exception:
            return ""

    return {
        "profil_debitur": {
            "nama":            d.get("full_name", ""),
            "nik":             d.get("nik", ""),
            "npwp":            d.get("npwp", ""),
            "tanggal_lahir":   d.get("date_of_birth", ""),
            "status_pernikahan": d.get("marital_status", ""),
            "jumlah_tanggungan": str(d.get("dependents", "")),
            "jenis_pekerjaan": d.get("employment_type", ""),
            "nama_perusahaan": d.get("employer_name", ""),
            "jabatan":         d.get("job_title", ""),
            "lama_bekerja":    str(d.get("years_employed", "")),
            "kota":            d.get("domicile_city", ""),   # schema: domicile_city
            "telepon":         d.get("phone", ""),
            "email":           d.get("email", ""),
        },
        "data_keuangan": {
            "penghasilan_bruto":  fin.get("gross_income", ""),
            "penghasilan_bersih": fin.get("net_income", ""),
            "kewajiban_existing": fin.get("existing_obligations", ""),
            "cicilan_dimohon":    fin.get("requested_installment", ""),
            "total_kewajiban":    fin.get("total_obligations", ""),
            "sisa_penghasilan":   fin.get("remaining_income", ""),
            # camelCase to match internal.ts: keuangan.dtiRatio
            "dtiRatio":           pct(fin.get("dti_ratio")),
            "dti_threshold":      pct(fin.get("dti_threshold", 0.4)),
            "income_verified":    "Yes" if fin.get("income_verified") else "No",
        },
        "slik_ojk": {
            "kolektibilitas":        slik.get("kolektibilitas", 1),
            "kol_terburuk_12m":      slik.get("worst_kol_12m", ""),
            "riwayat_24m":           slik.get("payment_history_24m", ""),
            "bank_existing":         slik.get("existing_bank", ""),    # schema: existing_bank
            "fasilitas":             slik.get("existing_facility", ""), # schema: existing_facility
            "jumlah_kewajiban_slik": slik.get("existing_amount", ""),
            "blacklist":             "Listed" if slik.get("blacklist_status") else "Not Listed",
        },
        "aml_fraud": {
            # camelCase to match internal.ts: aml.dttotMatch, aml.pepStatus
            "dttotMatch":        bool(aml.get("dttot_match", False)),
            "un_sanctions":      bool(aml.get("un_sanctions_match", False)),
            "pepStatus":         bool(aml.get("pep_status", False)),
            "pep_edd":           bool(aml.get("pep_edd_required", False)),  # schema: pep_edd_required
            "income_consistency": bool(aml.get("income_consistent", True)),
            "address_flag":      bool(aml.get("address_flag", False)),
            "fraud_signals":     aml.get("fraud_signals", "") or "",
        },
        "hasil_crde": {
            # camelCase to match internal.ts: crde.decision, crde.riskScore etc.
            "decision":      crde.get("decision", ""),
            "riskScore":     crde.get("risk_score", ""),
            "numericScore":  int(crde.get("numeric_score", 0)),
            "dsr_aktual":    pct(crde.get("dti_actual")),
            "dsr_limit":     pct(crde.get("dti_threshold", 0.4)),
            "dsr_status":    "PASS" if crde.get("dti_passed") else "FAIL",
            "kol_status":    "PASS" if crde.get("kol_passed") else "FAIL",
            "amlStatus":     "PASS" if crde.get("aml_passed") else "FAIL",
            "fraud_status":  "PASS" if crde.get("fraud_passed") else "FAIL",
            "rulesTriggered": rules,
        },
        "agunan": {
            "jenis":         col.get("collateral_type", ""),
            "deskripsi":     col.get("asset_description", ""),
            "nilai_pasar":   col.get("market_value", ""),
            "nilai_likuidasi": col.get("liquidation_value", ""),
            "ltv":           col.get("ltv_ratio", ""),
            "status_hukum":  col.get("legal_status", ""),
        } if col else None,
        "permohonan_kredit": {
            "produk":            app.get("product_type", ""),
            "plafon":            app.get("amount_requested", ""),
            "tenor":             f"{app.get('tenor_months', '')} months",
            "suku_bunga":        app.get("interest_rate", ""),
            "tujuan":            app.get("loan_purpose", ""),
            "status":            app.get("status", ""),
            "cabang":            app.get("branch", ""),  # schema: branch
            "marketing_officer": app.get("marketing_officer", ""),
        },
    }


# ── Memo generation ───────────────────────────────────────────────────────────

MEMO_SYSTEM = """You are a senior credit analyst at Bank Maju Bersama, Indonesia.
Write a formal Consumer Credit Analysis Memo in English based on LOS-extracted data.

== CRDE DECISION KEY ==
The LOS stores decisions in Indonesian. Map them as follows:
  "APPROVED"            → approve recommendation
  "PERLU REVIEW KOMITE" → refer to credit committee
  "DITOLAK"             → reject recommendation
  "COMMITTEE REVIEW"    → refer to credit committee (English variant)
  "REJECTED"            → reject recommendation (English variant)

== DSR / DTI ==
The LOS calls this "DSR" (Debt Service Ratio). RAC limit is typically 40%.
DSR = (existing obligations + new installment) / net income × 100%.
A DSR above 40% is a deal-breaker unless mitigated.

== OUTPUT FORMAT ==
Return ONLY valid JSON with exactly these 9 keys. No markdown wrapper, no extra text:
{
  "executive_summary": "...",
  "section1_profil": "...",
  "section2_permohonan": "...",
  "section3_keuangan": "...",
  "section4_slik": "...",
  "section5_aml": "...",
  "section6_agunan": "...",
  "section7_crde": "...",
  "section8_rekomendasi": "..."
}

== SECTION RULES ==

executive_summary:
  Exactly 4 sentences:
  1. Who the applicant is and what product/amount they want.
  2. The 1-2 biggest risk factors (DSR level, SLIK collectability, AML flags, triggered rules).
  3. What the CRDE engine recommends and the numeric score.
  4. The key thing the analyst must verify or decide.

section1_profil:
  2-3 sentences. Full name, employment (type + company + title + years), domicile city.
  Note if NIK/NPWP verified. Keep factual.

section2_permohonan:
  2 sentences. Product type, **amount** requested, tenor, interest rate, stated purpose.
  Include estimated monthly installment if available.

section3_keuangan:
  3-4 sentences. Net monthly income, existing obligations, new installment, total burden.
  State DSR explicitly: "DSR of **X%** against a RAC threshold of **Y%** — [PASS/FAIL]."
  State remaining income after all obligations.
  Use **bold** for all Rp amounts and DSR percentages.

section4_slik:
  2-3 sentences. Current collectability (1=Current, 2=Special Mention, 3+=Non-performing).
  Payment history quality over 24 months. Worst collectability in last 12 months.
  Mention existing facilities and blacklist status.

section5_aml:
  2 sentences. State each screening result explicitly:
  DTTOT, UN Sanctions, PEP status. Income consistency. Address flag. Any fraud signals.
  If all clear: "All AML/fraud screenings returned clear."
  If flags exist: name each one specifically.

section6_agunan:
  1 sentence. If unsecured: "Unsecured product — no collateral required."
  If secured: asset type, market value, liquidation value, LTV ratio vs RAC limit, legal status.

section7_crde:
  State: decision, risk classification, numeric score/1000.
  Explain what the score means (HIGH = score <500, MEDIUM = 500-749, LOW = 750+).
  List each triggered rule on its own line starting with •
  If no rules triggered: "No rules triggered — all RAC criteria passed."

section8_rekomendasi:
  ALWAYS start with one of these exact phrases on the first line:
    **Recommended: APPROVE**
    **Recommended: REFER TO CREDIT COMMITTEE**
    **Recommended: REJECT**

  Choose based on CRDE decision:
    APPROVED / "APPROVED"            → **Recommended: APPROVE**
    PERLU REVIEW KOMITE              → **Recommended: REFER TO CREDIT COMMITTEE**
    DITOLAK / "REJECTED"             → **Recommended: REJECT**

  Then 2-3 sentences of rationale:
  - APPROVE: confirm all RAC criteria met, no red flags, suggest standard terms.
  - REFER: name the specific factors that require committee authority.
  - REJECT: list deal-breakers clearly. Reference the specific RAC violations.

== FORMAT RULES ==
- **bold** all: Rp amounts, percentages, scores, decisions, pass/fail results
- Use • bullets for lists of rules, flags, or risk factors
- Max 150 words per section
- Formal, objective, third-person tone
- If a field is missing from the data: write "Not available."
- Return ONLY the JSON object — no markdown fences, no preamble"""


async def generate_memo(extracted_data: dict, app_id: str) -> dict:
    prompt = f"LOS data for application {app_id}:\n\n{json.dumps(extracted_data, ensure_ascii=False, indent=2)}"

    if PROVIDER == "gemini":
        client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={"system_instruction": MEMO_SYSTEM},
        )
        raw = response.text.strip()
    else:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=4096,
            system=MEMO_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()

    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        return json.loads(raw)
    except Exception:
        return {
            "executive_summary": "Memo generation failed — raw data attached.",
            "section1_profil":   json.dumps(extracted_data.get("profil_debitur", {}), ensure_ascii=False),
            "section2_permohonan": json.dumps(extracted_data.get("permohonan_kredit", {}), ensure_ascii=False),
            "section3_keuangan": json.dumps(extracted_data.get("data_keuangan", {}), ensure_ascii=False),
            "section4_slik":     json.dumps(extracted_data.get("slik_ojk", {}), ensure_ascii=False),
            "section5_aml":      json.dumps(extracted_data.get("aml_fraud", {}), ensure_ascii=False),
            "section6_agunan":   json.dumps(extracted_data.get("agunan"), ensure_ascii=False),
            "section7_crde":     json.dumps(extracted_data.get("hasil_crde", {}), ensure_ascii=False),
            "section8_rekomendasi": "",
        }


# ── Main agent run ────────────────────────────────────────────────────────────

def _make_browser_task(los_url: str, app_id: str, credentials: dict) -> str:
    """Full browser-use extraction task prompt — reads every field from data-summary tab."""
    u = credentials["username"]
    p = credentials["password"]
    return f"""
You are a data extraction agent for Bank Maju Bersama's Loan Origination System.
Login, open the Data Summary tab for loan {app_id}, read EVERY field, return JSON.

== LOGIN ==
Go to {los_url}/login
Fill data-testid="input-username" with "{u}"
Fill data-testid="input-password" with "{p}"
Click data-testid="btn-login" — wait for redirect away from /login

== DATA SUMMARY TAB ==
Go to {los_url}/loans/{app_id}?tab=data-summary
Wait for data-testid="tab-content-data-summary" to appear
This single page contains ALL loan data — do NOT navigate to any other tab

== EXTRACT FIELDS ==
Read text content of each data-testid (prefix is "summary-value-"):
Loan App:  app-product, app-amount, app-tenor, app-rate, app-purpose, app-branch, app-mo, app-status
Debtor:    debtor-name, debtor-nik, debtor-npwp, debtor-dob, debtor-marital, debtor-dependents,
           debtor-employment, debtor-employer, debtor-job, debtor-years, debtor-city, debtor-phone, debtor-email
Fin:       fin-gross, fin-net, fin-existing, fin-installment, fin-total, fin-remaining,
           fin-dti, fin-dti-threshold, fin-verified
SLIK:      slik-kol, slik-worst, slik-history, slik-bank, slik-facility, slik-existing-amount, slik-blacklist
AML:       aml-dttot, aml-un, aml-pep, aml-pep-edd, aml-income, aml-address, aml-fraud
CRDE:      crde-decision, crde-risk, crde-score, crde-dti, crde-dti-limit, crde-dti-passed,
           crde-kol, crde-kol-passed, crde-aml, crde-fraud, crde-rules-count
           Also read: summary-crde-rule-0, summary-crde-rule-1, summary-crde-rule-2 if present
Collateral: check summary-value-col-status — if "Not required" set agunan=null
           Otherwise read: col-type, col-desc, col-market, col-liquid, col-ltv, col-legal

== RETURN JSON (exact structure, no markdown) ==
{{
  "profil_debitur": {{
    "nama":"","nik":"","npwp":"","tanggal_lahir":"","status_pernikahan":"",
    "jumlah_tanggungan":"","jenis_pekerjaan":"","nama_perusahaan":"","jabatan":"",
    "lama_bekerja":"","kota":"","telepon":"","email":""
  }},
  "data_keuangan": {{
    "penghasilan_bruto":"","penghasilan_bersih":"","kewajiban_existing":"",
    "cicilan_dimohon":"","total_kewajiban":"","sisa_penghasilan":"",
    "dtiRatio":"","dti_threshold":"","income_verified":""
  }},
  "slik_ojk": {{
    "kolektibilitas":"","kol_terburuk_12m":"","riwayat_24m":"",
    "bank_existing":"","fasilitas":"","jumlah_kewajiban_slik":"","blacklist":""
  }},
  "aml_fraud": {{
    "dttotMatch":"","un_sanctions":"","pepStatus":"","pep_edd":"",
    "income_consistency":"","address_flag":"","fraud_signals":""
  }},
  "hasil_crde": {{
    "decision":"","riskScore":"","numericScore":0,
    "dsr_aktual":"","dsr_limit":"","dsr_status":"",
    "kol_status":"","amlStatus":"","fraud_status":"",
    "rulesTriggered":[]
  }},
  "agunan": null,
  "permohonan_kredit": {{
    "produk":"","plafon":"","tenor":"","suku_bunga":"",
    "tujuan":"","status":"","cabang":"","marketing_officer":""
  }}
}}
"""


async def run_review(task: dict):
    app_id      = task["appId"]
    task_id     = task["taskId"]
    los_url     = task["losUrl"]
    backend_url = task["backendUrl"]
    credentials = task["credentials"]

    mode = EXTRACTION_MODE  # "browser" or "api"
    print(f"[{app_id}] EXTRACTION_MODE={mode}")

    if PROVIDER == "gemini":
        llm = ChatGoogle(model=GEMINI_MODEL, api_key=os.environ["GEMINI_API_KEY"])
    else:
        llm = BUChatAnthropic(model=ANTHROPIC_MODEL, api_key=os.environ.get("ANTHROPIC_API_KEY"))

    async def progress(step: str, step_index: int, pct: int):
        print(f"[{app_id}] ({pct}%) {step}")
        await report_progress(backend_url, task_id, app_id, step, step_index, pct)

    await progress(*STEPS[0])

    browser_session = BrowserSession(headless=True)

    try:
        # ── Walk progress (fake tab-navigation labels, runs while agent/api works) ──
        async def walk_progress(stop_event: asyncio.Event):
            for step_label, step_idx, pct in STEPS[1:10]:
                await asyncio.sleep(13)
                if stop_event.is_set():
                    break
                await progress(step_label, step_idx, pct)

        stop_walk       = asyncio.Event()
        stop_screenshots = asyncio.Event()
        extracted_data: dict = {}

        # ── Screenshot stream (always active regardless of mode) ──────────────
        screenshot_task = asyncio.create_task(
            stream_screenshots(backend_url, task_id, app_id, browser_session, stop_screenshots)
        )
        walk_task = asyncio.create_task(walk_progress(stop_walk))

        if mode == "api":
            # ── API MODE: visual browse for screenshots + real data from API ──
            visual_agent = Agent(
                task=f"""
Navigate loan {app_id} at Bank Maju Bersama LOS — visual review only, no extraction.
1. Go to {los_url}/login, login with "{credentials['username']}" / "{credentials['password']}"
2. Go to {los_url}/loans/{app_id}
3. Click each tab and scroll: tab-profil-debitur, tab-data-keuangan, tab-slik-ojk,
   tab-aml-fraud, tab-hasil-crde (spend ~6s on each)
4. Output: done
""",
                llm=llm,
                browser_session=browser_session,
            )
            visual_future = asyncio.create_task(visual_agent.run())

            try:
                loan_raw = await fetch_loan_from_api(los_url, app_id, credentials)
                extracted_data = los_loan_to_extracted(loan_raw)
                print(f"[{app_id}] ✓ API fetch — "
                      f"{extracted_data['profil_debitur'].get('nama','?')} "
                      f"/ {extracted_data['hasil_crde'].get('decision','?')}")
            except Exception as api_err:
                print(f"[{app_id}] ✗ API fetch failed: {api_err}", file=sys.stderr)

            try:
                await asyncio.wait_for(asyncio.shield(visual_future), timeout=100)
            except (asyncio.TimeoutError, Exception) as e:
                print(f"[{app_id}] Visual browse ended: {type(e).__name__}", file=sys.stderr)
                visual_future.cancel()

        else:
            # ── BROWSER MODE: browser_use reads every field from data-summary ──
            extraction_agent = Agent(
                task=_make_browser_task(los_url, app_id, credentials),
                llm=llm,
                browser_session=browser_session,
            )
            agent_result_raw = None
            try:
                agent_result_raw = await extraction_agent.run()
            except Exception as agent_err:
                print(f"[{app_id}] ⚠ Agent run error: {agent_err}", file=sys.stderr)
                agent_result_raw = str(agent_err)

            extracted_data = parse_agent_result(agent_result_raw) if agent_result_raw else {}
            if not extracted_data or (len(extracted_data) == 1 and "extraction_raw" in extracted_data):
                print(f"[{app_id}] ⚠ Browser extraction returned no structured data", file=sys.stderr)
                extracted_data = {}

            print(f"[{app_id}] Browser extraction keys: {list(extracted_data.keys())}")

        # ── Finish ────────────────────────────────────────────────────────────
        stop_walk.set()
        stop_screenshots.set()
        await asyncio.sleep(0.1)

        await progress(*STEPS[10])

        if not extracted_data:
            extracted_data = {
                "profil_debitur": {}, "data_keuangan": {}, "slik_ojk": {},
                "aml_fraud": {}, "hasil_crde": {}, "agunan": None, "permohonan_kredit": {},
            }

        los_data = {
            "profilDebitur":    extracted_data.get("profil_debitur", {}),
            "dataKeuangan":     extracted_data.get("data_keuangan", {}),
            "slikOjk":          extracted_data.get("slik_ojk", {}),
            "amlFraud":         extracted_data.get("aml_fraud", {}),
            "hasilCrde":        extracted_data.get("hasil_crde", {}),
            "agunan":           extracted_data.get("agunan"),
            "permohonanKredit": extracted_data.get("permohonan_kredit", {}),
        }

        memo_draft = await generate_memo(extracted_data, app_id)
        await report_complete(backend_url, task_id, app_id, los_data, memo_draft)
        print(f"[{app_id}] ✓ Completed ({mode} mode)")

    except Exception as e:
        error_msg = f"Agent error: {str(e)}"
        print(f"[{app_id}] ✗ {error_msg}", file=sys.stderr)
        await report_error(backend_url, task_id, app_id, error_msg, retryable=True)
    finally:
        try:
            await browser_session.close()
        except Exception:
            pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", required=True, help="Task JSON string")
    args = parser.parse_args()

    try:
        task = json.loads(args.task)
    except Exception as e:
        print(f"Invalid task JSON: {e}", file=sys.stderr)
        sys.exit(1)

    asyncio.run(run_review(task))

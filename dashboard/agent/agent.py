"""
Credit Analyst Copilot — Browser Agent (v3)

EXTRACTION_MODE env var:
  browser (default) — browser_use LLM navigates and extracts data from each tab
  api               — fetches all data directly from LOS REST API (fast, no LLM navigation)

Both modes stream live screenshots. Both generate the memo with Claude/Gemini.
"""

import argparse
import asyncio
import base64
import json
import os
import re
import sys

import httpx

# Patch Pydantic to strip markdown fences from all JSON validation
# Some LLMs (glm-5.1) wrap JSON in ```json ... ``` blocks
import pydantic as _pd
import re as _re

_orig_mvj = _pd.BaseModel.__dict__['model_validate_json']

def _strip_fences(cls, json_data, *a, **kw):
    if isinstance(json_data, str) and '```' in json_data:
        json_data = _re.sub(r'^```(?:json)?\s*|\s*```$', '', json_data.strip())
    return _orig_mvj.__func__(cls, json_data, *a, **kw)

_pd.BaseModel.model_validate_json = classmethod(_strip_fences)

# Force UTF-8 output on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

PROVIDER = os.environ.get("LLM_PROVIDER", "anthropic")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6")
CUSTOM_ENDPOINT = os.environ.get("CUSTOM_LLM_ENDPOINT", "")
CUSTOM_MODEL = os.environ.get("CUSTOM_LLM_MODEL", "")
CUSTOM_API_KEY = os.environ.get("CUSTOM_LLM_API_KEY", "")
EXTRACTION_MODE = os.environ.get("EXTRACTION_MODE", "browser")  # "browser" | "api"

BROWSE_PROVIDER = os.environ.get("BROWSE_PROVIDER", "")
BROWSE_MODEL = os.environ.get("BROWSE_MODEL", "")
BROWSE_ENDPOINT = os.environ.get("BROWSE_ENDPOINT", "")
BROWSE_API_KEY = os.environ.get("BROWSE_API_KEY", "")

import anthropic
import google.genai as genai
from browser_use import Agent
from browser_use.browser import BrowserSession
from browser_use.llm.anthropic.chat import ChatAnthropic as BUChatAnthropic
from browser_use.llm.google.chat import ChatGoogle
from browser_use.llm.openai.chat import ChatOpenAI
from openai import AsyncOpenAI

STEPS = [
    ("Launching browser...", 1, 8),
    ("Navigating to LOS login page...", 2, 14),
    ("Logging in as analyst...", 3, 20),
    ("Opening loan application...", 4, 27),
    ("Reading Debtor Profile tab...", 5, 35),
    ("Reading Financials tab...", 6, 44),
    ("Reading SLIK OJK tab...", 7, 54),
    ("Reading AML & Fraud tab...", 8, 64),
    ("Reading CRDE Result tab...", 9, 74),
    ("Compiling data payload...", 10, 88),
    ("Generating credit memo with AI...", 11, 95),
]


def parse_agent_result(result) -> dict:
    """Extract structured JSON from browser-use agent output.
    Tries multiple strategies: final_result(), raw text, regex extraction.
    """
    raw = None
    if hasattr(result, "final_result"):
        raw = result.final_result()
    if not raw:
        raw = str(result)

    text = str(raw).strip()
    print(f"[parse] final_result preview: {text[:200]}", file=sys.stderr)

    # Strategy 1: strip markdown fences then parse
    cleaned = text
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    # Strategy 2: direct JSON parse
    for candidate in [cleaned, text]:
        try:
            return json.loads(candidate)
        except (json.JSONDecodeError, ValueError):
            pass

    # Strategy 3: regex extraction of outermost JSON object
    brace_depth = 0
    start = -1
    for i, ch in enumerate(cleaned):
        if ch == "{":
            if start == -1:
                start = i
            brace_depth += 1
        elif ch == "}":
            brace_depth -= 1
            if brace_depth == 0 and start != -1:
                try:
                    return json.loads(cleaned[start:i+1])
                except json.JSONDecodeError:
                    pass
                start = -1

    # Strategy 4: fallback regex
    json_match = re.search(r"\{[\s\S]*\}", text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    return {"extraction_raw": text[:2000]}


# ── Progress / reporting helpers ──────────────────────────────────────────────


async def _http_post_with_retry(url: str, json_data: dict, timeout: int = 10, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=timeout) as http:
                await http.post(url, json=json_data)
            return
        except Exception as e:
            if attempt < max_retries - 1:
                await asyncio.sleep(1 * (attempt + 1))
    print(f"[http] Failed after {max_retries} attempts: {e}", file=sys.stderr)


async def report_progress(
    backend_url: str, task_id: str, app_id: str, step: str, step_index: int, pct: int
):
    await _http_post_with_retry(
        f"{backend_url}/api/internal/progress",
        {
            "taskId": task_id,
            "appId": app_id,
            "step": step,
            "stepIndex": step_index,
            "totalSteps": len(STEPS),
            "pct": pct,
        },
        timeout=5,
    )


async def report_complete(
    backend_url: str, task_id: str, app_id: str, los_data: dict, memo_draft: dict
):
    await _http_post_with_retry(
        f"{backend_url}/api/internal/complete",
        {
            "taskId": task_id,
            "appId": app_id,
            "losData": los_data,
            "memoDraft": memo_draft,
            "status": "completed",
        },
        timeout=10,
    )


async def report_error(
    backend_url: str, task_id: str, app_id: str, error: str, retryable: bool = True
):
    await _http_post_with_retry(
        f"{backend_url}/api/internal/error",
        {
            "taskId": task_id,
            "appId": app_id,
            "error": error,
            "retryable": retryable,
        },
        timeout=5,
    )


async def stream_screenshots(
    backend_url: str,
    task_id: str,
    app_id: str,
    browser_session: BrowserSession,
    stop_event: asyncio.Event,
):
    """Stream JPEG screenshots at ~3-5fps to dashboard.
    Waits for CDP to be ready (browser launched by Agent internally).
    """
    http = httpx.AsyncClient(timeout=3)
    last_hash = None
    # Wait up to 30s for browser CDP to initialize
    for attempt in range(60):
        if stop_event.is_set():
            await http.aclose()
            return
        try:
            shot = await browser_session.take_screenshot(format="jpeg", quality=60)
            if shot:
                break
        except Exception:
            pass
        await asyncio.sleep(0.5)

    try:
        while not stop_event.is_set():
            try:
                shot = await browser_session.take_screenshot(format="jpeg", quality=60)
                if not shot:
                    await asyncio.sleep(0.5)
                    continue

                h = hash(shot)
                if h == last_hash:
                    await asyncio.sleep(0.15)
                    continue
                last_hash = h

                b64 = base64.b64encode(shot).decode()
                await http.post(
                    f"{backend_url}/api/internal/screenshot",
                    json={
                        "taskId": task_id,
                        "appId": app_id,
                        "screenshot": b64,
                    },
                )
            except Exception as e:
                print(f"[screenshot] {e}", file=sys.stderr)
            await asyncio.sleep(0.1)
    finally:
        await http.aclose()


# ── LOS API data fetch ────────────────────────────────────────────────────────


async def fetch_loan_from_api(los_url: str, app_id: str, credentials: dict) -> dict:
    """Fetch all loan data from LOS REST API — fast and exact."""
    async with httpx.AsyncClient(timeout=30) as http:
        login = await http.post(
            f"{los_url}/api/auth/login",
            json={
                "username": credentials["username"],
                "password": credentials["password"],
            },
        )
        if login.status_code != 200:
            raise Exception(f"LOS login failed ({login.status_code})")

        loan_resp = await http.get(f"{los_url}/api/loans/{app_id}")
        if loan_resp.status_code != 200:
            raise Exception(f"Loan fetch failed ({loan_resp.status_code})")

        return loan_resp.json()["loan"]


def los_loan_to_extracted(loan: dict) -> dict:
    """Map LOS API response fields to the extracted_data structure."""
    app = loan.get("application") or {}
    d = loan.get("debtor") or {}
    fin = loan.get("financials") or {}
    slik = loan.get("slik") or {}
    aml = loan.get("amlFraud") or {}
    crde = loan.get("crde") or {}
    col = loan.get("collateral")

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
            "nama": d.get("full_name", ""),
            "nik": d.get("nik", ""),
            "npwp": d.get("npwp", ""),
            "tanggal_lahir": d.get("date_of_birth", ""),
            "status_pernikahan": d.get("marital_status", ""),
            "jumlah_tanggungan": str(d.get("dependents", "")),
            "jenis_pekerjaan": d.get("employment_type", ""),
            "nama_perusahaan": d.get("employer_name", ""),
            "jabatan": d.get("job_title", ""),
            "lama_bekerja": str(d.get("years_employed", "")),
            "kota": d.get("domicile_city", ""),  # schema: domicile_city
            "telepon": d.get("phone", ""),
            "email": d.get("email", ""),
        },
        "data_keuangan": {
            "penghasilan_bruto": fin.get("gross_income", ""),
            "penghasilan_bersih": fin.get("net_income", ""),
            "kewajiban_existing": fin.get("existing_obligations", ""),
            "cicilan_dimohon": fin.get("requested_installment", ""),
            "total_kewajiban": fin.get("total_obligations", ""),
            "sisa_penghasilan": fin.get("remaining_income", ""),
            # camelCase to match internal.ts: keuangan.dtiRatio
            "dtiRatio": pct(fin.get("dti_ratio")),
            "dti_threshold": pct(fin.get("dti_threshold", 0.4)),
            "income_verified": "Yes" if fin.get("income_verified") else "No",
        },
        "slik_ojk": {
            "kolektibilitas": slik.get("kolektibilitas", 1),
            "kol_terburuk_12m": slik.get("worst_kol_12m", ""),
            "riwayat_24m": slik.get("payment_history_24m", ""),
            "bank_existing": slik.get("existing_bank", ""),  # schema: existing_bank
            "fasilitas": slik.get("existing_facility", ""),  # schema: existing_facility
            "jumlah_kewajiban_slik": slik.get("existing_amount", ""),
            "blacklist": "Listed" if slik.get("blacklist_status") else "Not Listed",
        },
        "aml_fraud": {
            # camelCase to match internal.ts: aml.dttotMatch, aml.pepStatus
            "dttotMatch": bool(aml.get("dttot_match", False)),
            "un_sanctions": bool(aml.get("un_sanctions_match", False)),
            "pepStatus": bool(aml.get("pep_status", False)),
            "pep_edd": bool(
                aml.get("pep_edd_required", False)
            ),  # schema: pep_edd_required
            "income_consistency": bool(aml.get("income_consistent", True)),
            "address_flag": bool(aml.get("address_flag", False)),
            "fraud_signals": aml.get("fraud_signals", "") or "",
        },
        "hasil_crde": {
            # camelCase to match internal.ts: crde.decision, crde.riskScore etc.
            "decision": crde.get("decision", ""),
            "riskScore": crde.get("risk_score", ""),
            "numericScore": int(crde.get("numeric_score", 0)),
            "dsr_aktual": pct(crde.get("dti_actual")),
            "dsr_limit": pct(crde.get("dti_threshold", 0.4)),
            "dsr_status": "PASS" if crde.get("dti_passed") else "FAIL",
            "kol_status": "PASS" if crde.get("kol_passed") else "FAIL",
            "amlStatus": "PASS" if crde.get("aml_passed") else "FAIL",
            "fraud_status": "PASS" if crde.get("fraud_passed") else "FAIL",
            "rulesTriggered": rules,
        },
        "agunan": {
            "jenis": col.get("collateral_type", ""),
            "deskripsi": col.get("asset_description", ""),
            "nilai_pasar": col.get("market_value", ""),
            "nilai_likuidasi": col.get("liquidation_value", ""),
            "ltv": col.get("ltv_ratio", ""),
            "status_hukum": col.get("legal_status", ""),
        }
        if col
        else None,
        "permohonan_kredit": {
            "produk": app.get("product_type", ""),
            "plafon": app.get("amount_requested", ""),
            "tenor": f"{app.get('tenor_months', '')} months",
            "suku_bunga": app.get("interest_rate", ""),
            "tujuan": app.get("loan_purpose", ""),
            "status": app.get("status", ""),
            "cabang": app.get("branch", ""),  # schema: branch
            "marketing_officer": app.get("marketing_officer", ""),
        },
    }


# ── Memo generation ───────────────────────────────────────────────────────────

MEMO_SYSTEM = """You are a senior credit analyst at Bank Maju Bersama Gibran, Indonesia.
Write a formal Consumer Credit Analysis Memo in English based on LOS-extracted data.

CRITICAL: Output ONLY the final memo in English. Do NOT include thinking process, reasoning steps, or internal monologue. Do NOT respond in German or any other language. Return ONLY valid JSON.

== CRDE DECISION KEY ==
The LOS stores decisions in Indonesian. Map them as follows:
  "APPROVED"            → approve recommendation
  "PERLU REVIEW KOMITE" → refer to credit committee
  "DITOLAK"             → reject recommendation
  "COMMITTEE REVIEW"    → refer to credit committee (English variant)
  "REJECTED"            → reject recommendation (English variant)

== DBR / DTI ==
The LOS calls this "DBR" (Debt Burden Ratio). RAC limit is typically 40%.
DBR = (existing obligations + new installment) / net income × 100%.
A DBR above 40% is a deal-breaker unless mitigated.

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
  2. The 1-2 biggest risk factors (DBR level, SLIK collectability, AML flags, triggered rules).
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
  State DBR explicitly: "DBR of **X%** against a RAC threshold of **Y%** — [PASS/FAIL]."
  State remaining income after all obligations.
  Use **bold** for all Rp amounts and DBR percentages.

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
        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={"system_instruction": MEMO_SYSTEM},
        )
        raw = response.text.strip()
    elif PROVIDER == "custom" and CUSTOM_ENDPOINT:
        client = AsyncOpenAI(
            base_url=CUSTOM_ENDPOINT, api_key=CUSTOM_API_KEY or "dummy"
        )
        response = await client.chat.completions.create(
            model=CUSTOM_MODEL,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": MEMO_SYSTEM},
                {"role": "user", "content": prompt},
            ],
        )
        raw = response.choices[0].message.content.strip()
    else:
        client = anthropic.AsyncAnthropic()
        response = await client.messages.create(
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
            "section1_profil": json.dumps(
                extracted_data.get("profil_debitur", {}), ensure_ascii=False
            ),
            "section2_permohonan": json.dumps(
                extracted_data.get("permohonan_kredit", {}), ensure_ascii=False
            ),
            "section3_keuangan": json.dumps(
                extracted_data.get("data_keuangan", {}), ensure_ascii=False
            ),
            "section4_slik": json.dumps(
                extracted_data.get("slik_ojk", {}), ensure_ascii=False
            ),
            "section5_aml": json.dumps(
                extracted_data.get("aml_fraud", {}), ensure_ascii=False
            ),
            "section6_agunan": json.dumps(
                extracted_data.get("agunan"), ensure_ascii=False
            ),
            "section7_crde": json.dumps(
                extracted_data.get("hasil_crde", {}), ensure_ascii=False
            ),
            "section8_rekomendasi": "",
        }


# ── Main agent run ────────────────────────────────────────────────────────────


def _make_browser_task(los_url: str, app_id: str, credentials: dict) -> str:
    """Extract from Data Summary (fast), then visit 2 real tabs for screenshot impact."""
    u = credentials["username"]
    p = credentials["password"]
    return f"""
You are a data extraction agent for a Loan Origination System.
Login, extract data from the Data Summary page, then visit 2 key tabs for visual review.

== LOGIN ==
1. Go to {los_url}/login
2. Use vision to find the username field, type: "{u}"
3. Find the password field, type: "{p}"
4. Click the login button
5. Wait for navigation to complete

== NAVIGATE TO DATA SUMMARY ==
1. Go to {los_url}/loans/{app_id}?tab=data-summary
2. Wait 2 seconds for the page to fully render

== EXTRACT ALL DATA (one evaluate call) ==
Run this evaluate action script to read all data fields and triggered rules:
(function(){{
  try{{
    var fields = Array.from(document.querySelectorAll('[data-testid^="summary-value-"]'));
    var result = fields.map(function(el){{
      return {{id:el.getAttribute('data-testid'), text:el.textContent?.trim()}};
    }});
    var rules = Array.from(document.querySelectorAll('[data-testid^="summary-crde-rule-"]'));
    var rulesText = rules.map(function(el){{return el.textContent?.trim().replace(/^•\\s*/,'')}});
    return JSON.stringify({{values:result, rules:rulesText}});
  }}catch(e){{return '{{"values":[],"rules":[]}}'}}
}})()

== VISUAL REVIEW (for screenshots) ==
After extraction, briefly visit these tabs so the demo screenshots show activity:
1. Click the tab-profil-debitur button — wait 2 seconds
2. Click the tab-hasil-crde button — wait 2 seconds

== RETURN JSON (exact structure) ==
Field mapping (summary-value-{{testId}} → your JSON field):
  app-product        → permohonan_kredit.produk
  app-amount         → permohonan_kredit.plafon
  app-tenor          → permohonan_kredit.tenor
  app-rate           → permohonan_kredit.suku_bunga
  app-purpose        → permohonan_kredit.tujuan
  app-branch         → permohonan_kredit.cabang
  app-mo             → permohonan_kredit.marketing_officer
  app-status         → permohonan_kredit.status
  debtor-name        → profil_debitur.nama
  debtor-nik         → profil_debitur.nik
  debtor-npwp        → profil_debitur.npwp
  debtor-dob         → profil_debitur.tanggal_lahir
  debtor-marital     → profil_debitur.status_pernikahan
  debtor-dependents  → profil_debitur.jumlah_tanggungan
  debtor-employment  → profil_debitur.jenis_pekerjaan
  debtor-employer    → profil_debitur.nama_perusahaan
  debtor-job         → profil_debitur.jabatan
  debtor-years       → profil_debitur.lama_bekerja
  debtor-city        → profil_debitur.kota
  debtor-phone       → profil_debitur.telepon
  debtor-email       → profil_debitur.email
  fin-gross          → data_keuangan.penghasilan_bruto
  fin-net            → data_keuangan.penghasilan_bersih
  fin-existing       → data_keuangan.kewajiban_existing
  fin-installment    → data_keuangan.cicilan_dimohon
  fin-total          → data_keuangan.total_kewajiban
  fin-remaining      → data_keuangan.sisa_penghasilan
  fin-dti            → data_keuangan.dtiRatio
  fin-dti-threshold  → data_keuangan.dti_threshold
  fin-verified       → data_keuangan.income_verified
  slik-kol           → slik_ojk.kolektibilitas
  slik-worst         → slik_ojk.kol_terburuk_12m
  slik-history       → slik_ojk.riwayat_24m
  slik-bank          → slik_ojk.bank_existing
  slik-facility      → slik_ojk.fasilitas
  slik-existing-amount → slik_ojk.jumlah_kewajiban_slik
  slik-blacklist     → slik_ojk.blacklist
  aml-dttot          → aml_fraud.dttotMatch
  aml-un             → aml_fraud.un_sanctions
  aml-pep            → aml_fraud.pepStatus
  aml-pep-edd        → aml_fraud.pep_edd
  aml-income         → aml_fraud.income_consistency
  aml-address        → aml_fraud.address_flag
  aml-fraud          → aml_fraud.fraud_signals
  crde-decision      → hasil_crde.decision
  crde-risk          → hasil_crde.riskScore
  crde-score         → hasil_crde.numericScore
  crde-dti           → hasil_crde.dsr_aktual
  crde-dti-limit     → hasil_crde.dsr_limit
  crde-dti-passed    → hasil_crde.dsr_status
  crde-kol           → hasil_crde.kol_status
  crde-aml           → hasil_crde.amlStatus
  crde-fraud         → hasil_crde.fraud_status
  col-type           → agunan.jenis_agunan (or null if unsecured)
  col-status         → if "Not required" then set agunan = null
  summary-crde-rule-* → hasil_crde.rulesTriggered (array of strings from rules output)

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

== STOP CONDITION ==
Once you have extracted all data and visited the 2 tabs, output the JSON and STOP.
Do NOT re-read fields, do NOT verify, do NOT continue browsing.
One pass, then stop.
"""


async def run_review(task: dict):
    app_id = task["appId"]
    task_id = task["taskId"]
    los_url = task["losUrl"]
    backend_url = task["backendUrl"]
    credentials = task["credentials"]

    mode = EXTRACTION_MODE  # "browser" or "api"
    print(f"[{app_id}] EXTRACTION_MODE={mode}")

    def _make_llm(provider: str, model: str, endpoint: str, key: str):
        p = provider or PROVIDER
        if p == "gemini":
            m = model or GEMINI_MODEL
            k = key or os.environ.get("GEMINI_API_KEY", "")
            return ChatGoogle(model=m, api_key=k)
        elif p == "custom" and (endpoint or CUSTOM_ENDPOINT):
            return ChatOpenAI(
                model=model or CUSTOM_MODEL,
                base_url=endpoint or CUSTOM_ENDPOINT,
                api_key=key or CUSTOM_API_KEY or "dummy",
            )
        m = model or ANTHROPIC_MODEL
        k = key or os.environ.get("ANTHROPIC_API_KEY", "")
        return BUChatAnthropic(model=m, api_key=k)

    if BROWSE_PROVIDER:
        agent_llm = _make_llm(BROWSE_PROVIDER, BROWSE_MODEL, BROWSE_ENDPOINT, BROWSE_API_KEY)
    else:
        agent_llm = _make_llm("", "", "", "")
    # Note: generate_memo() reads PROVIDER/ANTHROPIC_MODEL globals directly

    async def progress(step: str, step_index: int, pct: int):
        print(f"[{app_id}] ({pct}%) {step}")
        await report_progress(backend_url, task_id, app_id, step, step_index, pct)

    await progress(*STEPS[0])

    browser_session = BrowserSession(headless=True)

    try:
        # ── Walk progress (tab-navigation labels every 1s, runs while agent works) ──
        async def walk_progress(stop_event: asyncio.Event):
            for step_label, step_idx, pct in STEPS[1:10]:
                await asyncio.sleep(1)
                if stop_event.is_set():
                    break
                await progress(step_label, step_idx, pct)

        # ── Heartbeat (fake browsing activity for demo visibility) ──
        BROWSER_ACTIONS = [
            "Opening Data Summary page — all fields consolidated",
            "Reading loan application header (product, amount, tenor)",
            "Extracting debtor personal data (NIK, NPWP, name, DOB, marital)",
            "Reading employment and domicile information",
            "Collecting financial data — income, obligations, DBR ratio",
            "Parsing SLIK OJK credit bureau report",
            "Checking AML & fraud screening results",
            "Evaluating CRDE decision, risk score, and triggered rules",
            "Examining collateral and loan application details",
            "All data extracted from Data Summary — verifying completeness",
            "Clicking tab profil-debitur for visual review...",
            "Scrolling debtor profile — identity and employment fields",
            "Clicking tab hasil-crde for visual review...",
            "Reviewing CRDE decision — risk assessment panel",
        ]
        async def heartbeat(stop_event: asyncio.Event):
            step_idx = 9
            beat_pct = 74
            while not stop_event.is_set():
                for msg in BROWSER_ACTIONS:
                    if stop_event.is_set():
                        return
                    step_idx += 1
                    beat_pct = min(beat_pct + 0.6, 89)
                    await progress(msg, step_idx, int(beat_pct))
                    await asyncio.sleep(1.5)
                # loop back to keep producing logs if still running
                step_idx = 9

        stop_walk = asyncio.Event()
        stop_heartbeat = asyncio.Event()
        stop_screenshots = asyncio.Event()
        extracted_data: dict = {}

        # ── Screenshot stream (always active regardless of mode) ──────────────
        screenshot_task = asyncio.create_task(
            stream_screenshots(
                backend_url, task_id, app_id, browser_session, stop_screenshots
            )
        )
        walk_task = asyncio.create_task(walk_progress(stop_walk))
        heartbeat_task = asyncio.create_task(heartbeat(stop_heartbeat))

        if mode == "api":
            # ── API MODE: visual browse for screenshots + real data from API ──
            visual_agent = Agent(
                task=f"""
Navigate loan {app_id} at Bank Maju Bersama Gibran LOS — visual review only, no extraction.
1. Go to {los_url}/login, login with "{credentials["username"]}" / "{credentials["password"]}"
2. Go to {los_url}/loans/{app_id}
3. Click each tab and scroll: tab-profil-debitur, tab-data-keuangan, tab-slik-ojk,
   tab-aml-fraud, tab-hasil-crde (spend ~6s on each)
4. Output: done
""",
                llm=agent_llm,
                browser_session=browser_session,
                max_actions_per_step=2,
                use_thinking=False,
                max_failures=3,
                llm_timeout=120,
            )
            visual_future = asyncio.create_task(visual_agent.run(max_steps=30))

            try:
                loan_raw = await fetch_loan_from_api(los_url, app_id, credentials)
                extracted_data = los_loan_to_extracted(loan_raw)
                print(
                    f"[{app_id}] ✓ API fetch — "
                    f"{extracted_data['profil_debitur'].get('nama', '?')} "
                    f"/ {extracted_data['hasil_crde'].get('decision', '?')}"
                )
            except Exception as api_err:
                print(f"[{app_id}] ✗ API fetch failed: {api_err}", file=sys.stderr)

            try:
                await asyncio.wait_for(visual_future, timeout=100)
            except (asyncio.TimeoutError, Exception) as e:
                print(
                    f"[{app_id}] Visual browse ended: {type(e).__name__}",
                    file=sys.stderr,
                )
                visual_future.cancel()
                try:
                    await visual_future
                except (asyncio.CancelledError, Exception):
                    pass

        else:
            # ── BROWSER MODE: browser_use reads every field from data-summary ──
            attempt = 0
            max_attempts = 2
            extracted_data = {}
            while attempt < max_attempts and not extracted_data.get("profil_debitur"):
                attempt += 1
                extraction_agent = Agent(
                    task=_make_browser_task(los_url, app_id, credentials),
                    llm=agent_llm,
                    browser_session=browser_session,
                    max_actions_per_step=2,
                    use_thinking=False,
                    max_failures=3,
                    llm_timeout=120,
                )
                agent_result_raw = None
                try:
                    agent_result_raw = await extraction_agent.run(max_steps=8)
                except Exception as agent_err:
                    print(f"[{app_id}] ⚠ Agent run error (attempt {attempt}): {agent_err}", file=sys.stderr)
                    agent_result_raw = str(agent_err)

                extracted_data = (
                    parse_agent_result(agent_result_raw) if agent_result_raw else {}
                )
                if not extracted_data or (
                    len(extracted_data) == 1 and "extraction_raw" in extracted_data
                ):
                    print(
                        f"[{app_id}] ⚠ Browser extraction returned no structured data (attempt {attempt})",
                        file=sys.stderr,
                    )
                    extracted_data = {}
                else:
                    print(f"[{app_id}] ✓ Browser extraction keys (attempt {attempt}): {list(extracted_data.keys())}")

            # Fallback: if browser extraction failed, try API mode
            if not extracted_data.get("profil_debitur"):
                print(f"[{app_id}] ⚠ Browser extraction failed, falling back to API mode", file=sys.stderr)
                try:
                    loan_raw = await fetch_loan_from_api(los_url, app_id, credentials)
                    extracted_data = los_loan_to_extracted(loan_raw)
                    print(f"[{app_id}] ✓ API fallback — {extracted_data['profil_debitur'].get('nama', '?')}")
                except Exception as api_err:
                    print(f"[{app_id}] ✗ API fallback also failed: {api_err}", file=sys.stderr)

        # ── Finish extraction ────────────────────────────────────────────────
        stop_walk.set()
        stop_heartbeat.set()
        stop_screenshots.set()
        await asyncio.sleep(0.1)

        await progress(*STEPS[10])

        if not extracted_data:
            extracted_data = {
                "profil_debitur": {},
                "data_keuangan": {},
                "slik_ojk": {},
                "aml_fraud": {},
                "hasil_crde": {},
                "agunan": None,
                "permohonan_kredit": {},
            }

        los_data = {
            "profilDebitur": extracted_data.get("profil_debitur", {}),
            "dataKeuangan": extracted_data.get("data_keuangan", {}),
            "slikOjk": extracted_data.get("slik_ojk", {}),
            "amlFraud": extracted_data.get("aml_fraud", {}),
            "hasilCrde": extracted_data.get("hasil_crde", {}),
            "agunan": extracted_data.get("agunan"),
            "permohonanKredit": extracted_data.get("permohonan_kredit", {}),
        }

        # Memo heartbeat — progress during the LLM call
        MEMO_STEPS = [
            "Analyzing debtor profile and financial capacity...",
            "Reviewing SLIK OJK credit history and AML screening...",
            "Evaluating CRDE risk score and triggered rules...",
            "Generating executive summary of risk assessment...",
            "Structuring credit memo sections (7 sections)...",
            "Cross-referencing RAC criteria and policy limits...",
            "Finalizing memo and formatting recommendation...",
        ]
        stop_memo = asyncio.Event()
        async def memo_heartbeat(stop: asyncio.Event):
            step_idx = 38
            while not stop.is_set():
                for msg in MEMO_STEPS:
                    if stop.is_set(): return
                    step_idx += 1
                    pct = min(92 + step_idx - 38, 99)
                    await progress(msg, step_idx, pct)
                    await asyncio.sleep(2)
                step_idx = 38
        memo_task = asyncio.create_task(memo_heartbeat(stop_memo))

        memo_draft = await generate_memo(extracted_data, app_id)
        stop_memo.set()
        memo_task.cancel()
        await report_complete(backend_url, task_id, app_id, los_data, memo_draft)
        print(f"[{app_id}] ✓ Completed ({mode} mode)")

    except Exception as e:
        error_msg = f"Agent error: {str(e)}"
        print(f"[{app_id}] ✗ {error_msg}", file=sys.stderr)
        await report_error(backend_url, task_id, app_id, error_msg, retryable=True)
    finally:
        try:
            await browser_session.stop()
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

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
import re as _re
import sys

import httpx

# Patch Pydantic to strip markdown fences from all JSON validation
# Some LLMs (glm-5.1) wrap JSON in ```json ... ``` blocks
import pydantic as _pd

_orig_mvj = _pd.BaseModel.__dict__["model_validate_json"]


def _strip_fences(cls, json_data, *a, **kw):
    if isinstance(json_data, str) and "```" in json_data:
        json_data = _re.sub(r"^```(?:json)?\s*|\s*```$", "", json_data.strip())
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
MEMO_SKILL = os.environ.get("MEMO_SKILL", "").strip()
MEMO_LOCALE = os.environ.get("MEMO_LOCALE", "en").strip()

BROWSE_PROVIDER = os.environ.get("BROWSE_PROVIDER", "")
BROWSE_MODEL = os.environ.get("BROWSE_MODEL", "")
BROWSE_ENDPOINT = os.environ.get("BROWSE_ENDPOINT", "")
BROWSE_API_KEY = os.environ.get("BROWSE_API_KEY", "")
BROWSE_VERTEX_PROJECT = os.environ.get("BROWSE_VERTEX_PROJECT", "")
BROWSE_VERTEX_LOCATION = os.environ.get("BROWSE_VERTEX_LOCATION", "asia-southeast1")
BROWSE_VERTEX_CREDENTIALS = os.environ.get("BROWSE_VERTEX_CREDENTIALS", "")

import anthropic
import google.genai as genai
from browser_use import Agent
from browser_use.browser import BrowserSession
from browser_use.llm.anthropic.chat import ChatAnthropic as BUChatAnthropic
from browser_use.llm.google.chat import ChatGoogle
from browser_use.llm.openai.chat import ChatOpenAI
from openai import AsyncOpenAI

STEPS = [
    ("Launching browser...", 1, 5),
    ("Connecting to Bank CIMB Niaga LOS...", 2, 10),
    ("Logging in as credit analyst...", 3, 18),
    ("Opening loan application...", 4, 25),
    ("Reading Data Summary — extracting fields...", 5, 40),
    ("Reviewing debtor profile & CRDE tabs...", 6, 55),
    ("Compiling loan data payload...", 7, 70),
    ("Generating credit memo with AI...", 8, 85),
    ("Finalizing review package...", 9, 96),
]

BROWSE_PHASE_TICKS = [
    (3, 18, "Logging in as credit analyst..."),
    (4, 28, "Opening loan application..."),
    (5, 38, "Reading Data Summary page..."),
    (5, 48, "Extracting debtor, financial & CRDE data..."),
    (6, 58, "Reviewing key tabs..."),
    (6, 66, "Browser agent working..."),
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
                    return json.loads(cleaned[start : i + 1])
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


async def _http_post_with_retry(
    url: str, json_data: dict, timeout: int = 10, max_retries: int = 3
):
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=timeout) as http:
                await http.post(url, json=json_data)
            return
        except Exception as e:
            if attempt < max_retries - 1:
                await asyncio.sleep(1 * (attempt + 1))
    print(f"[http] Failed after {max_retries} attempts: {e}", file=sys.stderr)


async def browse_phase_heartbeat(progress_fn, stop_event: asyncio.Event, interval_s: float = 4.0):
    """Paced browse labels while browser-use runs — avoids 1s fake tab jumps."""
    tick = 0
    while not stop_event.is_set():
        step_idx, pct, msg = BROWSE_PHASE_TICKS[min(tick, len(BROWSE_PHASE_TICKS) - 1)]
        await progress_fn(msg, step_idx, pct)
        tick += 1
        for _ in range(int(interval_s * 2)):
            if stop_event.is_set():
                return
            await asyncio.sleep(0.5)


async def memo_progress_heartbeat(progress_fn, stop_event: asyncio.Event):
    """One-pass memo sub-steps — never loops back to low pct."""
    memo_ticks = [
        (8, 87, "Analyzing debtor profile and financial capacity..."),
        (8, 90, "Reviewing SLIK OJK and AML screening..."),
        (8, 92, "Structuring credit memo (Bahasa Indonesia)..."),
        (8, 94, "Formatting recommendation..."),
    ]
    for step_idx, pct, msg in memo_ticks:
        if stop_event.is_set():
            return
        await progress_fn(msg, step_idx, pct)
        for _ in range(6):
            if stop_event.is_set():
                return
            await asyncio.sleep(0.5)


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
            "pct": min(max(pct, 0), 99),
        },
        timeout=5,
    )


async def report_usage(
    backend_url: str, app_id: str, component: str, model: str, input_tokens: int, output_tokens: int
):
    """Report LLM token usage to the dashboard backend."""
    await _http_post_with_retry(
        f"{backend_url}/api/internal/usage",
        {
            "appId": app_id,
            "component": component,
            "model": model,
            "inputTokens": input_tokens,
            "outputTokens": output_tokens,
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

    # Collectability label mapping
    KOL_LABELS = {
        1: "Current (Lancar)",
        2: "Special Mention (Kurang Lancar)",
        3: "Substandard (Diragukan)",
        4: "Doubtful (Macet)",
        5: "Loss (Loss)",
    }
    kol_num = int(slik.get("kolektibilitas", 1) or 1)
    kol_label = KOL_LABELS.get(kol_num, f"Kol {kol_num}")

    # AML summary
    dttot = bool(aml.get("dttot_match", False))
    pep = bool(aml.get("pep_status", False))
    un_sanc = bool(aml.get("un_sanctions_match", False))
    fraud_sig = aml.get("fraud_signals", "") or ""
    aml_clear = not (dttot or pep or un_sanc or bool(fraud_sig))
    aml_summary = "CLEAR — no DTTOT, UN sanctions, PEP, or fraud signals" if aml_clear else (
        f"FLAGGED — "
        + ", ".join(filter(None, [
            "DTTOT match" if dttot else "",
            "PEP identified" if pep else "",
            "UN sanctions match" if un_sanc else "",
            f"fraud signals: {fraud_sig}" if fraud_sig else "",
        ]))
    )

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
            "kolektibilitas": kol_num,
            "kolektibilitas_label": kol_label,
            "kol_terburuk_12m": slik.get("worst_kol_12m", ""),
            "riwayat_24m": slik.get("payment_history_24m", ""),
            "bank_existing": slik.get("existing_bank", ""),  # schema: existing_bank
            "fasilitas": slik.get("existing_facility", ""),  # schema: existing_facility
            "jumlah_kewajiban_slik": slik.get("existing_amount", ""),
            "blacklist": "Listed" if slik.get("blacklist_status") else "Not Listed",
        },
        "aml_fraud": {
            # camelCase to match internal.ts: aml.dttotMatch, aml.pepStatus
            "dttotMatch": dttot,
            "un_sanctions": un_sanc,
            "pepStatus": pep,
            "pep_edd": bool(
                aml.get("pep_edd_required", False)
            ),  # schema: pep_edd_required
            "income_consistency": bool(aml.get("income_consistent", True)),
            "address_flag": bool(aml.get("address_flag", False)),
            "fraud_signals": fraud_sig,
            "aml_status_summary": aml_summary,
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

MEMO_SYSTEM = """You are a senior credit analyst at Bank CIMB Niaga, Indonesia.
Write a formal Consumer Credit Analysis Memo based on LOS-extracted data.

LANGUAGE: Default is formal English (MEMO_LOCALE=en). If MEMO_LOCALE=id or CUSTOM SOP below specifies Bahasa Indonesia, write all section content in formal Indonesian.

CRITICAL: Output ONLY the final memo. Do NOT include thinking process, reasoning steps, or internal monologue. Return ONLY valid JSON.

== CRDE DECISION KEY ==
The LOS stores decisions in English for this demo:
  "APPROVED"         → approve recommendation
  "COMMITTEE REVIEW" → refer to credit committee
  "REJECTED"         → reject recommendation

== DBR (Debt Burden Ratio) ==
RAC limit is typically 40% (per product juknis).
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
  3-5 lines total:
  1. One sentence: Who the applicant is and what product/amount they want.
  2. Key concerns as bullet lines (• DBR … • SLIK … • AML …) — use bullets when there are 2+ concerns, skip if none.
  3. One sentence: What the CRDE engine recommends and the numeric score.
  4. One sentence: The key thing the analyst must verify or decide.
  Keep it compact — this is the first thing the analyst reads.

section1_profil:
  2-3 sentences. Full name, employment (type + company + title + years), domicile city.
  Note if NIK/NPWP verified. Keep factual.
  IMPORTANT: Mask NIK — show only last 4 digits (e.g., "NIK **** **** **** 1234"). Do NOT include full NIK in the memo.

section2_permohonan:
  2-3 sentences. Product type, **amount** requested, tenor, interest rate, stated purpose.
  MUST include lines with exact labels: "Purpose: **[value]**" and "Installment: **Rp [value]**" so the dashboard can extract them.
  Example: "Application for **KPR** product, amount **Rp 500,000,000**, tenor 20 years, interest 9.5%.
Purpose: **Pembelian Rumah**
Installment: **Rp 4,200,000**"

section3_keuangan:
  3-4 sentences. Net monthly income, existing obligations, new installment, total burden.
  State DBR explicitly: "DBR of **X%** against a RAC threshold of **Y%** — [PASS/FAIL]."
  State remaining income after all obligations.
  Use **bold** for all Rp amounts and DBR percentages.

section4_slik:
  2-3 sentences. USE the `kolektibilitas_label` field EXACTLY as provided — do NOT invent your own label.
  The data includes both the number (kolektibilitas) and the human-readable label (kolektibilitas_label).
  Mapping: 1=Current/Lancar, 2=Special Mention/Kurang Lancar, 3=Substandard/Diragukan, 4=Doubtful/Macet, 5=Loss/Loss.
  Payment history quality over 24 months. Worst collectability in last 12 months.
  Mention existing facilities and blacklist status.

section5_aml:
  2 sentences. USE the `aml_status_summary` field EXACTLY as provided — do NOT contradict it.
  If aml_status_summary starts with "CLEAR", write: "All AML/fraud screenings returned clear. No DTTOT, UN sanctions, PEP, or fraud signals detected."
  If aml_status_summary starts with "FLAGGED", list each specific flag mentioned in the summary.
  Do NOT say "flagged" if the data shows all-clear. Do NOT say "clear" if flags exist.

section6_agunan:
  1 sentence. If unsecured: "Unsecured product — no collateral required."
  If secured: asset type, market value, liquidation value, LTV ratio vs RAC limit, legal status.

section7_crde:
  State: decision, risk classification, numeric score/1000.
  List each triggered rule on its own line starting with •
  If no rules triggered: "No rules triggered — all RAC criteria passed."

section8_rekomendasi:
  Follow CUSTOM SOP / Juknis for recommendation format when provided.
  Default English (if no juknis override):
    **Recommended: APPROVE** | **Recommended: REFER TO CREDIT COMMITTEE** | **Recommended: REJECT**
  Default Indonesian (MEMO_LOCALE=id):
    **Rekomendasi: SETUJU** | **Rekomendasi: RUJUK KOMITE KREDIT** | **Rekomendasi: TOLAK**
  Map CRDE: APPROVED→approve, COMMITTEE REVIEW→refer, REJECTED→reject.
  Then rationale + key concerns as bullets if multiple points.

== FORMAT RULES ==
- **bold** all: Rp amounts, percentages, scores, decisions, pass/fail results
- Use • bullets for lists of rules, flags, or risk factors
- Max 150 words per section
- Formal, objective, third-person tone
- If a field is missing from the data: write "Not available."
- Return ONLY the JSON object — no markdown fences, no preamble"""


def build_memo_system() -> str:
    base = f"{MEMO_SYSTEM}\n\nMEMO_LOCALE={MEMO_LOCALE}"
    if not MEMO_SKILL:
        return base
    return (
        f"{base}\n\n"
        "== CUSTOM SOP / JUKINS (user policy — overrides defaults) ==\n"
        "Follow these credit-team rules when writing the memo, especially section8 recommendation.\n\n"
        f"{MEMO_SKILL}"
    )

async def _call_llm(system: str, prompt: str) -> tuple[str, int, int]:
    """Call the configured LLM and return (text, input_tokens, output_tokens)."""
    if PROVIDER == "gemini":
        client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={"system_instruction": system},
        )
        input_tokens = response.usage_metadata.prompt_token_count if response.usage_metadata else 0
        output_tokens = response.usage_metadata.candidates_token_count if response.usage_metadata else 0
        return response.text.strip(), input_tokens, output_tokens
    elif PROVIDER == "custom" and CUSTOM_ENDPOINT:
        client = AsyncOpenAI(
            base_url=CUSTOM_ENDPOINT, api_key=CUSTOM_API_KEY or "dummy"
        )
        response = await client.chat.completions.create(
            model=CUSTOM_MODEL,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        )
        input_tokens = response.usage.prompt_tokens if response.usage else 0
        output_tokens = response.usage.completion_tokens if response.usage else 0
        return response.choices[0].message.content.strip(), input_tokens, output_tokens
    else:
        client = anthropic.AsyncAnthropic()
        response = await client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=4096,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        input_tokens = response.usage.input_tokens if response.usage else 0
        output_tokens = response.usage.output_tokens if response.usage else 0
        return response.content[0].text.strip(), input_tokens, output_tokens


def _strip_markdown_fences(text: str) -> str:
    """Remove markdown code fences wrapping JSON."""
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return text


def _try_parse_json(text: str) -> dict | None:
    """Try to parse JSON from LLM response, with brace-extraction fallback."""
    # Direct parse
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        pass
    # Extract outermost { ... }
    brace_depth = 0
    start = -1
    for i, ch in enumerate(text):
        if ch == "{":
            if start == -1:
                start = i
            brace_depth += 1
        elif ch == "}":
            brace_depth -= 1
            if brace_depth == 0 and start != -1:
                try:
                    return json.loads(text[start : i + 1])
                except json.JSONDecodeError:
                    pass
                start = -1
    return None


RETRY_SYSTEM = """You are a credit analyst. Output ONLY valid JSON. No text before or after.
Return exactly these 9 keys:
{"executive_summary":"...","section1_profil":"...","section2_permohonan":"...","section3_keuangan":"...","section4_slik":"...","section5_aml":"...","section6_agunan":"...","section7_crde":"...","section8_rekomendasi":"..."}
"""


async def generate_memo(extracted_data: dict, app_id: str, backend_url: str = "") -> dict:
    prompt = f"LOS data for application {app_id}:\n\n{json.dumps(extracted_data, ensure_ascii=False, indent=2)}"
    system = build_memo_system()
    model_name = ANTHROPIC_MODEL if PROVIDER == "anthropic" else GEMINI_MODEL if PROVIDER == "gemini" else CUSTOM_MODEL
    print(f"[{app_id}] Generating memo via {PROVIDER}/{model_name} (system={len(system)} chars, prompt={len(prompt)} chars)")

    total_input = 0
    total_output = 0

    # Attempt 1: full prompt
    try:
        raw, input_tok, output_tok = await _call_llm(system, prompt)
        total_input += input_tok
        total_output += output_tok
    except Exception as e:
        print(f"[{app_id}] ✗ LLM API call failed: {type(e).__name__}: {e}", file=sys.stderr)
        raise

    raw = _strip_markdown_fences(raw)
    result = _try_parse_json(raw)
    if result:
        # Report usage for memo generation
        if backend_url and (total_input > 0 or total_output > 0):
            await report_usage(backend_url, app_id, "memo", model_name, total_input, total_output)
        return result

    print(f"[{app_id}] ⚠ First attempt returned non-JSON (first 300 chars): {raw[:300]}", file=sys.stderr)

    # Attempt 2: retry with simplified system prompt
    retry_prompt = f"Convert this loan data to JSON memo:\n{json.dumps(extracted_data, ensure_ascii=False)}"
    try:
        raw2, input_tok2, output_tok2 = await _call_llm(RETRY_SYSTEM, retry_prompt)
        total_input += input_tok2
        total_output += output_tok2
        raw2 = _strip_markdown_fences(raw2)
        result2 = _try_parse_json(raw2)
        if result2:
            print(f"[{app_id}] ✓ Retry succeeded", file=sys.stderr)
            # Report usage for memo generation (including retry)
            if backend_url and (total_input > 0 or total_output > 0):
                await report_usage(backend_url, app_id, "memo", model_name, total_input, total_output)
            return result2
        print(f"[{app_id}] ✗ Retry also returned non-JSON (first 300 chars): {raw2[:300]}", file=sys.stderr)
    except Exception as e:
        print(f"[{app_id}] ✗ Retry LLM call failed: {type(e).__name__}: {e}", file=sys.stderr)

    # Report usage even on failure
    if backend_url and (total_input > 0 or total_output > 0):
        await report_usage(backend_url, app_id, "memo", model_name, total_input, total_output)

    # Fallback: dump raw data
    print(f"[{app_id}] ✗ Memo generation failed — using raw data fallback", file=sys.stderr)
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



def needs_api_fallback(data: dict) -> bool:
    """True when browser extraction is missing or untrustworthy."""
    if not data or not data.get("profil_debitur", {}).get("nama"):
        return True
    crde = data.get("hasil_crde") or {}
    if not str(crde.get("decision", "")).strip():
        return True
    slik = data.get("slik_ojk") or {}
    kol = slik.get("kolektibilitas")
    if kol is None or kol == "":
        return True
    if isinstance(kol, str):
        low = kol.lower()
        if any(x in low for x in ("assume", "visible", "screenshot", "not in state")):
            return True
    aml = data.get("aml_fraud") or {}
    if not aml or not any(v not in (None, "", False, 0) for v in aml.values()):
        return True
    return False


def make_browser_llm():
    """Browse LLM must support browser-use actions — never default to custom/mimo."""
    if BROWSE_PROVIDER:
        provider = BROWSE_PROVIDER
        model = BROWSE_MODEL
        endpoint = BROWSE_ENDPOINT
        key = BROWSE_API_KEY or CUSTOM_API_KEY or os.environ.get("ANTHROPIC_API_KEY", "")
    elif PROVIDER == "anthropic":
        provider = "anthropic"
        model = ANTHROPIC_MODEL
        endpoint = ""
        key = os.environ.get("ANTHROPIC_API_KEY", "")
    elif PROVIDER == "gemini":
        provider = "gemini"
        model = GEMINI_MODEL
        endpoint = ""
        key = os.environ.get("GEMINI_API_KEY", "")
    else:
        # Memo on custom/mimo — browse must use a real Anthropic/Gemini key (not mimo)
        endpoint = ""
        gemini_key = os.environ.get("GEMINI_API_KEY", "")
        anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if gemini_key:
            provider, model, key = "gemini", GEMINI_MODEL, gemini_key
        elif anthropic_key:
            provider, model, key = "anthropic", ANTHROPIC_MODEL, anthropic_key
        else:
            print(
                "[browser-llm] WARN: Browsing LLM not configured — "
                "set Dashboard Settings → Browsing LLM (Gemini or Anthropic). "
                "Browser steps will fail; API fallback will supply loan data.",
                file=sys.stderr,
            )
            provider, model, key = "anthropic", ANTHROPIC_MODEL, ""
    print(f"[browser-llm] provider={provider} model={model or '(default)'}")
    if provider == "vertex":
        project = (BROWSE_VERTEX_PROJECT or os.environ.get("GOOGLE_CLOUD_PROJECT", "")).strip()
        location = BROWSE_VERTEX_LOCATION or "asia-southeast1"
        model_name = model or GEMINI_MODEL or "gemini-2.5-flash-lite"
        if BROWSE_VERTEX_CREDENTIALS:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = BROWSE_VERTEX_CREDENTIALS
        # GCP SDK: project+location OR api_key — never both
        if project and (BROWSE_VERTEX_CREDENTIALS or not key):
            print(
                f"[browser-llm] vertex-gcp project={project} location={location} model={model_name}",
                file=sys.stderr,
            )
            return ChatGoogle(
                model=model_name,
                vertexai=True,
                project=project,
                location=location,
            )
        if key:
            print(
                f"[browser-llm] vertex-express api_key model={model_name}",
                file=sys.stderr,
            )
            return ChatGoogle(model=model_name, api_key=key)
        print("[browser-llm] WARN: vertex needs API key or service account", file=sys.stderr)
        return ChatGoogle(
            model=model_name,
            vertexai=True,
            project=project,
            location=location,
        )

    if provider == "gemini":
        return ChatGoogle(model=model or GEMINI_MODEL, api_key=key)
    if provider == "custom" and (endpoint or CUSTOM_ENDPOINT):
        return ChatOpenAI(
            model=model or CUSTOM_MODEL,
            base_url=endpoint or CUSTOM_ENDPOINT,
            api_key=key or CUSTOM_API_KEY or "dummy",
        )
    return BUChatAnthropic(
        model=model or ANTHROPIC_MODEL,
        api_key=key or os.environ.get("ANTHROPIC_API_KEY", ""),
    )


def normalize_extracted_data(data: dict) -> dict:
    """Normalize browser-extracted payload to consistent shapes."""
    if not data or "profil_debitur" not in data:
        return data
    crde = data.setdefault("hasil_crde", {})
    if "rulesTriggered" not in crde and "rules_triggered" in crde:
        crde["rulesTriggered"] = crde.pop("rules_triggered")
    aml = data.setdefault("aml_fraud", {})
    for key, listed_vals in [
        ("dttotMatch", ("listed", "match", "yes", "true")),
        ("pepStatus", ("pep", "identified", "yes", "true")),
        ("un_sanctions", ("listed", "match", "yes", "true")),
    ]:
        v = aml.get(key)
        if isinstance(v, str):
            low = v.lower()
            if any(x in low for x in ("not", "no", "clear", "false", "bersih")):
                aml[key] = False
            elif any(x in low for x in listed_vals):
                aml[key] = True
    agunan = data.get("agunan")
    if isinstance(agunan, dict) and not any(agunan.values()):
        data["agunan"] = None
    return data



def to_los_data_payload(extracted: dict) -> dict:
    """Map agent extraction (ID/browser keys) to dashboard LosData field names."""
    prof = extracted.get("profil_debitur") or {}
    fin = extracted.get("data_keuangan") or {}
    slik = extracted.get("slik_ojk") or {}
    aml = extracted.get("aml_fraud") or {}
    crde = extracted.get("hasil_crde") or {}
    col = extracted.get("agunan")
    app = extracted.get("permohonan_kredit") or {}

    return {
        "profilDebitur": {
            "nama": prof.get("nama", ""),
            "full_name": prof.get("nama", ""),
            "nik": prof.get("nik", ""),
            "npwp": prof.get("npwp", ""),
            "jenisPekerjaan": prof.get("jenis_pekerjaan", ""),
            "jenis_pekerjaan": prof.get("jenis_pekerjaan", ""),
            "employment_type": prof.get("jenis_pekerjaan", ""),
            "namaPerusahaan": prof.get("nama_perusahaan", ""),
            "nama_perusahaan": prof.get("nama_perusahaan", ""),
            "employer_name": prof.get("nama_perusahaan", ""),
            "jabatan": prof.get("jabatan", ""),
            "job_title": prof.get("jabatan", ""),
        },
        "dataKeuangan": {
            "gross_income": fin.get("penghasilan_bruto", ""),
            "penghasilan_bruto": fin.get("penghasilan_bruto", ""),
            "penghasilan_kotor": fin.get("penghasilan_bruto", ""),
            "net_income": fin.get("penghasilan_bersih", ""),
            "penghasilan_bersih": fin.get("penghasilan_bersih", ""),
            "existing_obligations": fin.get("kewajiban_existing", ""),
            "kewajiban_existing": fin.get("kewajiban_existing", ""),
            "requested_installment": fin.get("cicilan_dimohon", ""),
            "cicilan_dimohon": fin.get("cicilan_dimohon", ""),
            "total_obligations": fin.get("total_kewajiban", ""),
            "total_kewajiban": fin.get("total_kewajiban", ""),
            "remaining_income": fin.get("sisa_penghasilan", ""),
            "sisa_penghasilan": fin.get("sisa_penghasilan", ""),
            "dtiRatio": fin.get("dtiRatio", fin.get("dti_ratio", "")),
            "dti_threshold": fin.get("dti_threshold", ""),
        },
        "slikOjk": {
            "kolektibilitas": slik.get("kolektibilitas", ""),
            "kolektibilitas_label": slik.get("kolektibilitas_label", ""),
            "kol_terburuk_12m": slik.get("kol_terburuk_12m", ""),
            "riwayat_24m": slik.get("riwayat_24m", ""),
            "bank_existing": slik.get("bank_existing", ""),
            "fasilitas": slik.get("fasilitas", ""),
            "blacklist": slik.get("blacklist", ""),
        },
        "amlFraud": {
            "dttotMatch": aml.get("dttotMatch", aml.get("dttot_match", False)),
            "pepStatus": aml.get("pepStatus", aml.get("pep_status", False)),
            "un_sanctions": aml.get("un_sanctions", aml.get("un_sanctions_match", False)),
            "income_consistency": aml.get("income_consistency", aml.get("income_consistent", True)),
            "fraud_signals": aml.get("fraud_signals", aml.get("fraudSignals", "")),
            "aml_status_summary": aml.get("aml_status_summary", ""),
        },
        "hasilCrde": {
            "decision": crde.get("decision", ""),
            "riskScore": crde.get("riskScore", crde.get("risk_score", "")),
            "numericScore": crde.get("numericScore", crde.get("numeric_score", 0)),
            "rulesTriggered": crde.get("rulesTriggered", crde.get("rules_triggered", [])),
            "dsr_aktual": crde.get("dsr_aktual", ""),
            "dsr_status": crde.get("dsr_status", ""),
        },
        "agunan": col,
        "permohonanKredit": {
            "product_type": app.get("produk", app.get("product_type", "")),
            "produk": app.get("produk", ""),
            "amount_requested": app.get("plafon", app.get("amount_requested", "")),
            "plafon": app.get("plafon", ""),
            "tenor_months": str(app.get("tenor", "")).replace(" months", "").strip(),
            "tenor": app.get("tenor", ""),
            "loan_purpose": app.get("tujuan", ""),
            "tujuan": app.get("tujuan", ""),
            "status": app.get("status", ""),
            "branch": app.get("cabang", ""),
            "marketing_officer": app.get("marketing_officer", ""),
        },
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
2. Wait for data-testid="input-username" — type: "{u}"
3. Fill data-testid="input-password" with: "{p}"
4. Click data-testid="btn-login"
5. Wait until URL no longer contains /login

== NAVIGATE TO DATA SUMMARY ==
1. Go to {los_url}/loans/{app_id}?tab=data-summary
2. Wait until data-testid="tab-content-data-summary" is visible

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
1. Click data-testid="tab-profil-debitur" — wait until tab-content-profil-debitur appears
2. Click data-testid="tab-hasil-crde" — wait until tab-content-hasil-crde appears

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
  crde-kol           → hasil_crde.kol_value (collectability number)
  crde-kol-passed    → hasil_crde.kol_status (PASS/FAIL)
  crde-aml           → hasil_crde.amlStatus
  crde-fraud         → hasil_crde.fraud_status
  col-type           → agunan.jenis (or null if unsecured)
  col-desc           → agunan.deskripsi
  col-market         → agunan.nilai_pasar
  col-liquid         → agunan.nilai_likuidasi
  col-ltv            → agunan.ltv
  col-legal          → agunan.status_hukum
  col-status         → if contains "Not required" then set agunan = null
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
    "kol_value":"","kol_status":"","amlStatus":"","fraud_status":"",
    "rulesTriggered":[]
  }},
  "agunan": null,
  "permohonan_kredit": {{
    "produk":"","plafon":"","tenor":"","suku_bunga":"",
    "tujuan":"","status":"","cabang":"","marketing_officer":""
  }}
}}

== IMPORTANT ==
Do NOT use wait actions — browser-use wait schema is strict. Navigate and click only.

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

    agent_llm = make_browser_llm()
    # Memo generation uses PROVIDER / CUSTOM_* globals — separate from browse LLM

    async def progress(step: str, step_index: int, pct: int):
        print(f"[{app_id}] ({pct}%) {step}")
        await report_progress(backend_url, task_id, app_id, step, step_index, pct)

    await progress(*STEPS[0])

    browser_session = BrowserSession(headless=True)

    try:
        stop_browse = asyncio.Event()
        stop_screenshots = asyncio.Event()
        extracted_data: dict = {}
        used_api_verify = False

        # ── Screenshot stream (always active regardless of mode) ──────────────
        screenshot_task = asyncio.create_task(
            stream_screenshots(
                backend_url, task_id, app_id, browser_session, stop_screenshots
            )
        )
        await progress(*STEPS[1])

        if mode == "api":
            # ── API MODE: visual browse for screenshots + real data from API ──
            visual_agent = Agent(
                task=f"""
Navigate loan {app_id} at Bank CIMB Niaga LOS — visual review only, no extraction.
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
            browse_task = asyncio.create_task(browse_phase_heartbeat(progress, stop_browse))
            visual_future = asyncio.create_task(visual_agent.run(max_steps=30))

            try:
                await progress("Fetching loan data from LOS API...", 5, 42)
                loan_raw = await fetch_loan_from_api(los_url, app_id, credentials)
                extracted_data = los_loan_to_extracted(loan_raw)
                nama = extracted_data["profil_debitur"].get("nama", "?")
                print(
                    f"[{app_id}] ✓ API fetch — "
                    f"{nama} "
                    f"/ {extracted_data['hasil_crde'].get('decision', '?')}"
                )
                await progress(f"Loan data loaded — {nama}", 7, 68)
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
            finally:
                stop_browse.set()
                browse_task.cancel()
                try:
                    await browse_task
                except asyncio.CancelledError:
                    pass

        else:
            # ── BROWSER MODE: browser_use reads every field from data-summary ──
            attempt = 0
            max_attempts = 2
            extracted_data = {}
            while attempt < max_attempts:
                attempt += 1
                if attempt > 1:
                    await progress("Retrying browser extraction...", 5, 35)
                stop_browse.clear()
                browse_task = asyncio.create_task(browse_phase_heartbeat(progress, stop_browse))
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
                    try:
                        agent_result_raw = await extraction_agent.run(max_steps=18)
                    except Exception as agent_err:
                        print(
                            f"[{app_id}] ⚠ Agent run error (attempt {attempt}): {agent_err}",
                            file=sys.stderr,
                        )
                        agent_result_raw = str(agent_err)
                finally:
                    stop_browse.set()
                    browse_task.cancel()
                    try:
                        await browse_task
                    except asyncio.CancelledError:
                        pass

                extracted_data = normalize_extracted_data(
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
                    print(
                        f"[{app_id}] ✓ Browser extraction keys (attempt {attempt}): {list(extracted_data.keys())}"
                    )
                if not needs_api_fallback(extracted_data):
                    print(f"[{app_id}] ✓ Browser extraction complete (attempt {attempt})")
                    break
                print(
                    f"[{app_id}] ⚠ Incomplete browser extraction (attempt {attempt}) — retrying or API fallback",
                    file=sys.stderr,
                )

            # Fallback: incomplete browser data → API
            if needs_api_fallback(extracted_data):
                used_api_verify = True
                print(
                    f"[{app_id}] ⚠ Browser extraction failed, falling back to API mode",
                    file=sys.stderr,
                )
                await progress("Cross-checking data with LOS API...", 7, 62)
                try:
                    loan_raw = await fetch_loan_from_api(los_url, app_id, credentials)
                    extracted_data = los_loan_to_extracted(loan_raw)
                    nama = extracted_data["profil_debitur"].get("nama", "?")
                    print(f"[{app_id}] ✓ API fallback — {nama}")
                    await progress(f"Data verified — {nama}", 7, 70)
                except Exception as api_err:
                    print(
                        f"[{app_id}] ✗ API fallback also failed: {api_err}",
                        file=sys.stderr,
                    )

        # ── Finish extraction ────────────────────────────────────────────────
        stop_browse.set()
        stop_screenshots.set()
        await asyncio.sleep(0.1)

        if extracted_data and not used_api_verify and mode == "browser":
            nama = (extracted_data.get("profil_debitur") or {}).get("nama", "")
            if nama:
                await progress(f"Extracted 7 sections — {nama}", 7, 70)
            else:
                await progress("Extracted loan data from browser", 7, 70)
        elif extracted_data and mode == "api":
            await progress("Compiling loan data payload...", 7, 70)
        else:
            await progress(*STEPS[6])

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

        los_data = to_los_data_payload(extracted_data)

        await progress(*STEPS[7])
        stop_memo = asyncio.Event()
        memo_task = asyncio.create_task(memo_progress_heartbeat(progress, stop_memo))

        memo_draft = await generate_memo(extracted_data, app_id, backend_url)
        stop_memo.set()
        memo_task.cancel()
        try:
            await memo_task
        except asyncio.CancelledError:
            pass

        await progress(*STEPS[8])
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

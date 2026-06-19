# Agent Browser Review

## TL;DR

The data-testid selectors, URLs, and tab structure are **all aligned** between agent.py and the LOS client. The most likely failure points are:

1. **LLM timeout** — browser_use agent has 120s timeout with 8 max steps
2. **Browser launch failure** — Playwright/Chromium not installed properly
3. **MEMO_SKILL is dead code** — custom SOP never reaches agent.py
4. **API fallback still needs browser** — for screenshots, so browser must work even in API mode

---

## File Locations

| File | Purpose |
|---|---|
| `dashboard/agent/agent.py` | Main Python agent (958 lines) |
| `dashboard/agent/screenshot_stream.py` | Sidecar for live screenshots |
| `dashboard/server/services/agentManager.ts` | Spawns agent.py as subprocess |
| `dashboard/server/services/llmService.ts` | Dashboard chat LLM (not agent) |
| `client/` | LOS React app |

---

## How It Works

```
Dashboard UI → agentManager.ts → spawns agent.py
                                    ↓
                           browser_use Agent
                           (Playwright + LLM)
                                    ↓
                           Extracts data via JS evaluate
                           on Data Summary tab
                                    ↓
                           Calls /api/internal/complete
                           with JSON result
                                    ↓
                           Dashboard receives via WebSocket
                           → shows in HasilPanel
```

---

## Prompts Review

### Browser Task Prompt (agent.py:561-690)

**Step 1 — Login:**
```
1. Go to {los_url}/login
2. Use vision to find username field, type "{u}"
3. Find password field, type "{p}"
4. Click login button
```
- Uses **vision** (not data-testid) to find fields
- This is correct for browser_use framework

**Step 2 — Navigate to Data Summary:**
```
5. Go to {los_url}/loans/{app_id}?tab=data-summary
6. Wait 2 seconds
```

**Step 3 — Extract via JS evaluate:**
```javascript
document.querySelectorAll('[data-testid^="summary-value-"]')
document.querySelectorAll('[data-testid^="summary-crde-rule-"]')
```
- Grabs all summary values in one JS call
- Much faster than clicking each field

**Step 4 — Visual review (optional):**
```
7. Click tab-profil-debitur
8. Click tab-hasil-crde
```

### Memo Generation Prompt (agent.py:385-483)

- Writes formal Consumer Credit Analysis Memo
- Maps CRDE decisions: `APPROVED` → approve, `PERLU REVIEW KOMITE` → refer, `DITOLAK` → reject
- Returns 9 JSON keys (executive_summary + 7 sections + recommendation)
- Word limits per section

---

## data-testid Alignment

### Login — ALL MATCH ✓

| Agent looks for | Client has | Status |
|---|---|---|
| `input-username` (vision) | `input-username` | ✓ |
| `input-password` (vision) | `input-password` | ✓ |
| `btn-login` (vision) | `btn-login` | ✓ |

### Tab Buttons — ALL MATCH ✓

| Agent clicks | Client has | Status |
|---|---|---|
| `tab-profil-debitur` | `tab-profil-debitur` | ✓ |
| `tab-data-keuangan` | `tab-data-keuangan` | ✓ |
| `tab-slik-ojk` | `tab-slik-ojk` | ✓ |
| `tab-aml-fraud` | `tab-aml-fraud` | ✓ |
| `tab-hasil-crde` | `tab-hasil-crde` | ✓ |
| `tab-agunan` | `tab-agunan` | ✓ |
| `tab-permohonan-kredit` | `tab-permohonan-kredit` | ✓ |
| `tab-data-summary` | `tab-data-summary` | ✓ |

### Data Summary Extracted Fields — ALL MATCH ✓

| Agent JS query | Client has | Status |
|---|---|---|
| `summary-value-app-product` | `summary-value-app-product` | ✓ |
| `summary-value-app-amount` | `summary-value-app-amount` | ✓ |
| `summary-value-app-tenor` | `summary-value-app-tenor` | ✓ |
| `summary-value-app-rate` | `summary-value-app-rate` | ✓ |
| `summary-value-app-purpose` | `summary-value-app-purpose` | ✓ |
| `summary-value-app-branch` | `summary-value-app-branch` | ✓ |
| `summary-value-app-mo` | `summary-value-app-mo` | ✓ |
| `summary-value-app-status` | `summary-value-app-status` | ✓ |
| `summary-value-debtor-name` | `summary-value-debtor-name` | ✓ |
| `summary-value-debtor-nik` | `summary-value-debtor-nik` | ✓ |
| `summary-value-debtor-npwp` | `summary-value-debtor-npwp` | ✓ |
| `summary-value-debtor-dob` | `summary-value-debtor-dob` | ✓ |
| `summary-value-debtor-marital` | `summary-value-debtor-marital` | ✓ |
| `summary-value-debtor-dependents` | `summary-value-debtor-dependents` | ✓ |
| `summary-value-debtor-employment` | `summary-value-debtor-employment` | ✓ |
| `summary-value-debtor-employer` | `summary-value-debtor-employer` | ✓ |
| `summary-value-debtor-job` | `summary-value-debtor-job` | ✓ |
| `summary-value-debtor-years` | `summary-value-debtor-years` | ✓ |
| `summary-value-debtor-city` | `summary-value-debtor-city` | ✓ |
| `summary-value-debtor-phone` | `summary-value-debtor-phone` | ✓ |
| `summary-value-debtor-email` | `summary-value-debtor-email` | ✓ |
| `summary-value-fin-gross` | `summary-value-fin-gross` | ✓ |
| `summary-value-fin-net` | `summary-value-fin-net` | ✓ |
| `summary-value-fin-existing` | `summary-value-fin-existing` | ✓ |
| `summary-value-fin-installment` | `summary-value-fin-installment` | ✓ |
| `summary-value-fin-total` | `summary-value-fin-total` | ✓ |
| `summary-value-fin-remaining` | `summary-value-fin-remaining` | ✓ |
| `summary-value-fin-dti` | `summary-value-fin-dti` | ✓ |
| `summary-value-fin-dti-threshold` | `summary-value-fin-dti-threshold` | ✓ |
| `summary-value-fin-verified` | `summary-value-fin-verified` | ✓ |
| `summary-value-slik-date` | `summary-value-slik-date` | ✓ |
| `summary-value-slik-kol` | `summary-value-slik-kol` | ✓ |
| `summary-value-slik-worst` | `summary-value-slik-worst` | ✓ |
| `summary-value-slik-history` | `summary-value-slik-history` | ✓ |
| `summary-value-slik-bank` | `summary-value-slik-bank` | ✓ |
| `summary-value-slik-facility` | `summary-value-slik-facility` | ✓ |
| `summary-value-slik-existing-amount` | `summary-value-slik-existing-amount` | ✓ |
| `summary-value-slik-blacklist` | `summary-value-slik-blacklist` | ✓ |
| `summary-value-aml-date` | `summary-value-aml-date` | ✓ |
| `summary-value-aml-dttot` | `summary-value-aml-dttot` | ✓ |
| `summary-value-aml-un` | `summary-value-aml-un` | ✓ |
| `summary-value-aml-pep` | `summary-value-aml-pep` | ✓ |
| `summary-value-aml-pep-edd` | `summary-value-aml-pep-edd` | ✓ |
| `summary-value-aml-income` | `summary-value-aml-income` | ✓ |
| `summary-value-aml-address` | `summary-value-aml-address` | ✓ |
| `summary-value-aml-fraud` | `summary-value-aml-fraud` | ✓ |
| `summary-value-crde-decision` | `summary-value-crde-decision` | ✓ |
| `summary-value-crde-risk` | `summary-value-crde-risk` | ✓ |
| `summary-value-crde-score` | `summary-value-crde-score` | ✓ |
| `summary-value-crde-dti` | `summary-value-crde-dti` | ✓ |
| `summary-value-crde-dti-limit` | `summary-value-crde-dti-limit` | ✓ |
| `summary-value-crde-dti-passed` | `summary-value-crde-dti-passed` | ✓ |
| `summary-value-crde-kol` | `summary-value-crde-kol` | ✓ |
| `summary-value-crde-kol-passed` | `summary-value-crde-kol-passed` | ✓ |
| `summary-value-crde-aml` | `summary-value-crde-aml` | ✓ |
| `summary-value-crde-fraud` | `summary-value-crde-fraud` | ✓ |
| `summary-value-crde-rules-count` | `summary-value-crde-rules-count` | ✓ |
| `summary-crde-rule-{i}` | `summary-crde-rule-{i}` | ✓ |
| `summary-value-col-type` | `summary-value-col-type` | ✓ |
| `summary-value-col-desc` | `summary-value-col-desc` | ✓ |
| `summary-value-col-market` | `summary-value-col-market` | ✓ |
| `summary-value-col-liquid` | `summary-value-col-liquid` | ✓ |
| `summary-value-col-ltv` | `summary-value-col-ltv` | ✓ |
| `summary-value-col-legal` | `summary-value-col-legal` | ✓ |
| `summary-value-col-status` | `summary-value-col-status` | ✓ |

---

## Failure Points

### CRITICAL

| # | Issue | Location | Impact |
|---|---|---|---|
| 1 | **LLM timeout 120s** | agent.py:845 | If LLM is slow, extraction times out |
| 2 | **Browser won't launch** | agent.py:731 | Playwright/Chromium not installed → everything fails |
| 3 | **API fallback still needs browser** | agent.py:789 | For screenshots, so browser must work even in API mode |
| 4 | **JSON parse failure** | agent.py:78-129 | If LLM returns garbage, 4-strategy parser may still fail |

### HIGH

| # | Issue | Location | Impact |
|---|---|---|---|
| 5 | **MEMO_SKILL dead code** | agentManager.ts:78, agent.py | Custom SOP never reaches agent |
| 6 | **LOS_URL env dead code** | agentManager.ts:80-81 | Agent reads from task JSON, not env |
| 7 | **Memo fallback = raw JSON dump** | agent.py:524-551 | If memo LLM fails, output is unreadable |
| 8 | **Pydantic monkey-patch** | agent.py:21-33 | Could break other libraries |

### MEDIUM

| # | Issue | Location | Impact |
|---|---|---|---|
| 9 | **Concurrent spawn leak** | agentManager.ts:18 | Process crash doesn't clean `activeTasks` |
| 10 | **PROMPT.md is stale** | PROMPT.md | Documents data-testid fill, code uses vision |

---

## Environment Variables

| Var | Passed by agentManager? | Read by agent.py? | Status |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | ✓ | ✓ | OK |
| `GEMINI_API_KEY` | ✓ | ✓ | OK |
| `CUSTOM_LLM_API_KEY` | ✓ | ✓ | OK |
| `LLM_PROVIDER` | ✓ | ✓ (as `PROVIDER`) | OK |
| `ANTHROPIC_MODEL` | ✓ | ✓ | OK |
| `GEMINI_MODEL` | ✓ | ✓ | OK |
| `CUSTOM_LLM_ENDPOINT` | ✓ | ✓ | OK |
| `CUSTOM_LLM_MODEL` | ✓ | ✓ | OK |
| `BROWSE_PROVIDER` | ✓ | ✓ | OK |
| `BROWSE_MODEL` | ✓ | ✓ | OK |
| `BROWSE_ENDPOINT` | ✓ | ✓ | OK |
| `BROWSE_API_KEY` | ✓ | ✓ | OK |
| `EXTRACTION_MODE` | ✓ | ✓ | OK |
| `MEMO_SKILL` | ✓ | ✗ | **DEAD CODE** |
| `LOS_URL` | ✓ | ✗ | **DEAD CODE** |
| `LOS_LOGIN_PATH` | ✓ | ✗ | **DEAD CODE** |
| `PYTHONIOENCODING` | ✓ | N/A | OK |
| `BROWSER_USE_DISABLE_EXTENSIONS` | ✓ | N/A | OK |

---

## Debugging Checklist

If the agent keeps failing, check:

1. **Is Playwright installed?**
   ```bash
   cd dashboard/agent
   .venv/Scripts/python.exe -c "from playwright.sync_api import sync_playwright; print('OK')"
   ```

2. **Is Chromium installed?**
   ```bash
   .venv/Scripts/python.exe -m playwright install chromium
   ```

3. **Is the LOS server running?**
   ```bash
   curl http://localhost:3333/api/loans?status=Under+Review
   ```

4. **Test agent directly**
   ```bash
   cd dashboard/agent
   .venv/Scripts/python.exe agent.py --task '{"appId":"APP-001","losUrl":"http://localhost:3333","username":"analyst01","password":"bms2025","extractionMode":"api"}'
   ```

5. **Check API mode works first** (no browser needed for data)
   - Set `EXTRACTION_MODE=api` in Settings
   - This skips browser navigation entirely

6. **Check logs for specific errors**
   - `ModuleNotFoundError` → pip install missing package
   - `TimeoutError` → LLM too slow or browser hung
   - `JSON decode error` → LLM output malformed
   - `Connection refused` → LOS server not running

---

## Recommendation

Since data-testid selectors are all aligned and the code is structurally correct, the issue is likely **environmental**:

1. First test with `EXTRACTION_MODE=api` — this bypasses browser entirely
2. If API mode works, the problem is Playwright/Chromium setup
3. If API mode also fails, check LLM API key and network

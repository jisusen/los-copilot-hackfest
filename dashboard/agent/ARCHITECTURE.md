# Agent Architecture

How the Credit Analyst Copilot agent works end-to-end.

---

## Big Picture

```
Analyst clicks "RUN REVIEW" on Dashboard
        │
        ▼
Dashboard Server spawns Python process (agent.py)
        │
        ├── browser_use opens headless Chromium
        ├── Screenshots stream back to Dashboard every 1s
        ├── Progress steps broadcast via WebSocket
        │
        ▼
Agent extracts loan data (browser OR api mode)
        │
        ▼
Claude/Gemini generates 8-section credit memo
        │
        ▼
report_complete → Dashboard stores session → card turns green
        │
        ▼
Analyst clicks "OPEN & DECIDE" → ReviewPage loads memo + chat
```

---

## File Map

```
dashboard/
├── client/pages/DashboardPage.tsx     — "RUN REVIEW" button, card grid, WebSocket listener
├── server/routes/batch.ts             — POST /api/batch → spawns agents
├── server/services/agentManager.ts   — spawnAgent() runs agent.py as subprocess
├── server/routes/internal.ts         — receives callbacks from agent (/progress, /complete, /screenshot)
├── server/services/sessionStore.ts   — in-memory store for completed sessions
├── server/routes/decisions.ts        — GET /api/sessions/:id, POST /api/decisions/:id
└── agent/
    ├── agent.py                       — the Python agent (browser_use + LLM)
    ├── PROMPT.md                      — all prompts in one place
    └── ARCHITECTURE.md                — this file
```

---

## Step-by-Step Flow

### 1. Analyst triggers a batch

```
POST /api/batch  { appIds: ["APP-001", "APP-002"] }
```

`batch.ts` calls `spawnAgent(task)` for each app. Each task carries:
- `appId`, `taskId`
- `losUrl` — where the LOS is (`http://localhost:3333`)
- `backendUrl` — where to POST callbacks back (`http://localhost:3003`)
- `credentials` — analyst01 / bms2025

### 2. agentManager spawns a subprocess

```ts
Bun.spawn({
  cmd: ['.venv/Scripts/python.exe', 'agent.py', '--task', JSON.stringify(task)],
  stdout: 'pipe',  // streams to dashboard console as [APP-001] lines
  stderr: 'pipe',  // streams as [APP-001:err] lines
})
```

Logs from the agent are printed to the **dashboard server terminal** — that's where to look when debugging.

### 3. agent.py starts up

```python
EXTRACTION_MODE = os.environ.get("EXTRACTION_MODE", "browser")  # "browser" | "api"
```

Two parallel things start immediately:
- **walk_progress task** — fires fake progress steps every 13s ("Reading Debtor Profile tab...", "Reading Financials tab...", etc.) — these are for UI only, not real navigation
- **screenshot task** — takes a PNG screenshot of the browser every 1s and POSTs it to `/api/internal/screenshot`

### 4a. EXTRACTION_MODE=browser (default)

browser_use `Agent` runs with the extraction task prompt:
1. Navigates to `/login`, fills credentials, clicks login
2. Navigates directly to `?tab=data-summary` — a single page with ALL loan fields
3. Reads every `data-testid="summary-value-*"` element
4. Returns structured JSON

The agent's output is retrieved via `result.final_result()` (the agent's last message), NOT `str(result)` (which dumps the entire action history and is useless for parsing).

### 4b. EXTRACTION_MODE=api (fast path)

Two things run in parallel:
- **httpx** calls `POST /api/auth/login` then `GET /api/loans/{appId}` on the LOS — gets the full DB record in ~2s
- **browser_use Agent** navigates through each tab visually (for screenshots only, no extraction)

Data from the API is mapped to the same structure as browser mode via `los_loan_to_extracted()`.

### 5. Field name contract

The extracted data must have these exact keys so `internal.ts` and `ReviewPage.tsx` can read them:

| Section | Critical fields |
|---|---|
| `hasilCrde` | `decision`, `riskScore`, `numericScore`, `rulesTriggered` |
| `dataKeuangan` | `dtiRatio` (formatted as "35.0%") |
| `amlFraud` | `pepStatus` (bool), `dttotMatch` (bool) |
| `slikOjk` | `kolektibilitas` (integer 1–5) |
| `profilDebitur` | `nama` |

These are camelCase to match what `server/routes/internal.ts` reads when broadcasting `agent:complete`.

### 6. Memo generation

`generate_memo(extracted_data, app_id)` sends the full extracted JSON to Claude or Gemini with `MEMO_SYSTEM` as the system prompt. Returns 9-key JSON:

```
executive_summary, section1_profil, section2_permohonan, section3_keuangan,
section4_slik, section5_aml, section6_agunan, section7_crde, section8_rekomendasi
```

### 7. report_complete

```python
POST /api/internal/complete  { losData, memoDraft, taskId, appId }
```

`internal.ts` does two things:
1. `sessionStore.set(appId, { losData, memoDraft })` — saves everything in memory
2. Broadcasts `agent:complete` via WebSocket → Dashboard card turns green with CRDE result

### 8. Analyst opens the review

`GET /api/sessions/{appId}` returns the stored session.
`ReviewPage.tsx` renders `CreditMemo` + `CopilotChat` + `DecisionFooter`.

When the analyst submits a decision:
```
POST /api/decisions/{appId}  { decision: "approve"|"reject"|"cancel", note, analystId }
```
This writes to the dashboard SQLite DB and also updates the LOS DB loan status.

---

## WebSocket Message Types

All real-time updates go through WebSocket (`ws://localhost:3003`):

| Type | When | Payload |
|---|---|---|
| `agent:progress` | Each progress step | `{ appId, step, pct, elapsedMs }` |
| `agent:screenshot` | Every 1s while running | `{ appId, screenshot }` (base64 PNG) |
| `agent:complete` | Extraction + memo done | `{ appId, result: { riskScore, crdeDecision, numericScore, ... } }` |
| `agent:error` | Any failure | `{ appId, error, retryable }` |
| `agent:decided` | Analyst submits decision | `{ appId, decision, analystId, decidedAt }` |

---

## Progress Steps (what the UI shows)

These labels are **cosmetic** — they run on a timer regardless of what the agent is actually doing:

```
1.  8%  Launching browser...
2. 14%  Navigating to LOS login page...
3. 20%  Logging in as analyst...
4. 27%  Opening loan application...
5. 35%  Reading Debtor Profile tab...
6. 44%  Reading Financials tab...
7. 54%  Reading SLIK OJK tab...
8. 64%  Reading AML & Fraud tab...
9. 74%  Reading CRDE Result tab...
10. 88%  Compiling data payload...
11. 95%  Generating credit memo with AI...
```

Real progress is tracked by when `agent:complete` arrives.

---

## Debugging Checklist

| Symptom | Where to look |
|---|---|
| UNKNOWN values on card | Dashboard terminal → `[APP-001:err]` lines, check `final_result preview:` |
| Blank review screen | `GET /api/sessions/APP-001` returns 404 → agent never called `report_complete` |
| No screenshots | Browser didn't open in 5s — check `[APP-001:err]` for browser launch errors |
| Error card | `agent:error` was broadcast — full error in dashboard terminal |
| Still 8 minutes | `EXTRACTION_MODE` not set or `browser` with slow LLM — switch to `api` in `.env` |
| Agent exits code 1 | Python crash — full traceback in `[APP-001:err]` stream |

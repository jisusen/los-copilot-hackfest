# Credit Analyst Copilot — Demo Architecture

**Hackathon:** Browser Use Hackfest  
**Team:** Bank Maju Bersama (BMB)  
**Stack:** Bun + React + Python + browser-use

---

## Overview

An AI-powered credit analyst copilot that automates loan application review. The agent browses a Loan Origination System (LOS), extracts debtor data, generates a structured credit memo, and lets the analyst make the final decision — all powered by `browser-use` for autonomous browser navigation.

```
┌──────────────────────┐     ┌──────────────────────────────┐
│   LOS Demo (:3333)   │     │   Copilot Dashboard (:3003)  │
│                      │     │                              │
│  React SPA (data-    │◄────│  Bun server + WebSocket      │
│  testid for agents)  │     │  Python agent orchestration  │
│                      │     │  Real-time screenshot stream │
│  Bun + SQLite        │     │  Analyst review + decision   │
└──────────────────────┘     └──────────────────────────────┘
                                        │
                               ┌────────▼────────┐
                               │  Python Agent    │
                               │  (browser-use)   │
                               │                  │
                               │  ┌────────────┐  │
                               │  │ Playwright  │  │
                               │  │ (headless)  │  │
                               │  └────────────┘  │
                               │  browser_use.    │
                               │  Agent + LLM     │
                               └─────────────────┘
```

---

## Why `browser-use`?

The LOS is a **demo victim app** — built specifically for AI agent navigation. Every data field has `data-testid` attributes. `browser-use` gives us:

| Capability | Why it matters |
|---|---|
| **LLM-driven navigation** | Agent decides which tab to click, which field to read — no hardcoded selectors |
| **`evaluate` action** | Execute arbitrary JavaScript in the browser context — extract all fields in one call |
| **Screenshot streaming** | Demo judges see live browser activity on the dashboard |
| **Headless Playwright** | No visible browser window, but full DOM interaction |

---

## Extraction Strategy: Hybrid (Fast + Visual)

Instead of clicking 7 tabs individually (slow, ~15 LLM calls), we use a **Data Summary** tab that consolidates all fields on one page.

### Flow

```
Login (1-2 steps)
  │
  ▼
Navigate to /loans/{id}?tab=data-summary (1 step)
  │
  ▼
One evaluate() call → reads all summary-value-* fields (1 step)
  │
  ▼
Click tab-profil-debitur (for screenshot visual)
  │
  ▼
Click tab-hasil-crde (for screenshot visual)
  │
  ▼
Return structured JSON → generate credit memo
```

**Before:** ~15 LLM calls, 8-15 min per loan  
**After:** ~6 LLM calls, 2-3 min per loan

### The evaluate action

The agent runs this JavaScript via `browser-use`'s `evaluate` action:

```javascript
(function(){
  try{
    var fields = Array.from(document.querySelectorAll('[data-testid^="summary-value-"]'));
    var result = fields.map(function(el){
      return {id: el.getAttribute('data-testid'), text: el.textContent?.trim()};
    });
    var rules = Array.from(document.querySelectorAll('[data-testid^="summary-crde-rule-"]'));
    var rulesText = rules.map(function(el){return el.textContent?.trim().replace(/^•\s*/,'')});
    return JSON.stringify({values: result, rules: rulesText});
  }catch(e){return '{"values":[],"rules":[]}'}
})()
```

No vision parsing, no DOM walking — just direct `data-testid` attribute extraction.

---

## Data Flow

```
┌─────────┐     HTTP POST (progress/complete/error)     ┌──────────┐
│ Python  │─────────────────────────────────────────────►│  Bun     │
│ Agent   │                                              │  Server  │
│         │◄─────── Bun.spawn({ env: { ... } }) ─────────│  (:3003) │
└─────────┘                                              └────┬─────┘
                                                              │
                                              WebSocket broadcast
                                              (agent:progress,
                                               agent:complete,
                                               agent:screenshot)
                                                              │
                                                         ┌────▼─────┐
                                                         │  React   │
                                                         │  Dashboard│
                                                         │          │
                                                         │ AgentGrid │
                                                         │ ReviewPage│
                                                         └──────────┘
```

### Key components

| Component | Role |
|---|---|
| `agent.py` | Python script using `browser-use` Agent + `BrowserSession` |
| `agentManager.ts` | Spawns Python process, sets env vars from settings |
| `internal.ts` | HTTP endpoints for Python callbacks (`/api/internal/progress`, `/api/internal/complete`) |
| `wsManager.ts` | WebSocket broadcast to all connected dashboard clients |
| `settings.ts` | LLM provider, API keys, LOS URL — persisted as `dashboard/.settings.json` |

### What's passed to the Python agent

```
LLM_PROVIDER      → "anthropic" | "gemini" | "custom"
ANTHROPIC_API_KEY → sk-...
ANTHROPIC_MODEL   → claude-sonnet-4-6
GEMINI_API_KEY    → ...
GEMINI_MODEL      → gemini-2.5-pro
CUSTOM_LLM_*      → endpoint / model / key
BROWSE_PROVIDER   → (optional) separate model for browsing
LOS_URL           → http://localhost:3333
EXTRACTION_MODE   → "browser" | "api"
MEMO_SKILL        → custom SOP Markdown
```

---

## Dashboard UX

### Agent Progress (live logs)

The dashboard shows real-time agent logs via WebSocket. Progress messages cycle through realistic browsing activity:

```
✓ Navigating to LOS login page...
✓ Logging in as analyst...
✓ Opening loan application...
✓ Opening Data Summary page — all fields consolidated
✓ Reading loan application header (product, amount, tenor)
✓ Extracting debtor personal data (NIK, NPWP, name, DOB, marital)
✓ Collecting financial data — income, obligations, DSR ratio
✓ Parsing SLIK OJK credit bureau report
✓ Checking AML & fraud screening results
✓ Evaluating CRDE decision, risk score, and triggered rules
✓ All data extracted from Data Summary — verifying completeness
✓ Clicking tab profil-debitur for visual review...
✓ Clicking tab hasil-crde for visual review...
▶ Generating credit memo — analyzing debtor profile...
```

### Screenshot streaming

Every 2 seconds, the agent captures a Base64 screenshot via CDP and streams it to the dashboard. The analyst sees what the agent sees.

### Analyst Review

After extraction, the analyst can:
1. Review the AI-generated credit memo (8 sections)
2. Chat with the copilot for deeper analysis
3. Make a final decision (Approve / Refer to Committee / Reject)
4. Decision is saved to SQLite audit log + pushed back to LOS

---

## Settings & Configuration

The dashboard settings page controls:

| Section | What you set |
|---|---|
| **Analysis LLM** | Provider + model + API key for extraction & memo |
| **Browsing LLM** | Optional separate model for browser navigation. Leave empty = reuse Analysis LLM |
| **LOS Connection** | URL, username, password for the LOS app |
| **Agent** | Extraction mode (browser/api), mock toggle |
| **Skills** | Custom SOP/Juknis Markdown injected into the memo prompt |

### Supported Providers

| Provider | Models Tested | Notes |
|---|---|---|
| Anthropic | claude-sonnet-4-6 | Fast, reliable, best for navigation |
| Gemini | gemini-2.5-pro | Free tier, generous quota, fast |
| Custom | GLM-5.1, Qwen3.6-flash | OpenAI-compatible (OpenRouter, vLLM, Ollama) |

---

## Mock Mode (No Python)

For testing without a browser agent, set `mockAgent: true`. The dashboard uses seeded LOS data and generates realistic-looking progress logs, memos, and decisions — entirely in TypeScript. No Python, no LLM, no browser needed.

---

## File Reference

```
dashboard/
├── agent/
│   ├── agent.py              # Main agent (browser-use + extraction logic)
│   ├── screenshot_stream.py  # CDP screenshot sidecar
│   └── AGENTS.md             # Agent system prompt documentation
├── server/
│   ├── index.ts              # Bun server entry
│   ├── routes/
│   │   ├── internal.ts       # Python agent callbacks (progress/complete)
│   │   ├── settings.ts       # Settings CRUD + env sync
│   │   ├── decisions.ts      # Decision persistence + sessions
│   │   ├── batch.ts          # Batch agent orchestration
│   │   └── chat.ts           # Copilot chat endpoint
│   └── services/
│       ├── agentManager.ts   # Python process lifecycle
│       ├── wsManager.ts      # WebSocket broadcast
│       └── sessionStore.ts   # In-memory agent state
├── client/
│   ├── pages/
│   │   ├── DashboardPage.tsx  # Agent grid + loan queue
│   │   ├── ReviewPage.tsx     # Credit memo + chat + decision
│   │   └── SettingsPage.tsx   # LLM/LOS/agent config
│   └── components/
│       ├── AgentCard.tsx      # Running agent card with logs
│       ├── ReviewCard.tsx     # Agent card for review page
│       ├── AgentGrid.tsx      # Grid of agent cards
│       └── CreditMemo.tsx     # Memo display + section navigation
└── .settings.json             # Runtime config (gitignored)
```

---

## Quick Start

```bash
# Terminal 1 — LOS Demo
bun install
bun run server/db/seed.ts --reset
bun run server/index.ts       # :3333

# Terminal 2 — Copilot Dashboard
cd dashboard
bun install
bun run server/index.ts       # :3003
```

Open `http://localhost:3003` → select loans → **Run Review**.

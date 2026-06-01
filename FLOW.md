# System Flow — Credit Analyst Copilot

## Overview

Two apps, one shared database:

```
┌────────────────────────┐     ┌──────────────────────────────┐
│   LOS App (port 3333)  │     │  Dashboard (port 3003)       │
│                        │     │                              │
│  React SPA             │     │  React SPA                   │
│  Bun HTTP server       │     │  Bun HTTP server             │
│  Loan origination UI   │     │  Agent copilot UI            │
│  Human analyst reviews │     │  AI agent reviews            │
│  Makes final decision  │     │  Generates memo, NO decision │
└────────┬───────────────┘     └────────┬─────────────────────┘
         │                               │
         └───────────┬───────────────────┘
                     ▼
         ┌──────────────────────┐
         │   SQLite (los.db)    │
         │                      │
         │  loan_applications   │
         │  debtors             │
         │  financials          │
         │  slik_ojk            │
         │  aml_fraud           │
         │  crde_results        │
         │  collaterals         │
         │  loan_notes       ◄──┤ ← memo saved here by both
         │  sessions            │
         └──────────────────────┘
```

Both apps point at the **same `data/los.db`** file. The Dashboard reads/writes `loan_notes` directly so the LOS analyst can see the Copilot's memo.

---

## LOS App (port 3333) — Human Workflow

```
Login (analyst01 / bms2025)
    │
    ▼
Task List (/loans)
    │ list of 10 seeded applications
    │ filter by status / product type
    ▼
Loan Detail (/loans/APP-001)
    │
    ├── Data Summary        (data-summary)
    ├── Loan Application    (permohonan-kredit)
    ├── Debtor Profile      (profil-debitur)
    ├── Financial Data      (data-keuangan)
    ├── SLIK OJK            (slik-ojk)
    ├── AML & Fraud         (aml-fraud)
    ├── CRDE Decision       (hasil-crde)
    ├── Collateral          (agunan)
    ├── Audit Log           (audit-log)
    └── Notes & Memo        (notes)
           │
           ├── Copilot memo (agent note, read-only)
           │     └── "▼ Show printed memo" → formal CAM
           │
           └── Manual notes (analyst's own notes)
                 └── Category: Observation / Recommendation / Override Justification / General
    │
    ▼ (status = "Under Review")
Action buttons: [Approve] [Reject] [Cancel]
    │
    ▼ Confirmation modal
    │
    ▼ PATCH /api/loans/:id/status { status: "Approved" }
    │  → saves status + decided_at
    │  → toast popup: "Application Approved" ✓
    ▼
Status pill updates, action buttons disappear
```

### Key LOS behaviours

| Behaviour | Detail |
|---|---|
| Auto-assign | Opening a loan sets `analyst_id` + status to "Under Review" |
| Status flow | `pending` → `Under Review` → `Approved` / `Rejected` / `Cancelled` |
| Status is terminal | Once Approved/Rejected/Cancelled, `decided_at` is set, buttons hide |
| No edit after final | Analyst cannot change status after final decision |
| Memo is read-only | Copilot memo shown in Notes tab; cannot edit from LOS |

---

## Dashboard (port 3003) — Copilot Workflow

```
Login (same creds)
    │
    ▼
Dashboard Home (/)
    │
    ├── Left sidebar: Task List (380px, always visible)
    │     Select apps → click "Run review" → agent starts
    │     Ready apps → "Review →" badge → click to review
    │
    └── Right panel:
          Stats bar (in review / running / ready / memo submitted / avg time)
          Ready for review (horizontal compact cards)
          Agents working (live cards with screenshots) OR "No agents running"
          Memo submitted (history)
    │
    ▼
Select app(s) → "Run review"
    │
    ▼ Agent starts
    │
    ├── API Agent mode (fast, direct REST calls to LOS API)
    │     Reads all loan data, generates memo in ~20s
    │
    └── Browser Agent mode (uses Playwright + browser_use)
            Opens headless Chromium, navigates LOS UI
            Streams screenshots to dashboard in real-time
            Extracts data via UI, generates memo in ~60s
    │
    ▼ Agent finishes → status = "ready"
    │
    ▼ Analyst clicks "Review →" on a ready app
    │
    ▼ Review Page (/review/APP-001)
    │
    ├── CreditMemo component (8-section printed memo)
    │     Section 1-7: read-only, auto-generated
    │     Section 8 (Recommendation): editable
    │     Key Metrics sidebar: DBR, SLIK, AML, Score, Rules
    │     CRDE Decision banner at top
    │
    ├── CopilotChat (ask questions about the loan)
    │
    └── DecisionFooter (sticky bottom bar)
          Optional note input
          [Submit Memo →] button
    │
    ▼ Submit Memo → confirmation modal
    │
    ▼ POST /api/decisions/APP-001 { memo, note }
    │
    ▼ Server saves to loan_notes table:
      ├── content = section8_rekomendasi + Additional Note (only!)
      ├── memo_json = full 8-section JSON (for printed memo render)
      ├── author_type = 'agent'
      └── category = 'Copilot Analyst'
    │
    ▼ WebSocket broadcast: agent:decided
    │
    ▼ Dashboard UI refreshes → row moves to "Memo submitted"
```

---

## Memo Data Flow (critical)

```
Agent generates memo (MemoDraft object)
  │  9 fields:
  │    executive_summary (not shown in printed memo, stored in JSON)
  │    section1_profil through section8_rekomendasi
  │
  ▼
Saved to loan_notes as:
  │
  ├── content:      ONLY section8_rekomendasi + "**Additional Note:** ..."
  │                 (human-readable summary, shown in note card preview)
  │
  └── memo_json:    Full JSON.stringify(MemoDraft)
                    (parsed by LOS NotesTab for printed memo render)
  │
  ▼
LOS NotesTab reads GET /api/loans/:id/notes
  │
  ├── Shows content as note summary (recommendation + additional note)
  │
  └── "▼ Show printed memo" → parses memo_json → renders 7 sections + recommendation box
        I. Debtor Profile
        II. Loan Application
        III. Financial Analysis
        IV. SLIK OJK
        V. AML & Fraud
        VI. Collateral
        VII. CRDE Decision
        Recommendation Summary (section8_rekomendasi)
```

### Important: No approve/reject from Copilot

The Copilot **never** changes `loan_applications.status`. It only submits a memo as a note. The human analyst must open the LOS app and click Approve/Reject there. This ensures human-in-the-loop for final credit decisions.

---

## Agent Modes

| Mode | How it works | Speed | Visual feedback |
|---|---|---|---|
| **API Agent** | Direct REST calls to `GET /api/loans/:id` + related endpoints. No browser. | ~20s | Log lines, no screenshots |
| **Browser Agent** | Launches Playwright Chromium, navigates LOS UI pages, extracts data visually | ~60s | Live screenshots streamed via WebSocket every 1s |

Toggled in Settings → "Agent Mode" dropdown. Both modes produce the same `MemoDraft` structure.

---

## Shared Database Schema (loan_notes table)

```sql
CREATE TABLE loan_notes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id      TEXT NOT NULL,         -- APP-001
    author      TEXT NOT NULL,         -- "Copilot Analyst"
    author_type TEXT NOT NULL DEFAULT 'manual',  -- 'agent' | 'manual'
    content     TEXT NOT NULL,         -- flattened recommendation + note
    category    TEXT NOT NULL DEFAULT 'General', -- 'Copilot Analyst' | 'Observation' | etc
    memo_json   TEXT,                  -- full JSON for printed memo
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## Key Terminology

| Term | Meaning |
|---|---|
| DBR | Debt Burden Ratio (replaces DTI/DSR) |
| CRDE | Credit Risk Decision Engine — internal risk scoring |
| RAC | Risk Acceptance Criteria — policy thresholds |
| CAM | Credit Analysis Memorandum — the printed memo format |
| SLIK OJK | Indonesian credit bureau (similar to credit report) |
| DTTOT | Domestic Terrorism/Terrorist Organization list |
| PEP | Politically Exposed Person |

---

## Ports

| App | Port | URL |
|---|---|---|
| LOS App | 3333 | http://localhost:3333 |
| Dashboard | 3003 | http://localhost:3003 |

---

## Commands

```bash
bun run dev              # Start LOS app only (port 3333)
bun run demo             # Start both LOS + Dashboard concurrently
bun run db:seed          # Seed 10 loan applications
bun run db:reset         # Drop + reseed
bun run build            # Build LOS frontend
cd dashboard && bun run dev   # Start dashboard only
```

## Credentials

All users: password `bms2025`

- `analyst01` — Credit Analyst
- `analyst02` — Credit Analyst
- `supervisor` — Supervisor

# TaskKimi.MD — Execution Plan

**Selected approach:** Execute Phase 1+2 (English Localization + Demo Reliability + LOS Realism)

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## PHASE 1: ENGLISH LOCALIZATION + DEMO RELIABILITY

### LOS Demo — English UI

- [x] `client/pages/LoginPage.tsx` — "Sign In", "Invalid username or password", "Consumer Credit Information System"
- [x] `client/pages/LoanQueuePage.tsx` — already English
- [x] `client/pages/LoanDetailPage.tsx` — already English
- [x] `client/components/Layout.tsx` — already English
- [x] `client/components/TabNav.tsx` — already English
- [x] `client/components/tabs/*.tsx` — all 7 tabs already English
- [x] `server/db/seed.ts` — already English

### Dashboard — English UI

- [x] `dashboard/server/routes/batch.ts` — step messages to English
- [x] `dashboard/agent/agent.py` — LLM prompts and step labels to English
- [x] `dashboard/server/services/llmService.ts` — chat system prompt to English

### Dashboard — Decision Persistence

- [x] Create `dashboard/server/db/dashboardDb.ts` — `decisions` + `audit_logs` tables
- [x] Modify `dashboard/server/routes/decisions.ts` — write to DB on decision, read history
- [x] Modify `dashboard/server/index.ts` — add `/api/decisions` list endpoint
- [x] Modify `dashboard/server/services/sessionStore.ts` — persist decisions + hydrate on get

### Dashboard — Mock Agent Polish

- [x] Modify `dashboard/server/routes/batch.ts` — accept `mock` flag from request body
- [x] Modify `dashboard/client/pages/DashboardPage.tsx` — add "⚡ SIMULATION / 🤖 REAL AGENT" toggle
- [x] Improve `spawnMockAgent` — queries real LOS DB for realistic data per app

### Agent — Error Recovery

- [x] Refactor `dashboard/agent/agent.py` — wrap `agent.run()` in try/except
- [x] Parse partial data on failure, create minimal structure if completely unparseable
- [x] `generate_memo` handles partial data gracefully (already did via fallback JSON)
- [x] Always reports completion with partial data instead of hard error when possible

---

## PHASE 2: LOS REALISM

### LOS — Under Review Assignment

- [x] Modify `server/db/schema.sql` — add `assigned_at`, `decided_at` columns
- [x] Modify `server/routes/loans.ts` — POST `/api/loans/:id/assign` endpoint
- [x] Modify `server/routes/loans.ts` — `GET /api/loans` returns `analyst_id`
- [x] Modify `client/pages/LoanDetailPage.tsx` — auto-assign on mount
- [x] Modify `client/pages/LoanDetailPage.tsx` — show blue assignment banner
- [x] Modify `client/pages/LoanQueuePage.tsx` — add Analyst column

### LOS — Audit Log Tab

- [x] Create `server/db/schema.sql` addition — `audit_logs` table
- [x] Modify `server/db/seed.ts` — seed audit events for all 10 apps
- [x] Modify `server/routes/loans.ts` — `GET /api/loans/:id/audit` endpoint
- [x] Create `client/components/tabs/AuditLogTab.tsx` — timeline with icons & colors
- [x] Modify `client/components/TabNav.tsx` — add "Audit Log" as 8th tab
- [x] Modify `client/pages/LoanDetailPage.tsx` — render AuditLogTab

### LOS — Print Memo

- [x] Create `client/components/PrintMemoView.tsx` — print-optimized view with all tabs
- [x] Modify `client/pages/LoanDetailPage.tsx` — add "🖨️ Print Memo" button
- [x] Add CSS `@media print` styles for clean output
- [x] Include bank header, CRDE banner, all 7 sections, footer

---

## MEMO IMPROVEMENTS (Bonus)

### Executive Summary

- [x] Add `executive_summary` field to `MemoDraft` type (client + server)
- [x] Update LLM prompt (`agent.py`) to generate 4-sentence executive summary
- [x] Render executive summary card at top of MemoViewer

### Pre-filled Section 8

- [x] LLM prompt instructs pre-filled recommendation based on CRDE decision
- [x] Mock agent generates risk-aware Section 8 (APPROVE / REFER / REJECT with rationale)
- [x] Section 8 textarea has structured placeholder

### Red Flags Box

- [x] Compute red flags from DTI, SLIK, AML, triggered rules
- [x] Show red-bordered box with bullet list when flags exist
- [x] Hidden when no flags (clean apps)

### Key Metrics Sidebar

- [x] Sticky sidebar with DTI, SLIK, AML, Score, Rules count
- [x] Color-coded pass/warn/fail dots
- [x] Decision badge at bottom of sidebar

### Memo Formatting

- [x] Support `**bold**` for key numbers and decisions
- [x] Support `•` bullet points for lists
- [x] Support `_italic_` for emphasis
- [x] Render as styled HTML instead of plain text

### Mock Agent Memo Quality

- [x] Risk-profile-aware memo generation (high/medium/low)
- [x] Dynamic Section 3 based on DTI vs threshold
- [x] Dynamic executive summary based on risk
- [x] Richer Section 7 with bullet-point rules

### Data Quality / Parsing Fixes

- [x] Fix DTI parsing in `internal.ts` (handles "35%" string and 0.35 number)
- [x] Fix DTI parsing in `ReviewPage.tsx`
- [x] Fix SLIK/AML parsing from losData

---

## PHASE 3: NICE-TO-HAVE (Skipped per Plan)

- [ ] SLIK 24-month payment timeline visualization
- [ ] Keyboard shortcuts (1-7 tabs, / search, j/k navigate)
- [ ] Dashboard throughput analytics panel
- [ ] Enhanced queue stats (per-product breakdown, avg DTI, risk distribution)
- [x] Export PDF button from Dashboard Review page

---

## VERIFICATION CHECKLIST

- [x] `bun run db:seed && bun run dev` works for LOS Demo
- [x] `bun run dev` works for Dashboard
- [x] All visible UI text is in English
- [x] `data-testid` attributes are UNCHANGED
- [x] Mock mode completes in <30 seconds per app
- [x] Decisions persist after Dashboard server restart
- [x] Agent handles extraction failure with partial data instead of crashing
- [x] Both builds pass (`bun build`)
- [x] Memo has executive summary, red flags, key metrics, formatted text
- [x] Section 8 pre-filled with AI recommendation

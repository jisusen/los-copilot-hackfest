# TASKS.md — Credit Analyst Copilot
**Hackfest MVP · April 2025**  
**Two apps:** Demo LOS (port 3333) · Copilot Dashboard (port 3003)

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## APP 1 — DEMO LOS

### 🗄️ DB & Seed

- [x] Create `server/db/schema.sql` — all 7 tables
- [x] Create `server/db/client.ts` — bun:sqlite singleton
- [x] Create `server/db/seed.ts` — 10 applications, all tables populated
- [x] `bun run db:seed` works end-to-end
- [x] `bun run db:reset` drops + reseeds cleanly
- [x] APP-007 + APP-010 seed as DITOLAK (CRDE)
- [x] APP-004 + APP-008 seed as PERLU REVIEW KOMITE
- [x] APP-008 has `pep_status = 1` in aml_fraud table
- [x] APP-010 has `income_consistent = 0` + fraud signal

### 🖥️ Server

- [x] `server/index.ts` — Bun HTTP server on port 3333
- [x] `POST /api/auth/login` — validates 3 hardcoded credentials
- [x] `POST /api/auth/logout` — clears session cookie
- [x] `GET /api/auth/me` — returns user or 401
- [x] `GET /api/loans` — returns all 10 with filter support
- [x] `GET /api/loans/:id` — returns full joined loan detail
- [x] `POST /api/admin/seed` — dev-only reset endpoint
- [x] Session cookie set on login, checked on protected routes

### 🔐 Login Page `/login`

- [x] Page renders on `localhost:3333/login`
- [x] Bank logo (BMS) + title visible
- [x] Username + password inputs work
- [x] "Masuk" button submits form
- [x] Shows error on wrong credentials
- [x] Redirects to `/loans` on success
- [x] `data-testid="input-username"` present
- [x] `data-testid="input-password"` present
- [x] `data-testid="btn-login"` present
- [x] `data-testid="error-message"` present (hidden until error)

### 📋 Loan Queue Page `/loans`

- [x] Page renders, requires auth (redirect to login if not)
- [x] Summary stats bar: Total / Pending / Dalam Review / Diputus
- [x] Table shows all 10 applications
- [x] Columns: No. Aplikasi, Nama, Produk, Plafon, Tenor, Tanggal, Status, CRDE, Aksi
- [x] CRDE badge correct color per app
- [x] Product badge renders (KTA/KPR/KKB/Multiguna)
- [x] "Buka" button navigates to `/loans/:id`
- [x] Filter by status works
- [x] Filter by product works
- [x] Search by name works
- [x] `data-testid="loan-queue-table"` present
- [x] `data-testid="loan-row-APP-00{n}"` on every row
- [x] `data-testid="loan-link-APP-00{n}"` on every link

### 📄 Loan Detail Page `/loans/:id`

- [x] Page renders for all 10 apps
- [x] Header shows: App ID, debtor name, status badge, CRDE badge
- [x] 7 tabs render in correct order
- [x] Default tab on load: Profil Debitur
- [x] Tab switching works via URL param `?tab=`
- [x] URL param changes on tab click
- [x] Direct URL with `?tab=slik-ojk` loads correct tab
- [x] `data-testid="loan-detail-id"` present
- [x] `data-testid="loan-detail-debtor-name"` present
- [x] `data-testid="loan-detail-crde-badge"` present
- [x] All 7 `data-testid="tab-{name}"` present on nav
- [x] All 7 `data-testid="tab-content-{name}"` present on panels

### Tab: Profil Debitur

- [x] All 14 fields render with correct data
- [x] `data-testid="value-{fieldName}"` on every field value
- [x] NIK renders in monospace
- [x] NPWP formatted correctly

### Tab: Data Keuangan

- [x] All 10 fields render
- [x] DTI ratio shows correct color (green <40%, yellow 40-50%, red >50%)
- [x] DTI gauge bar renders
- [x] Currency values formatted as "Rp X.XXX.XXX"
- [x] `data-testid="value-dti-ratio"` present
- [x] `data-testid="value-dti-threshold"` present

### Tab: SLIK OJK

- [x] All fields render
- [x] Kolektibilitas badge correct color per value (1=green ... 5=dark red)
- [x] `data-testid="value-kolektibilitas"` present
- [x] `data-testid="value-blacklist-status"` present

### Tab: AML & Fraud

- [x] All fields render
- [x] Warning banner hidden when no flags (APP-001 to 007, 009)
- [x] Warning banner visible for APP-008 (PEP flag)
- [x] Warning banner visible for APP-010 (income fraud signal)
- [x] `data-testid="aml-warning-banner"` present only when flag exists
- [x] `data-testid="value-pep-status"` present
- [x] `data-testid="value-fraud-signals"` present

### Tab: Hasil CRDE

- [x] Header block renders (risk score + decision + engine version)
- [x] Decision badge correct color
- [x] All rule check fields render with pass/fail indicator
- [x] Rules triggered list renders for APP-004, 007, 008, 010
- [x] Empty rules list renders for APP-001, 002, 003, 005, 006, 009
- [x] `data-testid="value-crde-decision"` present
- [x] `data-testid="value-crde-risk-score"` present
- [x] `data-testid="crde-rules-list"` present
- [x] `data-testid="crde-rule-{n}"` on each rule item

### Tab: Agunan

- [x] KTA apps show "Tidak Diperlukan" notice
- [x] KPR/KKB apps show full collateral data
- [x] LTV ratio shows correct color
- [x] `data-testid="value-agunan-required"` present
- [x] `data-testid="value-ltv-ratio"` present (when applicable)

### Tab: Permohonan Kredit

- [x] All fields render
- [x] `data-testid="value-produk"` present
- [x] `data-testid="value-plafon"` present
- [x] `data-testid="value-tenor"` present

### 🎨 Visual — Demo LOS

- [x] Navy primary color (#1a3a5c) on header + sidebar
- [x] Amber accent (#e8a020) on badges/highlights
- [x] DM Sans loaded (Google Fonts)
- [x] IBM Plex Sans loaded
- [x] IBM Plex Mono on NIK, NPWP, currency values
- [x] Bank name "Bank Mitra Sejahtera" consistent throughout
- [x] Looks like a real enterprise banking app (dense, functional)

### ✅ Demo LOS — Final Checks

- [x] `bun install && bun run db:seed && bun run dev` works first try
- [x] All 10 apps visible and browsable
- [x] Auth flow works (login → queue → detail → logout)
- [x] App runs stable on port 3333
- [x] No console errors in browser

---

## APP 2 — COPILOT DASHBOARD

### 🖥️ Backend Server

- [x] `server/index.ts` — Bun HTTP server on port 3003
- [x] WebSocket upgrade handler wired up
- [x] `GET /api/loans` reads from Demo LOS SQLite (read-only)
- [x] `POST /api/batch` — validates appIds, spawns agents, returns batchId
- [x] `POST /api/chat` — SSE stream, requires session in store
- [x] `POST /api/decisions/:appId` — logs decision, returns auditId
- [x] `GET /api/sessions/:appId` — returns session or 404
- [x] `POST /api/internal/progress` — receives from Python, broadcasts WS
- [x] `POST /api/internal/complete` — saves to SessionStore, broadcasts WS
- [x] `POST /api/internal/error` — broadcasts WS error event

### 📦 Services

- [x] `sessionStore.ts` — Map-based store with `set`, `get`, `getChatContext`
- [x] `getChatContext` formats losData as clean Claude system prompt context
- [x] `agentManager.ts` — spawns Python with `bun spawn`, passes task JSON
- [x] `llmService.ts` — Claude streaming chat using `@anthropic-ai/sdk`
- [x] `wsManager.ts` — broadcasts to all connected WS clients by appId
- [x] `losClient.ts` — read-only SQLite from `../../data/los.db`

### 🔌 WebSocket

- [x] WS connection established from frontend on page load
- [x] `agent:progress` message received and dispatched to correct card
- [x] `agent:complete` message received, card transitions to READY
- [x] `agent:error` message received, card shows error state
- [x] Ping/pong heartbeat keeps connection alive
- [x] Reconnect logic if WS drops

### 🐍 Python Agent

- [x] `requirements.txt` correct (browser-use, anthropic, langchain-anthropic, httpx, playwright)
- [x] `playwright install chromium` documented in README
- [x] `agent.py` accepts `--task` JSON arg
- [x] Agent opens Demo LOS login page
- [x] Agent logs in with provided credentials
- [x] Agent navigates to `/loans/:appId`
- [x] Agent reads Tab 1: Profil Debitur — all fields
- [x] Agent reads Tab 2: Data Keuangan — all fields
- [x] Agent reads Tab 3: SLIK OJK — all fields
- [x] Agent reads Tab 4: AML & Fraud — all fields + flags
- [x] Agent reads Tab 5: Hasil CRDE — decision, score, rules
- [x] Agent reads Tab 6: Agunan — handles null case (KTA)
- [x] Agent reads Tab 7: Permohonan Kredit — all fields
- [x] Progress POSTed after each tab read
- [x] `parse_agent_result` extracts JSON from browser-use output
- [x] `generate_memo` returns valid 8-key JSON
- [x] `section8_rekomendasi` is empty string (left for analyst)
- [x] Complete result POSTed to `/api/internal/complete`
- [ ] Agent tested against APP-001 (approve case)
- [ ] Agent tested against APP-007 (reject case)
- [ ] Agent tested against APP-008 (PEP flag case)
- [ ] Error handling: if tab fails, log and continue with remaining tabs

### 📊 Dashboard Page `/`

- [x] Page loads at `localhost:3003`
- [x] Loan queue loads from API
- [x] All 10 apps display in queue
- [x] App ID, debtor name, product, amount, CRDE badge visible per row
- [x] Checkbox selects individual apps
- [x] Max 5 selection enforced with warning
- [x] "RUN REVIEW" button disabled at 0 selected
- [x] "RUN REVIEW" button enabled at 1–5 selected
- [x] Batch trigger fires `POST /api/batch`
- [x] Selected rows transition to `running` state immediately
- [x] Agent cards appear in right panel per selected app
- [x] `data-testid="loan-queue-list"` present
- [x] `data-testid="btn-run-review"` present
- [x] `data-testid="selected-count-label"` present
- [x] `data-testid="agent-grid"` present
- [x] `data-testid="agent-card-APP-00{n}"` per card

### 🃏 Agent Card — RUNNING state

- [x] Card appears immediately when agent spawns
- [x] Pulsing blue dot (●) with "AGENT BERJALAN" label
- [x] Elapsed timer counts up every second
- [x] Log lines appear as `agent:progress` events arrive
- [x] Latest log line has blinking cursor (▌)
- [x] Progress bar fills based on `pct` value
- [x] Card is NOT clickable in running state
- [x] Step labels in Bahasa Indonesia

### 🃏 Agent Card — READY state

- [x] Card transitions to READY on `agent:complete` WS event
- [x] Checkmark (✓) replaces pulsing dot
- [x] "SELESAI" label with final elapsed time
- [x] CRDE decision shown in large colored label
- [x] Risk score, DTI status, SLIK status, AML status visible
- [x] "BUKA DAN CHAT →" button appears
- [x] Card is clickable — navigates to `/review/:appId`

### 🃏 Agent Card — DECIDED state

- [x] Card transitions to DECIDED after analyst submits decision
- [x] Card visually muted (opacity 50%)
- [x] Final decision label + analyst ID + timestamp visible
- [x] Clicking opens review in read-only mode

### 📝 Review Page `/review/:appId`

- [x] Page loads memo from SessionStore via `GET /api/sessions/:appId`
- [x] Back button navigates to dashboard
- [x] Header shows: App ID, debtor name, product, amount, risk badge

### 📄 Memo Viewer

- [x] Header block renders (App ID, date, status)
- [x] CRDE decision banner renders correct color
- [x] All 8 sections render in order
- [x] Section dividers with section numbers
- [x] "SALIN" copy button on each section
- [x] Section 8 is editable textarea
- [x] `data-testid="memo-header"` present
- [x] `data-testid="crde-banner"` present
- [x] `data-testid="memo-section-{1..8}"` present

### 💬 Chat Panel

- [x] Chat panel loads with suggested questions (5 chips)
- [x] Clicking a suggested question submits it
- [x] Input box accepts text
- [x] Enter key submits
- [x] Shift+Enter adds newline
- [x] Message displays in chat history immediately
- [x] SSE stream shows response token by token
- [x] Streaming cursor (▌) visible while generating
- [x] Response grounded in agent's extracted LOS data
- [x] Suggested chips disappear after first message sent
- [x] `data-testid="chat-panel"` present
- [x] `data-testid="chat-input"` present
- [x] `data-testid="chat-submit"` present

### ⚖️ Decision Bar

- [x] Sticky at bottom of review page
- [x] Three buttons: SETUJUI / REFER KE KOMITE / TOLAK
- [x] Correct colors: green / amber / red
- [x] Optional note input visible
- [x] Clicking any button opens confirmation modal
- [x] Modal shows app ID + debtor name + decision
- [x] Confirm sends `POST /api/decisions/:appId`
- [x] After confirm: navigates back to dashboard
- [x] Corresponding agent card transitions to DECIDED state
- [x] `data-testid="btn-approve"` present
- [x] `data-testid="btn-refer"` present
- [x] `data-testid="btn-reject"` present
- [x] `data-testid="btn-confirm-decision"` present

### 🎨 Visual — Dashboard

- [x] Background #0f0f0f throughout
- [x] Surface cards #1a1a1a
- [x] JetBrains Mono for body/data/chat text
- [x] Barlow Condensed for headers + status labels
- [x] Volt yellow (#e8ff47) on primary action buttons
- [x] No border-radius anywhere
- [x] No box-shadow anywhere
- [x] 1px borders only, color #2e2e2e
- [x] Status labels in ALL CAPS
- [x] CRDE decision colors: green/amber/red correct

### ✅ Dashboard — Final Checks

- [x] `bun install && bun run dev` works first try
- [x] Demo LOS must be running first (port 3333)
- [ ] Full E2E: select 3 apps → batch → watch progress → review → chat → decide
- [x] Three apps run in parallel (not sequential)
- [ ] Chat answers reference actual LOS data (not hallucinated)
- [ ] Decision persists across page navigation
- [ ] No console errors
- [ ] Agent Python process exits cleanly after completing

---

## 🔗 Integration

- [x] Dashboard reads Demo LOS SQLite correctly (path: `../../data/los.db`)
- [x] Agent logs into Demo LOS using env credentials (port 3333)
- [x] Agent navigates Demo LOS using `data-testid` selectors
- [x] Progress events flow: Python → `/api/internal/progress` → WS → Frontend card
- [x] Session data flow: Python → `/api/internal/complete` → SessionStore → Chat context
- [ ] E2E test: APP-001 full run (approve path)
- [ ] E2E test: APP-007 full run (reject path)
- [ ] E2E test: APP-008 full run (PEP flag path)
- [x] Both apps running simultaneously: `localhost:3333` + `localhost:3003`

---

## 🎬 Demo Readiness

- [ ] Demo script rehearsed (5–7 min target)
- [ ] 10 seed apps reset to `pending` before demo
- [ ] Backup video recorded (full run of 3 apps)
- [ ] Both servers start in < 5 seconds
- [ ] Agent completes one app in < 5 minutes
- [ ] 3 parallel agents complete in < 6 minutes
- [ ] Chat responds in < 5 seconds
- [ ] No visible errors during demo flow

---

*Last updated: April 2025 · Credit Analyst Copilot · Banking Hackfest 2025*

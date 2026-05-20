# PRD: Credit Analyst Copilot — Dashboard
**For:** Claude Code  
**Project:** Credit Analyst Copilot — Main Product  
**Stack:** Bun + React + Python (browser-use) + WebSocket  
**Port:** Dashboard 3002 · Backend 3003 · Python Agent spawned per task  
**Last Updated:** April 2025

---

## 0. What We're Building

A **brutalist dashboard** where credit analysts manage autonomous AI agents that browse the Demo LOS, read loan data, and draft credit memos. The analyst watches agents work in real time, then clicks into each completed review to chat with the AI and make a final decision.

**One sentence:** Select loans → watch agents browse → click a card → chat → decide.

---

## 1. Visual Design — Brutalism, Softened

### Aesthetic Direction

**Soft brutalism.** The philosophy of brutalism — raw structure, typography as layout, no decorative polish — but executed with restraint. No heavy 4px borders. No box-shadow stacks. The brutalism comes from **bold type, exposed grid, high contrast, functional color** — not from visual noise.

Think: a Bloomberg terminal had a baby with a well-designed internal tool. Dense, fast, serious.

### Color Palette

```css
--bg:           #0f0f0f;   /* Near-black page background */
--surface:      #1a1a1a;   /* Card / panel background */
--surface-2:    #242424;   /* Elevated surface (hover, active) */
--border:       #2e2e2e;   /* Subtle dividers — thin, 1px only */
--text:         #f0f0f0;   /* Primary text — off-white */
--text-muted:   #6e6e6e;   /* Labels, secondary — mid-grey */
--text-dim:     #3a3a3a;   /* Placeholders, disabled */
--accent:       #e8ff47;   /* Volt yellow — primary action, highlights */
--accent-dim:   #b8cc30;   /* Hover state for accent */
--green:        #22c55e;   /* Approve / success */
--amber:        #f59e0b;   /* Refer / warning */
--red:          #ef4444;   /* Reject / error */
--blue:         #60a5fa;   /* Info / running state */
--agent-pulse:  #3b82f6;   /* Agent activity indicator */
```

### Typography

```css
--font-display: 'Barlow Condensed', sans-serif;  /* Bold headers, status labels — load from Google Fonts */
--font-body:    'JetBrains Mono', monospace;      /* All body text, data, chat — monospace throughout */
--font-ui:      'Barlow', sans-serif;             /* Buttons, nav, small UI labels */
```

**Rule:** Body and data text is monospace. This gives the app a "terminal reading loan data" feeling that fits the agent theme perfectly. Chat messages, memo text, field values — all JetBrains Mono.

### Layout Rules

- No border-radius on cards or panels (brutalism — square corners only)
- Borders: 1px solid `var(--border)` only — never thicker
- No box-shadow anywhere
- No gradients anywhere
- Grid-based layout — everything snaps to a clear structure
- Generous internal padding (24px+) but zero decorative spacing
- Status/decision labels in ALL CAPS
- Numbers and amounts in monospace, always

---

## 2. App Structure

```
dashboard/
├── package.json
├── bun.lockb
├── bunfig.toml
│
├── server/
│   ├── index.ts              # Bun HTTP server — API + static + WebSocket
│   ├── routes/
│   │   ├── loans.ts          # GET /api/loans — queue from LOS DB
│   │   ├── batch.ts          # POST /api/batch — trigger agents
│   │   ├── chat.ts           # POST /api/chat — session-scoped Q&A (SSE)
│   │   └── decisions.ts      # POST /api/decisions/:appId
│   ├── services/
│   │   ├── sessionStore.ts   # In-memory store — agent results per appId
│   │   ├── agentManager.ts   # Spawn + track Python processes
│   │   ├── llmService.ts     # Claude API — chat + memo generation
│   │   └── wsManager.ts      # WebSocket broadcast hub
│   └── db/
│       └── losClient.ts      # Read-only SQLite connection to Demo LOS DB
│
├── client/
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx               # Router: / → Dashboard, /review/:appId → ReviewPanel
│   ├── pages/
│   │   ├── DashboardPage.tsx     # Main view — queue + agent cards
│   │   └── ReviewPage.tsx        # Full memo + chat for one application
│   ├── components/
│   │   ├── LoanQueue.tsx         # Left panel — pending loans table
│   │   ├── AgentGrid.tsx         # Right panel — agent cards grid
│   │   ├── AgentCard.tsx         # Single agent — live log OR ready state
│   │   ├── BatchTrigger.tsx      # "Run Review" button + selected count
│   │   ├── MemoViewer.tsx        # 8-section structured memo
│   │   ├── ChatPanel.tsx         # Session-scoped chat (SSE streaming)
│   │   └── DecisionBar.tsx       # Approve / Refer / Reject sticky bar
│   ├── hooks/
│   │   ├── useWebSocket.ts       # WS connection + message dispatch
│   │   ├── useAgentSessions.ts   # Agent state map (appId → AgentState)
│   │   └── useChat.ts            # Chat history + SSE streaming
│   └── lib/
│       ├── api.ts                # Fetch wrapper
│       ├── format.ts             # Currency, date, DTI formatters
│       └── types.ts              # Shared TypeScript types
│
└── agent/
    ├── agent.py              # Main entry — receives task JSON via args
    ├── tasks/
    │   ├── login.py
    │   ├── read_profil.py
    │   ├── read_keuangan.py
    │   ├── read_slik.py
    │   ├── read_aml_fraud.py
    │   ├── read_crde.py
    │   └── read_agunan.py
    ├── memo_generator.py     # Claude API call → structured memo
    ├── result_reporter.py    # POST result back to Node backend
    └── requirements.txt
```

---

## 3. Dashboard Page — Main View

**Route:** `/`

This is the full-screen command center. Split layout — loan queue on the left, agent cards on the right.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  TOPBAR: Bank Mitra Sejahtera · Credit Analyst Copilot · analyst01│
├──────────────────────┬───────────────────────────────────────────┤
│                      │                                           │
│   LOAN QUEUE         │   AGENT WORKSPACE                        │
│   (left panel)       │   (right panel)                          │
│   ~380px fixed       │   flexible, grid                         │
│                      │                                           │
│  [ ] APP-001  ▸      │  ┌──────────┐  ┌──────────┐             │
│  [ ] APP-002  ▸      │  │ APP-003  │  │ APP-007  │             │
│  [x] APP-003  ▸      │  │ RUNNING  │  │  DONE    │             │
│  [ ] APP-004  ▸      │  │ ...logs  │  │ 🟢 DISET │             │
│  [x] APP-007  ▸      │  └──────────┘  └──────────┘             │
│  [ ] APP-008  ▸      │                                           │
│  [x] APP-010  ▸      │  ┌──────────┐                            │
│  ...          ▸      │  │ APP-010  │                            │
│                      │  │ RUNNING  │                            │
│  ─────────────────   │  │ ...logs  │                            │
│  3 selected          │  └──────────┘                            │
│  [▶ RUN REVIEW]      │                                           │
│                      │   (empty state: "Select loans to begin") │
└──────────────────────┴───────────────────────────────────────────┘
```

---

### 3.1 Loan Queue (Left Panel)

**Component:** `LoanQueue.tsx`

Fetches from `GET /api/loans` on mount. Polling every 30s.

**Header:**
```
ANTRIAN KREDIT KONSUMER
{n} aplikasi · {n} pending
```

**Table rows** — one per application:

```
☐  APP-001  Budi Santoso     KTA    Rp 50jt   🟢 DISETUJUI    ▸
☐  APP-004  Dewi Lestari     KTA    Rp 75jt   🟡 REVIEW       ▸
```

Each row:
- Checkbox (left) — toggles selection for batch
- App ID (monospace, dim color)
- Debtor name (primary text)
- Product badge (tiny: KTA / KPR / KKB)
- Amount (monospace: Rp XXjt format)
- CRDE badge (colored pill)
- Arrow (right) — click to open review if session exists, disabled otherwise

**States per row:**
- `idle` — default, checkable
- `selected` — checkbox checked, row accent-tinted left border
- `running` — disabled checkbox, spinner, "DALAM PROSES" label
- `ready` — agent done, row glows subtly, "SIAP DIREVIEW →" CTA
- `decided` — greyed out, shows final decision label

**`data-testid`:**
```
loan-queue-list
loan-row-{appId}
loan-checkbox-{appId}
loan-status-{appId}
btn-run-review
selected-count
```

---

### 3.2 Batch Trigger

**Component:** `BatchTrigger.tsx` — rendered at bottom of left panel

```
─────────────────────────
3 DIPILIH

[▶ RUN REVIEW]
```

- Disabled (greyed) when 0 selected
- Enabled when 1–5 selected
- Shows "MAX 5 APLIKASI" warning if >5 selected
- On click: `POST /api/batch { appIds: string[] }`
- After click: selected rows transition to `running` state, agent cards appear in right panel

**`data-testid`:** `btn-run-review`, `selected-count-label`

---

### 3.3 Agent Cards Grid (Right Panel)

**Component:** `AgentGrid.tsx` + `AgentCard.tsx`

One card per running/completed agent session. Cards appear when batch starts, persist until page refresh.

Grid layout:
- 1 card: full width
- 2 cards: 2 columns
- 3–4 cards: 2×2 grid
- 5 cards: 2+3 grid

**`data-testid`:** `agent-grid`, `agent-card-{appId}`

---

### 3.4 Agent Card — States

**Component:** `AgentCard.tsx`

A card has three possible states: `running`, `ready`, `decided`.

#### State 1: RUNNING

```
┌─────────────────────────────────┐
│  APP-003   Ahmad Fauzi          │
│  KPR · Rp 500jt                 │
│                                 │
│  ● AGENT BERJALAN   2m 14s     │
│                                 │
│  > Membuka halaman LOS...       │
│  > Login berhasil               │
│  > Membaca Profil Debitur...    │
│  > Membaca Data Keuangan...     │
│  ▌ Membaca SLIK OJK...          │  ← current step, blinking cursor
│                                 │
│  [████████░░░░░░░░░░░░] 40%     │
└─────────────────────────────────┘
```

- Pulsing blue dot (●) next to "AGENT BERJALAN"
- Live log lines scrolling — newest at bottom, auto-scroll
- Progress bar (step-based, not time-based)
- Elapsed timer (counts up)
- Card is NOT clickable in this state
- Step labels (in order):
  1. Membuka LOS... (10%)
  2. Login ke sistem... (20%)
  3. Membaca Profil Debitur... (30%)
  4. Membaca Data Keuangan... (45%)
  5. Membaca SLIK OJK... (60%)
  6. Membaca AML & Fraud... (70%)
  7. Membaca Hasil CRDE... (80%)
  8. Membaca Agunan... (88%)
  9. Membuat memo kredit... (95%)
  10. Selesai (100%)

#### State 2: READY

```
┌─────────────────────────────────┐
│  APP-003   Ahmad Fauzi          │
│  KPR · Rp 500jt                 │
│                                 │
│  ✓ SELESAI          3m 42s     │
│                                 │
│  REKOMENDASI CRDE:              │
│  ██ DISETUJUI                   │  ← big green label
│                                 │
│  Risk Score: LOW                │
│  DTI: 35% ✓  SLIK: Kol.1 ✓    │
│  AML: Clear ✓                   │
│                                 │
│  [BUKA DAN CHAT →]              │  ← accent yellow button
└─────────────────────────────────┘
```

- Card becomes clickable
- Summary of key results visible
- Accent yellow CTA button: "BUKA DAN CHAT →"
- Clicking navigates to `/review/APP-003`

#### State 3: DECIDED

```
┌─────────────────────────────────┐
│  APP-003   Ahmad Fauzi          │
│  KPR · Rp 500jt          ░░░░  │  ← dimmed
│                                 │
│  ✓ DISETUJUI                    │
│  analyst01 · 14:32              │
└─────────────────────────────────┘
```

- Visually muted (opacity reduced)
- Shows final decision + analyst + timestamp
- Clicking opens review in read-only mode

---

## 4. Review Page — Memo + Chat

**Route:** `/review/:appId`

Full-page review interface. Opened when analyst clicks "BUKA DAN CHAT →" on a ready agent card.

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← KEMBALI    APP-003 · Ahmad Fauzi · KPR · Rp 500jt     🟢 LOW   │
├───────────────────────────────────┬─────────────────────────────────┤
│                                   │                                 │
│   NOTA ANALISIS KREDIT            │   CHAT COPILOT                  │
│   (scrollable, left 60%)          │   (sticky right 40%)            │
│                                   │                                 │
│   [8 sections of memo]            │   Tanya apa saja tentang        │
│                                   │   aplikasi ini...               │
│                                   │                                 │
│                                   │   [suggested questions]         │
│                                   │                                 │
│                                   │   > chat history                │
│                                   │                                 │
│                                   │   [input box]                   │
│                                   │                                 │
├───────────────────────────────────┴─────────────────────────────────┤
│  KEPUTUSAN: [✓ SETUJUI]  [⚠ REFER KE KOMITE]  [✗ TOLAK]  + note   │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 4.1 Memo Viewer (Left Panel)

**Component:** `MemoViewer.tsx`

Renders the 8-section Nota Analisis Kredit Konsumer generated by the agent.

**Header block:**
```
NOTA ANALISIS KREDIT KONSUMER
NO. APLIKASI: APP-003
TANGGAL: 18 APRIL 2025
STATUS: DRAFT AI — MENUNGGU KEPUTUSAN ANALIS
```

**CRDE Decision banner** (pinned below header):
```
┌──────────────────────────────────────┐
│  REKOMENDASI CRDE: DISETUJUI    🟢   │
│  Risk Score: LOW · Skor: 823/1000    │
│  Rules terpicu: Tidak ada            │
└──────────────────────────────────────┘
```
Color: green background (#1a2e1a), green border for approve. Amber for refer. Red for reject.

**8 memo sections** rendered sequentially:

Each section:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PROFIL DEBITUR                [SALIN]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[section content in JetBrains Mono]

```

Sections:
1. PROFIL DEBITUR
2. PERMOHONAN KREDIT
3. ANALISIS KEUANGAN & KEMAMPUAN BAYAR
4. HASIL SLIK OJK
5. SCREENING AML & DETEKSI FRAUD
6. AGUNAN *(skip if KTA)*
7. KEPUTUSAN CRDE
8. CATATAN & REKOMENDASI ANALIS *(editable textarea)*

Section 8 is an editable `<textarea>` — analyst types override notes before deciding.

**`data-testid`:**
```
memo-header
crde-banner
memo-section-{1..8}
memo-section-copy-{1..8}
memo-section-8-textarea
```

---

### 4.2 Chat Panel (Right Panel)

**Component:** `ChatPanel.tsx`

Sticky right column. All chat is scoped to this application's agent session.

**Header:**
```
COPILOT CHAT
APP-003 · Ahmad Fauzi
```

**Suggested questions** (shown on first open, disappear after first message):
```
Pertanyaan umum:
  › Kenapa CRDE merekomendasikan ini?
  › Berapa DTI debitur ini?
  › Apa saja kewajiban existing-nya?
  › Ada flag AML atau fraud?
  › Kalau tenor diperpanjang, DTI berubah?
```

Each is a clickable chip that auto-submits.

**Chat message layout:**

Analyst message:
```
ANALIS   14:28
Kenapa CRDE merekomendasikan approve?
```

Copilot response (streaming):
```
COPILOT   14:28
CRDE merekomendasikan DISETUJUI karena
seluruh kriteria RAC terpenuhi:

• DTI 35% — di bawah batas KTA 40%
• Kolektibilitas SLIK: 1 (Lancar)
• Tidak ada flag AML atau fraud
• Skor numerik: 823/1000

Tidak ada rules yang terpicu. Debitur
memiliki kapasitas bayar yang baik.▌
```

All text in JetBrains Mono. Streaming cursor (▌) visible while generating.

**Input:**
```
[Tanya tentang aplikasi ini...              ] [KIRIM]
```

Enter key submits. Shift+Enter for newline.

**`data-testid`:**
```
chat-panel
chat-messages
chat-input
chat-submit
suggested-question-{index}
chat-message-{index}
```

---

### 4.3 Decision Bar (Bottom — Sticky)

**Component:** `DecisionBar.tsx`

Fixed to bottom of review page. Always visible.

```
KEPUTUSAN FINAL:  [✓ SETUJUI]  [⚠ REFER KE KOMITE]  [✗ TOLAK]
Catatan (opsional): [___________________________________]
```

Button styling:
- SETUJUI: `background: var(--green)`, black text
- REFER: `background: var(--amber)`, black text
- TOLAK: `background: var(--red)`, white text
- All buttons: no border-radius, uppercase, bold

On click → confirm modal:
```
KONFIRMASI KEPUTUSAN

Anda akan [MENYETUJUI / MERUJUK / MENOLAK] aplikasi:
APP-003 — Ahmad Fauzi — KPR Rp 500.000.000

[KONFIRMASI]   [BATAL]
```

On confirm → `POST /api/decisions/:appId` → card transitions to `decided` state → redirect back to dashboard.

**`data-testid`:**
```
btn-approve
btn-refer
btn-reject
decision-note-input
btn-confirm-decision
```

---

## 5. WebSocket Protocol

The frontend maintains a single persistent WebSocket connection to `ws://localhost:3003/ws`.

### Connection

```typescript
// useWebSocket.ts
const ws = new WebSocket('ws://localhost:3003/ws');
ws.onmessage = (event) => dispatch(JSON.parse(event.data));
```

### Message Types (Server → Client)

```typescript
// Agent step progress
{
  type: 'agent:progress',
  appId: string,
  step: string,         // Human-readable log line in Bahasa Indonesia
  stepIndex: number,    // 1–10
  totalSteps: number,   // 10
  pct: number,          // 0–100
  elapsedMs: number
}

// Agent completed successfully
{
  type: 'agent:complete',
  appId: string,
  result: {
    riskScore: 'LOW' | 'MEDIUM' | 'HIGH',
    crdeDecision: 'DISETUJUI' | 'PERLU REVIEW KOMITE' | 'DITOLAK',
    dtiActual: number,
    slikKol: number,
    amlClear: boolean,
    numericScore: number,
    rulesTriggered: string[],
    memoDraft: MemoDraft         // 8 sections
  },
  elapsedMs: number
}

// Agent failed
{
  type: 'agent:error',
  appId: string,
  error: string,
  retryable: boolean
}
```

### Message Types (Client → Server)

```typescript
// Heartbeat
{ type: 'ping' }
```

### Frontend State Model

```typescript
// useAgentSessions.ts
type AgentState =
  | { status: 'idle' }
  | { status: 'running'; logs: string[]; pct: number; elapsedMs: number }
  | { status: 'ready'; result: AgentResult; elapsedMs: number }
  | { status: 'decided'; decision: 'approve' | 'refer' | 'reject'; analystId: string; decidedAt: string }

// Map of appId → AgentState
const [sessions, dispatch] = useReducer(sessionsReducer, new Map());

// On WS message:
// 'agent:progress' → update running state logs + pct
// 'agent:complete' → transition to 'ready' state
// 'agent:error'    → show error in card with retry button
```

---

## 6. Backend API

### Server: `server/index.ts`

Bun HTTP server. Handles REST, SSE, and WebSocket upgrade on the same port.

```typescript
const server = Bun.serve({
  port: 3003,
  fetch(req, server) {
    // WebSocket upgrade
    if (req.headers.get('upgrade') === 'websocket') {
      server.upgrade(req);
      return;
    }
    // REST routing
    return router(req);
  },
  websocket: wsHandlers,
});
```

### Endpoints

```
GET  /api/loans
     Query: ?status=pending
     Returns: { loans: LoanSummary[] }
     Source: Read-only connection to Demo LOS SQLite (./data/los.db)

POST /api/batch
     Body: { appIds: string[] }
     Returns: { batchId: string, tasks: { appId: string, taskId: string }[] }
     Action: Spawns one Python agent process per appId

POST /api/chat
     Body: { appId: string, message: string, history: Message[] }
     Returns: SSE stream of text chunks
     Auth: Session must exist in SessionStore for appId

POST /api/decisions/:appId
     Body: { decision: 'approve'|'refer'|'reject', note?: string }
     Returns: { ok: true, auditId: string }

GET  /api/sessions/:appId
     Returns: AgentResult | 404
     Used: ReviewPage fetches on mount if WS missed the complete event
```

### Session Store

```typescript
// services/sessionStore.ts
interface ReviewSession {
  appId: string;
  completedAt: Date;
  losData: {
    profilDebitur: Record<string, string>;
    dataKeuangan: Record<string, string | number>;
    slikOjk: Record<string, string | number>;
    amlFraud: Record<string, boolean | string>;
    hasilCrde: {
      riskScore: string;
      decision: string;
      numericScore: number;
      rulesTriggered: string[];
      [key: string]: unknown;
    };
    agunan?: Record<string, string | number>;
    permohonanKredit: Record<string, string | number>;
  };
  memoDraft: {
    section1_profil: string;
    section2_permohonan: string;
    section3_keuangan: string;
    section4_slik: string;
    section5_aml: string;
    section6_agunan: string;
    section7_crde: string;
    section8_rekomendasi: string;  // empty — for analyst
  };
}

class SessionStore {
  private store = new Map<string, ReviewSession>();
  set(appId: string, session: ReviewSession): void
  get(appId: string): ReviewSession | undefined
  getChatContext(appId: string): string   // formats for Claude system prompt
  list(): string[]
}

export const sessionStore = new SessionStore();
```

### Agent Manager

```typescript
// services/agentManager.ts
import { spawn } from 'bun';

export async function spawnAgent(task: AgentTask): Promise<void> {
  const taskJson = JSON.stringify(task);

  const proc = spawn({
    cmd: ['python3', 'agent/agent.py', '--task', taskJson],
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
      LOS_URL: process.env.LOS_URL || 'http://localhost:3001',
    },
  });

  // Stream stdout to console for debugging
  const reader = proc.stdout.getReader();
  (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log(`[${task.appId}]`, new TextDecoder().decode(value));
    }
  })();
}
```

### LLM Service — Chat

```typescript
// services/llmService.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function* streamChat(
  appId: string,
  history: Message[],
  userMessage: string
): AsyncGenerator<string> {
  const context = sessionStore.getChatContext(appId);

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildChatSystemPrompt(context),
    messages: [...history, { role: 'user', content: userMessage }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text;
    }
  }
}

function buildChatSystemPrompt(context: string): string {
  return `Kamu adalah Credit Analyst Copilot, asisten AI untuk analis kredit konsumer di bank Indonesia.

Kamu memiliki akses ke data aplikasi berikut yang telah dibaca langsung dari sistem LOS:

${context}

Instruksi:
- Jawab dalam Bahasa Indonesia formal
- Berikan angka spesifik dari data di atas — jangan estimasi
- Jika ditanya tentang CRDE, jelaskan rules yang sudah terpicu
- Jika data tidak ada di konteks, katakan: "Data ini tidak tersedia dalam LOS"
- Bantu analis memahami data — jangan buat keputusan kredit sendiri`;
}
```

---

## 7. Python Agent

### `agent/agent.py`

Entry point. Receives task JSON via `--task` arg. Runs full review. POSTs result back to backend.

```python
import asyncio
import argparse
import json
import httpx
from browser_use import Agent, Browser, BrowserConfig
import anthropic

async def run_review(task: dict):
    app_id = task['appId']
    task_id = task['taskId']
    los_url = task['losUrl']
    backend_url = task['backendUrl']
    credentials = task['credentials']

    client = anthropic.Anthropic()

    # Progress reporter helper
    async def report_progress(step: str, step_index: int, pct: int):
        async with httpx.AsyncClient() as http:
            await http.post(f"{backend_url}/api/internal/progress", json={
                'taskId': task_id,
                'appId': app_id,
                'step': step,
                'stepIndex': step_index,
                'totalSteps': 10,
                'pct': pct,
            })

    await report_progress("Membuka LOS...", 1, 10)

    browser = Browser(config=BrowserConfig(headless=True))

    agent = Agent(
        task=f"""
        Kamu adalah agen AI yang bertugas mengekstrak data dari sistem LOS bank.

        Ikuti langkah-langkah berikut secara berurutan:

        1. Buka {los_url}/login
        2. Login dengan username: {credentials['username']}, password: {credentials['password']}
        3. Setelah berhasil login, buka {los_url}/loans/{app_id}
        4. Baca semua data dari tab berikut secara berurutan:
           - Tab Profil Debitur (?tab=profil-debitur) — semua field
           - Tab Data Keuangan (?tab=data-keuangan) — semua field termasuk DTI
           - Tab SLIK OJK (?tab=slik-ojk) — kolektibilitas, riwayat, kewajiban
           - Tab AML & Fraud (?tab=aml-fraud) — semua status dan flag
           - Tab Hasil CRDE (?tab=hasil-crde) — risk score, decision, rules
           - Tab Agunan (?tab=agunan) — semua field (atau catat "Tidak ada agunan")
           - Tab Permohonan Kredit (?tab=permohonan-kredit) — semua field

        5. Kembalikan SEMUA data yang diekstrak sebagai JSON terstruktur.
           Jangan lewatkan field apapun. Gunakan nilai PERSIS seperti yang tertulis di layar.

        Format output yang diharapkan:
        {{
          "profil_debitur": {{ ... }},
          "data_keuangan": {{ ... }},
          "slik_ojk": {{ ... }},
          "aml_fraud": {{ ... }},
          "hasil_crde": {{ ... }},
          "agunan": {{ ... }} atau null,
          "permohonan_kredit": {{ ... }}
        }}
        """,
        llm=client,
        browser=browser,
    )

    await report_progress("Login ke sistem...", 2, 20)

    result = await agent.run()
    extracted_data = parse_agent_result(result)

    await report_progress("Membuat memo kredit...", 9, 95)

    memo = await generate_memo(client, extracted_data, app_id)

    await report_progress("Selesai", 10, 100)

    # POST result back to backend
    async with httpx.AsyncClient() as http:
        await http.post(f"{backend_url}/api/internal/complete", json={
            'taskId': task_id,
            'appId': app_id,
            'losData': extracted_data,
            'memoDraft': memo,
            'status': 'completed',
        })

    await browser.close()


async def generate_memo(client, data: dict, app_id: str) -> dict:
    response = client.messages.create(
        model='claude-sonnet-4-6',
        max_tokens=3000,
        system="""Kamu adalah analis kredit senior bank Indonesia.
Tulis nota analisis kredit konsumer formal dalam Bahasa Indonesia berdasarkan data LOS berikut.

Format wajib — kembalikan JSON dengan 8 key ini persis:
{
  "section1_profil": "...",
  "section2_permohonan": "...",
  "section3_keuangan": "...",
  "section4_slik": "...",
  "section5_aml": "...",
  "section6_agunan": "...",
  "section7_crde": "...",
  "section8_rekomendasi": ""
}

Ketentuan:
- Bahasa Indonesia formal
- Angka spesifik di setiap seksi
- section7_crde harus menjelaskan rules CRDE dalam bahasa sederhana
- section8_rekomendasi dikosongkan — akan diisi analis
- Kembalikan HANYA JSON, tidak ada teks lain""",
        messages=[{
            'role': 'user',
            'content': f"Data LOS untuk {app_id}:\n{json.dumps(data, ensure_ascii=False, indent=2)}"
        }]
    )

    raw = response.content[0].text.strip()
    # Strip markdown code fences if present
    if raw.startswith('```'):
        raw = raw.split('\n', 1)[1].rsplit('```', 1)[0]
    return json.loads(raw)


def parse_agent_result(result) -> dict:
    """Extract structured JSON from browser-use agent result."""
    raw = str(result)
    # Find JSON block in agent output
    import re
    json_match = re.search(r'\{[\s\S]*\}', raw)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    # Fallback: return raw as extraction_raw
    return {'extraction_raw': raw}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--task', required=True, help='Task JSON string')
    args = parser.parse_args()

    task = json.loads(args.task)
    asyncio.run(run_review(task))
```

### `agent/requirements.txt`

```
browser-use>=0.1.40
anthropic>=0.40.0
httpx>=0.27.0
playwright>=1.44.0
```

### Setup commands for agent

```bash
pip install -r agent/requirements.txt
playwright install chromium
```

---

## 8. Internal Progress Reporting

The Python agent POSTs progress to the backend via HTTP (not WebSocket — simpler from Python). The backend then broadcasts to all WS clients.

```
POST /api/internal/progress
Body: { taskId, appId, step, stepIndex, totalSteps, pct }
→ Backend broadcasts agent:progress WS event to all clients

POST /api/internal/complete
Body: { taskId, appId, losData, memoDraft, status }
→ Backend saves to SessionStore
→ Backend broadcasts agent:complete WS event
→ Backend updates loan status in session

POST /api/internal/error
Body: { taskId, appId, error, retryable }
→ Backend broadcasts agent:error WS event
```

These endpoints are internal — no auth needed, bind to localhost only in prod.

---

## 9. Environment Variables

```bash
# .env
PORT=3003
LOS_URL=http://localhost:3001
LOS_USERNAME=analyst01
LOS_PASSWORD=bms2025
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
DB_PATH=../demo-los/data/los.db    # Reads from Demo LOS database directly
```

---

## 10. `package.json`

```json
{
  "name": "credit-copilot-dashboard",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch server/index.ts & bun run build:watch",
    "start": "bun run server/index.ts",
    "build": "bun build client/main.tsx --outdir dist --target browser --minify",
    "build:watch": "bun build client/main.tsx --outdir dist --target browser --watch"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "latest",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0"
  }
}
```

---

## 11. Running the Full Stack

```bash
# Terminal 1 — Demo LOS (must be running first)
cd demo-los
bun run dev

# Terminal 2 — Copilot Dashboard backend + frontend
cd dashboard
bun install
bun run dev

# The Python agent is spawned automatically by the backend
# when /api/batch is called — no separate terminal needed
```

Open `http://localhost:3002` for the dashboard.

---

## 12. Definition of Done

Claude Code should consider this complete when:

**Dashboard Page:**
- [ ] Loan queue loads from `GET /api/loans` (reads Demo LOS DB)
- [ ] Checkboxes work, max 5 selection enforced
- [ ] "RUN REVIEW" button fires `POST /api/batch`
- [ ] Agent cards appear immediately after batch is triggered
- [ ] Cards show live log lines and progress bar (via WebSocket)
- [ ] Elapsed timer counts up correctly
- [ ] On `agent:complete`, card transitions to READY state
- [ ] CRDE decision badge shows correct color (green/amber/red)
- [ ] "BUKA DAN CHAT →" button navigates to `/review/:appId`

**Review Page:**
- [ ] Memo loads from SessionStore (8 sections rendered)
- [ ] CRDE banner shows correct decision + risk score
- [ ] Section 8 is an editable textarea
- [ ] Chat panel loads with suggested questions
- [ ] Clicking a suggested question submits it
- [ ] Chat streams response correctly (SSE)
- [ ] All chat responses are grounded in losData context
- [ ] Decision bar is sticky at bottom
- [ ] Clicking SETUJUI/REFER/TOLAK shows confirmation modal
- [ ] Confirming sends `POST /api/decisions/:appId`
- [ ] After decision, card on dashboard transitions to DECIDED state

**Agent:**
- [ ] `agent.py` runs without error when invoked directly
- [ ] Agent logs into Demo LOS successfully
- [ ] Agent reads all 7 tabs for APP-001
- [ ] Progress events arrive at backend and broadcast via WS
- [ ] Memo JSON is valid and has all 8 sections
- [ ] Complete event arrives and SessionStore is populated

**Visual:**
- [ ] Dark background (#0f0f0f) throughout
- [ ] JetBrains Mono for body/data text
- [ ] Barlow Condensed for headers and status labels
- [ ] Volt yellow (#e8ff47) for primary actions
- [ ] No border-radius on cards
- [ ] No box-shadow anywhere
- [ ] 1px borders only, color #2e2e2e

---

## 13. What NOT to Build

- No authentication / login screen (analyst is already logged in to their system)
- No persistent database for the dashboard (SessionStore is in-memory for MVP)
- No user management
- No notification system (WebSocket is sufficient)
- No mobile responsive design (this is a desktop analyst tool)
- No test suite
- No Docker setup

---

*Credit Analyst Copilot — Dashboard PRD · Banking Hackfest 2025*  
*Brutalism · Bun · React · browser-use · claude-sonnet-4-6*

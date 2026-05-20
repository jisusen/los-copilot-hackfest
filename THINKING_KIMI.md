# THINKING_KIMI.md — Analysis & Reasoning

## Context
Building a hackathon demo: **LOS Demo** (victim app) + **Credit Analyst Copilot Dashboard** (AI agent orchestrator). Both apps currently have Indonesian UI labels mixed with English code. Claude Sonnet is also contributing.

## What I Found After Deep Exploration

### LOS Demo (port 3333, root dir)
- **Fully implemented** — no TODOs, all 7 tabs, login, queue, detail, seed data
- **Architecture:** Bun + React + Tailwind + SQLite
- **UI Language Problem:** Every visible label is in Indonesian ("Profil Debitur", "Masuk", "Disetujui", etc.)
- **Missing Realism:**
  - No assignment tracking (who is reviewing what)
  - No audit trail / activity history
  - No print/export functionality
  - No keyboard shortcuts for power users
- **Strengths:** Good `data-testid` coverage, convincing enterprise aesthetic, realistic seed data

### Dashboard (port 3003, dashboard/ dir)
- **Fully implemented** — WebSocket, SSE chat, agent spawning, mock mode
- **Architecture:** Bun + React + Python browser-use agent + Anthropic/Gemini LLM
- **UI Language Problem:** Mix of Indonesian ("AGENT BERJALAN", "SELESAI", "BUKA DAN CHAT") and English
- **Missing Reliability:**
  - Decisions are in-memory only — lost on restart
  - Agent fails entirely if one tab errors
  - Real agent takes 3–5 min per app (too slow for demo)
- **Strengths:** Real-time screenshot streaming, mock agent for testing, brutalist design is distinctive

## Why English-First Matters for Hackathon
1. **International judges** may not read Indonesian
2. **Demo narrative** flows better in one language
3. **Agent prompts** in English produce more consistent LLM outputs
4. **Code review** by other hackers is easier

## Priority Logic

### P0: English Localization (Foundation)
Without this, everything else is harder to present. Must touch:
- LOS: 7 tab components, 3 pages, Layout, seed data
- Dashboard: 7 components, 2 pages, agent.py, llmService.ts

### P1: Demo Reliability (Show Must Go On)
- **Mock mode toggle** — lets presenter rehearse and demo fast
- **Decision persistence** — decisions survive restart, feels like real software
- **Agent error recovery** — one bad tab doesn't kill the whole batch

### P2: LOS Realism (Believability)
- **Assignment workflow** — auto-assign on open, show analyst
- **Audit log** — enterprise compliance feel
- **Print memo** — real analysts print memos

### P3: Visual Polish (Skip if Time Runs Out)
- SLIK timeline, keyboard shortcuts, dashboard analytics

## Coordination with Claude Sonnet
User mentioned Claude Sonnet is also working on this. To avoid conflicts:
- I will work on LOS tabs + English conversion + audit log + print memo
- I will work on agent.py error recovery + English prompts
- I will work on Dashboard decision persistence + mock toggle
- I will NOT touch Dashboard UI components unless needed for English conversion
- I will update TASKS.md and communicate progress clearly

## Technical Decisions

1. **Preserve data-testid** — agents rely on these selectors. Only change visible text.
2. **Keep DB schema additions minimal** — add columns with defaults to avoid breaking seed.
3. **Mock mode reads real LOS DB** — `spawnMockAgent` should query actual SQLite for realistic data instead of hardcoded values.
4. **Agent error recovery** — wrap each tab read in try/except, continue with partial data.
5. **Decision table in Dashboard** — separate from LOS DB to keep concerns clean.

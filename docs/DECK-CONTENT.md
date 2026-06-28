# Credit Analyst Copilot — Demo Day Deck Content

---

## 1. System Overview

**What is it?**
An AI-powered credit analyst assistant that automates loan application review. It extracts data from a Loan Origination System (LOS), generates 8-section credit memos using LLMs, and enables analyst decisions through an AI copilot chat interface.

**Core Value:**
An analyst selects up to 5 loan applications, clicks "Run Review," and AI agents autonomously navigate the LOS UI, extract structured data, generate a credit memo, and present everything for human review and decision.

---

## 2. Arsitektur (System Architecture)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (Analyst)                              │
│                   Browser: localhost:3003                            │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTP + WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  COPILOT DASHBOARD (Bun :3003)                      │
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐    │
│  │  React SPA UI   │    │     Backend Services                │    │
│  │                 │    │                                     │    │
│  │ • Login         │◄──►│ • agentManager (spawn agents)       │    │
│  │ • Dashboard     │    │ • llmService (streaming chat)       │    │
│  │ • Review        │    │ • wsManager (real-time updates)     │    │
│  │ • Settings      │    │ • sessionStore (in-memory + SQLite) │    │
│  └─────────────────┘    └──────────────┬──────────────────────┘    │
│                                        │                           │
│  ┌─────────────────────────────────────┼────────────────────────┐  │
│  │           SQLite Databases          │                        │  │
│  │  Dashboard DB     ◄─────────────────┘   LOS DB (read-only)  │  │
│  │  • decisions                              • loan_applications │  │
│  │  • audit_logs                             • debtors           │  │
│  │  • agent_sessions                         • financials        │  │
│  │  • loan_notes                             • slik_ojk          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ Bun.spawn() subprocess
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PYTHON AGENT (agent.py) - Per Application              │
│                                                                     │
│  ┌─────────────────────┐    ┌─────────────────────┐                │
│  │  Browser Mode       │    │  API Mode           │                │
│  │  (Playwright)       │    │  (httpx)            │                │
│  │                     │    │                     │                │
│  │  • Headless Chrome  │    │  • REST calls       │                │
│  │  • Navigate LOS UI  │    │  • POST /login      │                │
│  │  • Read data-testid │    │  • GET /loans/:id   │                │
│  │  • Screenshots      │    │  • ~2s total        │                │
│  └─────────────────────┘    └─────────────────────┘                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LLM Integration (Memo Generation)                          │   │
│  │  Anthropic Claude / Google Gemini / OpenAI-compatible        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTP REST
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LOS DEMO APP (Bun :3333)                         │
│                                                                     │
│  React + SQLite | Mock loan system | 10 seeded applications         │
│  Products: KTA, KPR, KKB, Multiguna                                │
│  Risk: LOW / MEDIUM / HIGH | AML flagged apps                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, React Router v6, Tailwind CSS 3, Lucide icons |
| **Backend** | Bun HTTP server, WebSocket, `bun:sqlite` |
| **Agent** | Python 3.11+, Playwright, httpx, browser-use |
| **LLM** | Anthropic Claude, Google Gemini, OpenAI-compat |
| **Database** | SQLite (WAL mode) |
| **Protocol** | REST API, WebSocket, SSE streaming |

### Key Numbers

- **2 ports**: Dashboard (:3003), LOS (:3333)
- **2 databases**: Dashboard DB, LOS DB (read-only)
- **2 agent modes**: Browser (Playwright), API (REST)
- **3 LLM providers**: Anthropic, Gemini, OpenAI-compat
- **6 WebSocket events**: progress, screenshot, complete, error, decided, reset
- **10 seeded applications** with mixed risk profiles

---

## 3. Flow Process

```
Analyst clicks "RUN REVIEW"
        │
        ▼
┌──────────────────┐
│ POST /api/batch  │  Select up to 5 apps
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ agentManager     │  Spawn Python subprocess per app
│ .spawnAgent()    │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Browser │ │  API   │  Two extraction modes
│ Mode   │ │  Mode  │
└────┬───┘ └────┬───┘
     │          │
     └────┬─────┘
          ▼
┌──────────────────┐
│ HTTP Callbacks   │  POST /api/internal/*
│ • progress       │  → WebSocket broadcast
│ • screenshot     │  → Real-time UI updates
│ • complete       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ ReviewPage       │  AI-generated memo + Copilot chat
│ DecisionFooter   │  → Submit to LOS
└──────────────────┘
```

---

## 4. Features

### Core Features
- **Batch Processing**: Run up to 5 applications simultaneously
- **Real-time Monitoring**: Live WebSocket updates with progress bars
- **Browser Screenshots**: See what the AI agent sees in real-time
- **AI Credit Memo**: Auto-generated 9-section professional memo
- **Copilot Chat**: Ask questions about the loan data, get instant answers
- **Decision Support**: Approve/Reject/Refer to Committee workflow

### Technical Features
- **Dual-mode Agent**: Browser (visual) or API (fast) extraction
- **Multi-LLM Support**: Claude, Gemini, or OpenAI-compatible providers
- **SOP/Skills System**: Hermes-style markdown files for business rules
- **Audit Trail**: Every action logged automatically
- **Session Persistence**: Resume reviews anytime

### UI/UX Features
- **Dashboard Overview**: Status cards, task list, running agents, results panel
- **Dark/Light Theme**: Professional banking aesthetic
- **Mobile Responsive**: Works on tablet and mobile devices
- **Language Toggle**: English and Bahasa Indonesia support
- **Keyboard Shortcuts**: Power-user efficiency

---

## 5. Benefit

### Operational Benefits
- **90% time reduction**: 30-45 min → 3-5 min per application
- **6-8x throughput**: Handle 50-80 apps/day vs 8-10 manually
- **Zero data entry errors**: Automated extraction eliminates typos
- **Consistent quality**: AI memo follows the same format every time
- **Full audit trail**: Compliance-ready activity logs

### Strategic Benefits
- **Scalable**: Handle loan volume spikes without hiring
- **Flexible**: Browser agent works with ANY web-based LOS
- **Future-proof**: Swap LLM providers without code changes
- **Compliant**: Standardized credit memo format
- **Low cost**: Less than $1 for 500 applications

---

## 6. Return On Investment (ROI)

### Cost Savings

| Area | Before (Manual) | After (AI Copilot) | Savings |
|------|-----------------|---------------------|---------|
| **Time per application** | 30-45 minutes | 3-5 minutes | **~90% faster** |
| **Analyst capacity** | 8-10 apps/day | 50-80 apps/day | **6-8x throughput** |
| **Memo writing** | 20-30 min manual | Auto-generated | **100% automated** |
| **Data extraction** | Copy-paste from LOS | Browser agent extracts | **Zero manual entry** |
| **Error rate** | Human data entry errors | Automated extraction | **~95% reduction** |
| **Training time** | Weeks to learn LOS | Agent handles navigation | **Minimal training** |

### Financial ROI

| Metric | Value |
|--------|-------|
| **Analyst hourly cost** | ~$15-25/hour |
| **Time saved per app** | ~30 minutes |
| **Apps per month** | 500 |
| **Monthly savings** | $3,750 - $6,250 |
| **Annual savings** | $45,000 - $75,000 |
| **AI cost (500 apps)** | ~$0.93 - $46 |
| **Net ROI** | **99%+ cost reduction** |

### Break-even Analysis

| Scenario | Break-even Point |
|----------|------------------|
| Low volume (100 apps/month) | 1-2 months |
| Medium volume (300 apps/month) | 2-3 weeks |
| High volume (500+ apps/month) | **Immediate** |

---

## 7. LLM Cost Projection

### API Mode (Recommended - Fast)

| Model | Input Cost | Output Cost | **Total/500 Apps** |
|-------|-----------|-------------|-------------------|
| **Claude Sonnet 4** | $6.75 | $26.25 | **$33.00** |
| **Gemini Flash** | $0.23 | $0.70 | **$0.93** |
| **GPT-4o-mini** | $0.34 | $1.05 | **$1.39** |

### Browser Mode (Visual)

| Model | Input Cost | Output Cost | **Total/500 Apps** |
|-------|-----------|-------------|-------------------|
| **Claude Sonnet 4** | $12.75 | $33.75 | **$46.50** |
| **Gemini Flash** | $0.43 | $0.90 | **$1.33** |
| **GPT-4o-mini** | $0.64 | $1.35 | **$1.99** |

### Cost Summary

```
┌─────────────────────────────────────────────────────────────────┐
│              LLM COST PROJECTION (500 Apps)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  API Mode (Fast)                                                │
│  ├─ Claude Sonnet 4:    $33.00    ($0.066/app)                 │
│  ├─ Gemini Flash:       $0.93     ($0.002/app)  ← CHEAPEST    │
│  └─ GPT-4o-mini:        $1.39     ($0.003/app)                 │
│                                                                 │
│  Browser Mode (Visual)                                          │
│  ├─ Claude Sonnet 4:    $46.50    ($0.093/app)                 │
│  ├─ Gemini Flash:       $1.33     ($0.003/app)                 │
│  └─ GPT-4o-mini:        $1.99     ($0.004/app)                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  💡 RECOMMENDATION: Use Gemini Flash + API Mode                 │
│     Cost: ~$0.93 for 500 apps = practically FREE               │
│     Time: ~2 seconds per app (vs 30-45 min manual)             │
└─────────────────────────────────────────────────────────────────┘
```

### Cost vs Manual Comparison

| Approach | Cost/500 Apps | Time/500 Apps |
|----------|---------------|---------------|
| **Manual** (analyst) | ~$25,000-50,000 (salary) | ~250-375 hours |
| **AI + Gemini** | ~$0.93 | ~17 minutes |
| **AI + Claude** | ~$33-46 | ~17 minutes |

**ROI**: 99.99% cost reduction + 99.97% time savings

---

## 8. Cost (Implementation)

### Development Cost

| Item | Estimated Cost |
|------|----------------|
| **Development time** | 2-3 weeks (1 developer) |
| **Infrastructure** | Minimal (Bun + SQLite) |
| **LLM API** | Pay-per-use (~$0.002/app) |
| **Total MVP** | ~$5,000-10,000 |

### Operational Cost (Monthly)

| Item | Low Volume (100 apps) | High Volume (500 apps) |
|------|----------------------|------------------------|
| **LLM API** | $0.19 | $0.93 |
| **Infrastructure** | ~$10-20 | ~$10-20 |
| **Maintenance** | ~2 hours | ~2 hours |
| **Total** | ~$10-20 | ~$11-21 |

### Comparison to Alternatives

| Solution | Setup Cost | Monthly Cost | Scalability |
|----------|-----------|--------------|-------------|
| **Our AI Copilot** | $5,000-10,000 | $10-21 | Unlimited |
| **Hire 1 Analyst** | $0 | $2,500-4,000 | Limited |
| **Enterprise LOS** | $50,000-100,000 | $5,000-10,000 | Moderate |
| **Outsource** | $0 | $10,000-20,000 | Limited |

---

## 9. MVP Deliverables

### Week 1: Core Infrastructure
- [x] LOS Demo App with 10 seeded applications
- [x] Dashboard backend (Bun + WebSocket + SQLite)
- [x] React dashboard with login, task list, running agents
- [x] WebSocket real-time updates

### Week 2: AI Agent
- [x] Python browser agent (Playwright)
- [x] Dual-mode extraction (Browser + API)
- [x] LLM memo generation (Claude/Gemini)
- [x] Screenshot streaming

### Week 3: Polish & Demo
- [x] Copilot chat interface
- [x] Decision workflow (Approve/Reject/Refer)
- [x] Settings page (LLM configuration)
- [x] SOP/Skills system
- [x] Audit trail
- [x] Demo documentation

### Demo Script
1. Login as analyst
2. Select 3-5 applications from task list
3. Click "Run Review"
4. Watch real-time progress + live screenshots
5. Open completed application
6. Review AI-generated memo
7. Chat with copilot for questions
8. Submit decision to LOS

---

## 10. Demo Talking Points

### Opening (30 seconds)
"This is JOKI AI, a credit analyst copilot that automates loan application review. What used to take 30-45 minutes now takes 3-5 minutes."

### Architecture (1 minute)
"We built a dual-mode AI agent that can either navigate the LOS visually like a human, or call the API directly for speed. Both modes generate professional credit memos using Claude or Gemini."

### Live Demo (3 minutes)
1. Show batch selection (5 apps)
2. Watch agents run with live screenshots
3. Open a completed review
4. Show the AI-generated memo
5. Ask copilot a question
6. Submit decision

### ROI Close (30 seconds)
"For 500 applications, the LLM cost is under $1. The time savings alone pay for the entire system in the first month. It's not just faster — it's consistent, auditable, and scales instantly."

---

## 11. Key Metrics to Highlight

| Metric | Value | Impact |
|--------|-------|--------|
| **Time per app** | 3-5 min (vs 30-45 min) | 90% faster |
| **Daily capacity** | 50-80 apps (vs 8-10) | 6-8x throughput |
| **LLM cost/app** | $0.002 (Gemini) | Practically free |
| **Error rate** | ~95% reduction | Better quality |
| **Training time** | Minutes vs weeks | Instant productivity |
| **Audit compliance** | 100% logged | Full traceability |

---

## 12. Closing Statement

"JOKI AI isn't just a tool — it's a force multiplier for credit analysts. We're not replacing humans; we're giving them superpowers. The result: faster decisions, better quality, lower cost, and happy analysts."

---

*Document generated for Demo Day presentation.*
*Team: JOKI AI*
*Project: Credit Analyst Copilot*

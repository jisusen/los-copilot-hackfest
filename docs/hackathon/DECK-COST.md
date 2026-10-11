# JOKI AI — Cost Analysis

## Deployment Modes

| Mode | LLM Model | Data Extraction | Description |
|---|---|---|---|
| **A** | Gemini 3.1 Pro | Browser Agent | Premium — AI navigates LOS UI, extracts data via screenshots |
| **B** | Gemini 3.1 Pro | API Direct | Pro + API — same LLM, direct backend calls (no browser) |
| **C** | Gemini 2.5 Flash | Browser Agent | Budget — cheap LLM, AI navigates LOS UI |
| **D** | Gemini 2.5 Flash | API Direct | Cheapest — cheap LLM, direct backend calls |

---

## Per-Application Cost (5 Loan Applications)

| Component | Mode A | Mode B | Mode C | Mode D |
|---|---|---|---|---|
| Browse | $0.94 | — | $0.11 | — |
| Memo | $0.08 | $0.08 | $0.01 | $0.01 |
| Chat | $0.25 | $0.25 | $0.03 | $0.03 |
| **Total (5 apps)** | **$6.40** | **$1.65** | **$0.75** | **$0.20** |
| **Per App** | **$1.28** | **$0.33** | **$0.15** | **$0.04** |

---

## Scaling Projections

### Single Analyst — 300 Loans/Day

| Timeframe | Mode A | Mode B | Mode C | Mode D |
|---|---|---|---|---|
| Daily | $78 | $21 | $9 | $2 |
| Monthly (22 days) | $1,716 | $462 | $198 | $44 |
| Yearly (264 days) | $20,592 | $5,544 | $2,376 | $528 |

### 10 Analysts — 2,500 Loans/Day

| Timeframe | Mode A | Mode B | Mode C | Mode D |
|---|---|---|---|---|
| Daily | $650 | $175 | $75 | $20 |
| Monthly | $14,300 | $3,850 | $1,650 | $440 |
| Yearly | $171,600 | $46,200 | $19,800 | $5,280 |

---

## Cost Breakdown by Component

### Browser Agent Modes (A & C)
- **Browse: 73%** — Gemini navigates LOS UI, clicks buttons, extracts data from screenshots
- **Chat: 19%** — Copilot conversation with analyst
- **Memo: 8%** — Automated credit memo generation

### API Direct Modes (B & D)
- **Chat: 76%** — Copilot conversation dominates
- **Memo: 24%** — Automated credit memo generation
- **Browse: 0%** — No browser automation needed

---

## Key Takeaways

1. **Mode D is 32x cheaper** than Mode A — Flash + API is the sweet spot for production
2. **API Direct is 4x cheaper** than Browser Agent — skip browser if LOS has API access
3. **Flash is 8.5x cheaper** than Pro — sufficient for structured data extraction and memo generation
4. **Browse step is the cost driver** — 73% of spend in Browser Agent modes comes from navigation tokens
5. **At scale, LLM cost is negligible** — $0.04 per loan on Mode D vs $50-200 manual analyst time per loan

---

## Traditional vs AI-Assisted Cost Comparison

| Metric | Manual Process | JOKI AI (Mode D) | Savings |
|---|---|---|---|
| Time per loan | 45-90 min | 3-5 min | 90%+ |
| Analyst capacity | 8-10 loans/day | 300 loans/day | 30x |
| LLM cost per loan | — | $0.04 | — |
| Staff cost per loan | $15-25 | $0.50-1.00 | 95%+ |
| **10 analysts, 2,500 loans/day** | **$37,500-62,500/day** | **$20/day LLM** | **99.95%** |

> The $20/day LLM cost replaces $37,500-62,500/day in manual analyst labor for the same throughput.

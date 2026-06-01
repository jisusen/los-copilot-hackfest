# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **greenfield implementation** of a demo Loan Origination System (LOS) for Indonesian personal loans. The full spec lives in `PRD-demo-los.md`. The app is the "victim" system that Browser Use AI agents navigate autonomously during a hackfest demo — every UI element must have `data-testid` attributes for reliable agent extraction.

**Bank identity:** Bank Maju Bersama Gibran (BMB) — fictional, internal banking tool aesthetic.

## Tech Stack

- **Runtime:** Bun 1.1+ (package manager, bundler, HTTP server, SQLite)
- **Frontend:** React 18 + React Router v6 + Tailwind CSS v3
- **Backend:** Bun HTTP server (no Express)
- **Database:** SQLite via `bun:sqlite` (no external DB)
- **Language:** TypeScript (`.ts` backend, `.tsx` frontend)
- **Port:** 3001

## Commands

```bash
bun install             # Install dependencies
bun run dev             # Dev server with hot reload
bun run build           # Bundle client/main.tsx → dist/
bun run start           # Production server
bun run db:seed         # Seed 10 loan applications
bun run db:reset        # Drop + reseed database
```

## Architecture

The app is a full-stack monorepo: a Bun HTTP server that serves both the REST API and the bundled React SPA.

**Backend** (`server/`):
- `server/index.ts` — entry point; handles routing to `routes/auth.ts` and `routes/loans.ts`, serves static files from `dist/`
- `server/db/client.ts` — singleton `bun:sqlite` connection; DB file at `data/los.db`
- `server/db/schema.sql` — all `CREATE TABLE` DDL
- `server/db/seed.ts` — inserts 10 pre-defined loan applications (APP-001 through APP-010)

**Frontend** (`client/`):
- `client/main.tsx` → `client/App.tsx` (React Router setup)
- Three pages: `LoginPage` (`/login`), `LoanQueuePage` (`/loans`), `LoanDetailPage` (`/loans/:id`)
- `LoanDetailPage` has 7 tabs driven by `?tab=` query param (default: `profil-debitur`)
- `client/lib/api.ts` — fetch wrapper for all API calls
- `client/lib/auth.ts` — session helpers (localStorage-based, no real JWT)

**API endpoints:**
```
POST /api/auth/login        { username, password } → { user }
POST /api/auth/logout
GET  /api/auth/me
GET  /api/loans             → { loans[], total }
GET  /api/loans/:id         → { loan (all joined tables) }
POST /api/admin/seed        (dev only, reseeds DB)
```

**Hardcoded credentials:** `analyst01`, `analyst02`, `supervisor` — all password `bms2025`

## Visual Design

**Color palette (CSS vars):**
```css
--color-primary:       #1a3a5c   /* navy — header, sidebar, buttons */
--color-primary-light: #2d5a8e   /* hover states */
--color-accent:        #e8a020   /* amber — badges, highlights */
--color-bg:            #f4f6f8   /* page background */
--color-surface:       #ffffff   /* cards, panels */
--color-border:        #d1d9e0
--color-text:          #1f2d3d
--color-text-muted:    #6b7c93
--color-success:       #1a7f4b
--color-warning:       #c47d0e
--color-danger:        #b91c1c
```

**Fonts (Google Fonts):** `DM Sans` (display/headers), `IBM Plex Sans` (body), `IBM Plex Mono` (IDs, currency values)

**Layout:** Fixed sidebar (220px) + fixed topbar (56px) + scrollable content (max-width 1200px). Dense enterprise look — not a modern SaaS.

## data-testid Requirements

Every interactive and data element needs a `data-testid`. The agent relies on these for navigation and extraction. Key ones:

| Element | data-testid |
|---|---|
| Login inputs | `input-username`, `input-password`, `btn-login`, `error-message` |
| Loan queue | `loan-queue-table`, `loan-row-{APP-###}`, `loan-link-{APP-###}`, `search-input`, `filter-status`, `filter-product` |
| Detail header | `loan-detail-id`, `loan-detail-debtor-name`, `loan-detail-status`, `loan-detail-crde-badge` |
| Tab buttons | `tab-profil-debitur`, `tab-data-keuangan`, `tab-slik-ojk`, `tab-aml-fraud`, `tab-hasil-crde`, `tab-agunan`, `tab-permohonan-kredit` |
| Tab containers | `tab-content-{tab-name}` |
| All data fields | `field-{fieldName}` (wrapper) + `value-{fieldName}` (value span) |
| AML warning | `aml-warning-banner` (only rendered when flag exists) |
| CRDE rules | `crde-rules-list`, `crde-rule-{index}` |

**Field component pattern (use consistently):**
```tsx
<div data-testid="field-{fieldName}">
  <span className="field-label">{label}</span>
  <span className="field-value" data-testid="value-{fieldName}">{value}</span>
</div>
```

## Database Schema

Eight tables (full DDL in `server/db/schema.sql`):
- `loan_applications` — core record (id like `APP-001`, status, product_type, created_at)
- `debtors` — personal data (NIK, NPWP, employer, address)
- `financials` — income, DTI, obligations
- `slik_ojk` — credit bureau results (kolektibilitas, 24-month history)
- `aml_fraud` — AML/sanctions/PEP screening results
- `crde_results` — Credit Risk Decision Engine output (decision, score, rules fired)
- `collaterals` — collateral data (for KPR/KKB products)
- `sessions` — user sessions

Seed data: 10 applications mixing product types (KTA, KPR, KKB, Multiguna) and risk levels. APP-007/010 have HIGH risk / rejection. APP-008/010 have AML flags.

## Tab URL Pattern

```
/loans/APP-001                        → Profil Debitur (default)
/loans/APP-001?tab=data-keuangan
/loans/APP-001?tab=slik-ojk
/loans/APP-001?tab=aml-fraud
/loans/APP-001?tab=hasil-crde
/loans/APP-001?tab=agunan
/loans/APP-001?tab=permohonan-kredit
```

## Out of Scope (MVP)

Do not implement: real auth (bcrypt/JWT), file uploads, PDF generation, email, real SLIK/AML API calls, test suite, Docker, TypeScript strict mode. Keep it simple — this is a demo.

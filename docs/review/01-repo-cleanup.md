# Repo Cleanup — Applied Changes & Verified Evidence

> Scope: dead code, tracked junk, orphan assets, doc accuracy, and one runtime bug found during smoke testing.
> Method: import-graph reachability scan from `dashboard/client/main.tsx` (relative + `@/` alias + dynamic imports) cross-checked with exact-name greps; every deletion below was unreachable/unreferenced at scan time. All deletions are recoverable from git history.

## 1. Dead code removed — 32 files (~6,200 lines)

### Scratch / backup copies
| File | Lines |
|---|---|
| `dashboard/client/pages/DashboardPage_bkp.tsx` | 1,032 |
| `dashboard/client/pages/file.tsx` (scratch copy of the dashboard page) | 785 |
| `dashboard/client/App_tem.tsx` | 513 |
| `dashboard/client/index_bkp.html` | 249 |

### Superseded UI components (old iterations of the live UI)
`UnderwritingDashboard.tsx` (484) · `MemoViewer.tsx` (350) · `pages/Dashboard.tsx` (290) · `CreditMemo.tsx` (275) · `PrintMemoView.tsx` (254) · `LoanQueue.tsx` (228) · `AgentCard.tsx` (205) · `Layout.tsx` (203) · `ui.tsx` (201) · `ApplicationList.tsx` (154) · `ChatPanel.tsx` (145) · `ReviewCard.tsx` (129) · `UserMenu.tsx` (122) · `DecisionBar.tsx` (122) · `dashboard/AgentsPanel.tsx` (91) · `TabNav.tsx` (81) · `dashboard/AgentCard.tsx` (77) · `AgentGrid.tsx` (45) · `layout/MobileSidebar.tsx` (43) · `ThemeToggle.tsx` (37) · `dashboard/BadgeRisk.tsx` (20) · `dashboard/ProgressBar.tsx` (10) · `dashboard/StatusBadge.tsx` (9) · `layout/Footer.tsx` (0 — empty file)

### Orphan data / lib
`data/agents.tsx` · `data/hasilAnalisis.tsx` · `data/loadQueue.tsx` · `lib/auth.ts` (referenced only by the dead `Layout.tsx`)

**Kept on purpose:** `dashboard/client/global.d.ts` (not import-driven, tsconfig-included). Note the root app has its own **live** `client/components/TabNav.tsx` and `client/components/PrintMemoView.tsx` — the dashboard copies were the dead ones.

## 2. Tracked runtime junk untracked — 4 files (`git rm --cached`, files stay on disk)

| File | Why |
|---|---|
| `dashboard/dash-server.log`, `dash-server-err.log` | dev server logs (~7,300 lines) were committed; `*.log` was already gitignored |
| `data/los.db-shm`, `data/los.db-wal` | SQLite sidecar files (2.5 MB) snuck past `data/*.db` ignore rule before it existed |

## 3. Orphan binary assets removed — 8 files (~5.6 MB)

- `dashboard/img/`: `agent.json` (169 KB Lottie, orphaned), `login.png` (1.4 MB), `login2.png` (1.5 MB), `sidebar.png` (0.7 MB), `sidebar-rmv.png` (0.3 MB)
- `client/img/`: `sidebar.png` (1.7 MB), `logo-header.png`, `dashboard1.png`

All had zero exact-name references after §1 (the pairs `approve.png` / `reject.png` / `modal.webp` / `sidebar-2.webp` / `login3.webp` / `nologo*.png` are **still referenced** and were kept).

## 4. Data fix — `dashboard/skills/kta-juknis.md`

The file had **two stacked frontmatter blocks** (an artifact of commit `35e9cda`). The parser reads the first block only, so the UI showed `JuknisKTA` and the skill was effectively inactive while its own metadata said `active: true`. Repaired to a single clean frontmatter block with the full original metadata.

**Note:** current effective state is preserved (`active: false`). If the KTA juknis (and `crde-rules.md`, also inactive) should feed memo generation, toggle them on in **Settings → Skills**.

## 5. Runtime bug fixed (found during smoke test)

`dashboard/server/db/dashboardDb.ts` + `losClient.ts` defaulted `DB_PATH` to `dashboard/data/los.db` — a directory that does not exist. On a fresh clone **without** `dashboard/.env`, every DB call threw `SQLITE_CANTOPEN`, and several call-sites swallow errors (`catch {}` around audit/note writes), so a batch run *looked* fine while sessions, audits and memo persistence silently failed.

- Fix: default is now `../../../data/los.db` (absolute, cwd-independent → repo-root `data/`).
- Verified after fix: mock batch APP-003 → `/api/sessions/APP-003` returns the full session, `/api/audit` shows `BATCH_STARTED` + `AGENT_COMPLETED`, and the memo is persisted into the shared DB (`/api/loans/APP-003/notes` on the LOS side).

## 6. Docs refreshed

- **README.md** — fixed broken screenshot link (`capt/` → `docs/`), removed deleted `design/` dir from the structure, corrected tech stack (Tailwind, not "vanilla CSS"), added `dashboard/skills/`.
- **CLAUDE.md** — bank name (BMB → CIMB Niaga rebrand), port `3001`→`3333`, four pages incl. `/dashboard`, 10 tabs (incl. `data-summary`, `audit-log`, `notes`; default `data-summary`), credentials `analyst01–05 + supervisor`, tab `data-testid` list, skill active-toggle note, removed "Docker" from out-of-scope (Dockerfiles + Render deploy exist).

## 7. Verification performed

```bash
# dashboard (after deletions)
cd dashboard && bun run build && bunx tsc --noEmit     # build ✓, tsc clean ✓
# root LOS app
bun run build                                           # ✓
# live smoke (both servers booted)
bun run server/db/seed.ts --reset                       # 10 apps seeded
bun run server/index.ts            # :3333 — login ✓, /api/loans ✓, /main.js ✓
cd dashboard && bun run server/index.ts                 # :3003 — SPA ✓, assets ✓ (JS/CSS mime)
# mock batch end-to-end
POST /api/batch {appIds:["APP-003"],mock:true}          # → session 200, audit ✓, memo → LOS notes ✓
```

## 8. Remaining cleanup candidates (flagged, NOT applied)

1. **Unused dependency** — RESOLVED (follow-up pass): `@lottiefiles/react-lottie-player` removed from `dashboard/package.json` and the lockfile (it was for the deleted `agent.json`).
2. **Three overlapping build paths:** `dashboard/build.ts` (`build:js`), `bunx tailwindcss` (`build:css`), and a third raw `bun build client/main.tsx` in the chain — plus the server rebuilds everything at startup (`buildClient()`). Consolidate to one script.
3. **Deploy guides** — RESOLVED (follow-up pass): `deploy/vercel/`, `deploy/cloudflare/` and `dashboard/vercel.json` removed; `deploy/README.md` rewritten to state host requirements (long-running Bun process + persistent disk).
4. **jump-refs:** `dashboard/client/components/Layout.tsx` (removed) referenced `/img/sidebar-2.png`, which never existed — nothing to do now, but it shows old refs rot silently; a `grep /img/` CI check would catch it.
5. **i18n drift:** dashboard mixes hardcoded EN/ID strings (`DecisionFooter`, `CopilotChat` placeholders, `LoginPage`) while `lib/i18n.ts` holds translations for other screens.

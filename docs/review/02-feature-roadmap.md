# Feature Review & Improvement Roadmap — JOKI AI (Credit Analyst Copilot)

> Based on a full read of the codebase (dashboard server routes/services, Python agent, LOS demo, client pages).
> Prioritized: **P0 = correctness/trust issues to fix before the next demo**, **P1 = features that strengthen the product story**, **P2 = platform hardening**.

## Where the product stands today

| Layer | What exists |
|---|---|
| **LOS demo** (:3333) | 10 applications, 10 tabs (Data Summary → Notes & Memo), CRDE scoring, SLIK OJK + 24-month history, AML/fraud enrichment, human Approve/Reject/Cancel → `PATCH /api/loans/:id/status`, notes, audit log |
| **Dashboard** (:3003) | Batch Run Review (≤5 parallel agents), live progress + browser screenshots over WS, credit memo review (inline edit + print), Copilot chat grounded in extracted data, Skills editor (active toggle + juknis audit), LLM usage/cost tab, audit log viewer, Settings (Copilot LLM + Browsing LLM incl. Vertex, extraction mode, mock), EN/ID memos, onboarding tour |
| **Agent** (Python) | browser-use extraction from Data Summary (1 evaluate call) with 2 retries → API fallback, memo generation via LLM (EN/ID + policy/juknis skill injection), token usage reporting, separate screenshot-stream sidecar (max 5) |

## P0 — correctness / trust (fix first)

1. **Decision flow is half-wired.**
   - The live flow only **submits the memo** (`DecisionFooter` → `POST /api/decisions/:appId` → saved as LOS note + audit + WS broadcast). Final approval happens in the LOS app (by design).
   - But `ReviewPage` still contains a dead approve/reject path whose UI is commented out, and its `confirm()` posts `{decision}` to an endpoint that **requires `memo`** → guaranteed 400. The `decisions` table, `sessionStore.setDecision` and `saveDecision()` exist but are **unreachable** — `GET /api/decisions` can never return data.
   - Fix either way: (a) wire real decisions (see P1-1), or (b) delete the dead path + unused table/endpoints.
2. **Cost tracking is Gemini-only.** `getModelPricing()` (`dashboardDb.ts`) only knows Gemini SKUs; Anthropic/custom runs are recorded with **default Gemini Flash pricing** → wrong numbers in the Usage tab. Dashboard chat usage is only recorded on the Gemini path (`llmService.ts`); Anthropic/custom sections don't record. Add a per-provider pricing table (or mark unknown) and record usage on all providers (the agent already reports memo usage for all).
3. **Meta-commentary filter is heuristic and duplicated.** `filterStream`/`isMetaCommentary` (server `llmService.ts`) and `stripThinkingTags` (client `useChat.ts`) regex-drop "thinking-like" first lines — a legitimate answer starting with "Based on…", "Looking at…", "I'll…" **gets deleted mid-stream**. Prefer provider-native separation (Anthropic thinking blocks; `reasoning_content` is already handled for custom), keep tag-stripping as fallback only, and de-duplicate the two implementations.
4. **Silent persistence failures.** Many `try {} catch {}` blocks around audit/note writes meant a broken DB path hid every failure (see cleanup doc §5). Log loudly at minimum; for the demo path, surface an error in the UI when the memo fails to reach LOS.
5. **Cosmetic-but-visible demo stubs:** dashboard Sync button is a fake 5s spinner (`handleSync`), "Avg time 3:42" is a hardcoded stat (`DashboardPage.tsx`), and the mock agent replays a scripted step list even when real data is missing. Compute real values from `elapsedMs`/sessions or label them "sample".

## P1 — features that strengthen the story

1. **Decision write-back + maker-checker (closes the loop).** Roles exist (`analyst`/`supervisor` in LOS users) but the dashboard has one shared login. Add: submit recommendation (memo + decision) → supervisor approves → dashboard calls `PATCH /api/loans/:id/status` on LOS so the queue reflects it; mandatory reason when overriding CRDE. All the audit plumbing already exists.
2. **Field-level evidence (explainability — the killer feature for credit analysts).** During extraction, record per-field provenance (tab, selector, timestamp, screenshot ref) + confidence; in review, show "why this value" with a jump to the evidence. browser-use has this at extraction time; the screenshot streamer already provides the visual trail. Even a simple per-field tooltip ("read from Data Summary · fin-net · 12:03:44") would differentiate the demo.
3. **Memo versioning & diff.** Every regeneration/submission creates a new version (`memo_json` already stored in `loan_notes`); add a versions drawer with diff view and reuse the juknis-audit pattern for who changed what.
4. **Multi-product skills.** `PRODUCT_JUKINS`/`PRODUCT_POLICIES` map only `KTA` (`routes/skills.ts`); a KPR/KKB/Multiguna application falls back to the generic prompt. Ship juknis + policy stubs for the other three products and a product→skill mapping UI.
5. **Batch controls.** Cancel a running agent, retry a single app, show queue position/ETA, and make the 5-slot concurrency a setting (currently hardcoded client+server+screenshot sidecar).
6. **Chat persistence + citations.** Chat history resets on navigation (state only); store per-app threads and let answers cite memo sections / LOS fields ("see §3 Keuangan"), matching the grounded-data positioning.
7. **Settings self-test buttons.** "Test Copilot LLM" / "Test Browsing LLM" / "Ping LOS" (1-token / health-check calls) + a precedence hint (env vs `dashboard/.settings.json` vs UI). Current single `apiKey` + separate browse key logic (`resolveProviderApiKeys`) is easy to misconfigure for a live demo.
8. **Notes/memo round-trip polish.** The dashboard writes memos into the shared DB and the LOS Notes tab renders them — good; add print/PDF parity on the LOS side and a "copilot memo" badge distinguishing agent vs analyst notes (author_type exists).

## P2 — platform / hardening (post-hackfest)

- **Tests — currently zero.** Highest-value `bun test` targets: `parse_agent_result` / `normalize_extracted_data` / `los_loan_to_extracted` (fixture-driven), skills frontmatter parser + toggle, route validation (batch ≤5, notes), and the memo-JSON contract (9 keys).
- **CI:** typecheck + build + tests on push; both lockfiles are committed, so `bun install --frozen-lockfile` is ready.
- **Deploy story:** only Render (combined Dockerfile + `start.sh`) matches the real runtime. Vercel/Cloudflare guides removed in the follow-up pass; re-add `docker-compose.yml` for a local prod-like run (it was deleted in the earlier cleanup).
- **Auth for any non-local deploy:** dashboard auth check is commented out (`dashboard/server/index.ts`); `/api/internal/*` (agent callbacks) is unauthenticated; WS `upgrade()` accepts any path; CORS reflects any origin **with** `Allow-Credentials` — all fine for localhost demos, none fine publicly. Also move LOS demo creds out of code (`server/routes/auth.ts`).
- **Observability:** agent stdout is streamed to the server console but never stored — add a per-task run log (connections already push progress/screenshot/error over WS; persist them for post-run forensics).
- **Determinism:** LOS detail enrichment (`server/routes/loans.ts`) uses `Math.random()` for SLIK facility histories → the same loan returns different data per request (confusing during demos, fatal for tests). Seed the RNG with the app id.

## UI nits (observed during live review-page verification)

- **Score donut misaligned** (`ReviewPage.tsx`): the `823` number sits high in the ring and `/1000` clips the ring's bottom edge.
- **Sticky footer overlap:** memo section 08 scrolls under the sticky footer bar — the scroll container is missing bottom padding equal to the footer height.

## Quick wins (≤1 day each)

1. Delete the dead approve/reject UI + `confirm()` in `ReviewPage`, or point it at the real status endpoint with a confirm reason.
2. Pricing: add Anthropic/custom entries or render "—"; record chat usage on every provider.
3. Replace the fake sync + hardcoded "3:42" with real session-derived numbers.
4. `git rm` the unused `@lottiefiles` dependency; consolidate the triple build path into one script.
5. Toggle `kta-juknis.md` + `crde-rules.md` active in Settings → Skills if memos should include them (both are currently OFF; see cleanup doc §4).
6. Seed `Math.random()` in loan enrichment with the app id.

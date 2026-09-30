# FinPlan Guide Lite — Chatbot Integration

FinPlan Guide Lite (Expanded Edition) is a browser-local, model-free product-help chatbot for
FinPlan. It answers curated product questions, explains workflows, and offers navigation
shortcuts. It runs entirely in the browser: **no LLM, no embeddings, no backend route, no
database table, no external network calls, and no additional npm packages.**

Originally installed from the vendor patch "FinPlan Guide Lite — Expanded Edition"
(`FINPLAN_LIGHT_GUIDE_INSTALL.md`). That patch folder is no longer in the repository; the
installed code under `frontend/` is the source of truth.

---

## Where it appears

- Mounted once in the root layout `frontend/app/layout.tsx`, so it is available on every page of
  the app: the public site, login/register pages, and every Advisor Dashboard page (clients,
  groups, transactions, meetings, tasks, messages, documents, reports, portfolio, notifications,
  profile).
- A floating **FinPlan Guide** launcher sits at the bottom-right. On desktop it opens as a
  400px card; on mobile it opens as a full-height side sheet.
- The guide reads the current route to offer context-aware quick questions and to resolve
  client / group / meeting / task / document navigation actions.

## Files added (relative to `frontend/`)

| File | Purpose |
|------|---------|
| `components/assistant/FinPlanGuide.tsx` | Chat UI — launcher, panel, messages, quick chips, suggested follow-ups, action links |
| `components/assistant/index.ts` | Barrel export (`FinPlanGuide`) |
| `lib/assistant/types.ts` | Types for route context, knowledge entries, actions, and replies |
| `lib/assistant/knowledge.ts` | 93 curated help entries — the maintenance file |
| `lib/assistant/matcher.ts` | Normalization, fuzzy scoring, route context, follow-up memory |
| `lib/assistant/index.ts` | Barrel exports for the assistant library |

## File changed (relative to `frontend/`)

`app/layout.tsx` — imports `FinPlanGuide` from `@/components/assistant` and mounts
`<FinPlanGuide />` once in the root layout `<body>`, right after `{children}`.

> The original patch mounted the guide inside `app/advisor-dashboard/layout.tsx` instead, which
> limited it to Advisor Dashboard pages only. The single mount was moved to the root layout so
> the guide (which already ships knowledge for public pages such as Pricing, Tools, Goals,
> Login, and Contact) is reachable everywhere. It is mounted in exactly one place to avoid
> rendering two chat instances. To limit it to the Advisor Dashboard again, move the import and
> the `<FinPlanGuide />` line back into `app/advisor-dashboard/layout.tsx`.

## How it works

1. **Normalization** — queries are lowercased, accent-stripped, de-punctuated (possessives like
   `client's` become `client`), and mapped through synonyms (`customers` → `client`,
   `files` → `document`, `appointments` → `meeting`, `transection` → `transaction`,
   `go to` → `open`, …). Stop words are ignored during token matching.
2. **Deterministic intents first** — greetings (`hello`), thanks, current-page questions
   (`what page am i on?`), and small conversation memory (`tell me more`, `open it`) are handled
   before knowledge matching.
3. **Scored knowledge matching** — each entry scores on exact phrase, phrase containment, token
   overlap with typo tolerance (Levenshtein similarity), plus a boost when the entry targets the
   current route area. Results under the score threshold get a guidance fallback reply.
4. **Context-resolved actions** — actions declare required route keys (for example `clientId`)
   and are filtered by the current route; `:clientId` placeholders are replaced with ids parsed
   from paths such as `/advisor-dashboard/clients/17`.
5. **Context-aware quick questions** — the first chips change per page: client page, group page,
   public site, and advisor workspace each get their own starting questions.
6. **Follow-up memory** — the last matched entry is remembered for the open chat session, so
   `open it` navigates to the previous topic's shortcut and `tell me more` repeats its answer.
   This is still deterministic and browser-local; it is not an AI model.

## Local adjustments vs the original patch

The patch was installed as-is except for two small, validated improvements that make the
examples documented in the install guide resolve to the specific topic (before the adjustments,
chips such as "Open this client's documents" fell through to the generic Document Center entry):

1. `lib/assistant/matcher.ts` — `normalize()` strips possessive `'s` before punctuation is
   replaced, so `open this client's documents` matches the `client-documents` entry instead of
   the generic `documents` entry.
2. `lib/assistant/knowledge.ts` — keyword additions to seven entries so common phrasings hit
   the specific topic instead of the broader `clients` / `documents` / `tasks` entries:

   | Entry | Keyword added |
   |-------|---------------|
   | `move-client-household` | `move a client` |
   | `huf-group` | `belong to huf` |
   | `auto-household` | `household after client creation` |
   | `second-household-blocked` | `add this client to another family` |
   | `add-transaction` | `add a transaction` |
   | `new-task` | `create a task` |
   | `upload-document` | `upload documents` |

> The installed copies under `frontend/` are the source of truth for this feature. If the vendor
> patch is ever re-applied over `frontend/`, re-apply the two adjustments above afterward.

## Maintaining the guide

Most future updates only require editing `lib/assistant/knowledge.ts`. Each entry supports:

- `title` — topic name used in phrase scoring
- `keywords` — natural phrasings users may type
- `answer` — the curated explanation
- `actions` — optional navigation shortcuts with `route` and optional `requires` keys
- `contextAreas` — optional current-page boosts (for example only boost `client-goals` on client pages)
- `suggestions` — optional 1–4 follow-up questions offered after the reply

Useful rule: only add a route or feature to the knowledge file when it really exists in FinPlan.

## Privacy and behavior

- Read-only: the guide never creates, edits, moves, or deletes CRM or financial records.
- No external assistant calls: matching happens in the browser against curated content.
- Navigation buttons are normal Next.js links to regular FinPlan pages (which use the usual APIs).

## Validation performed

- `tsc --noEmit` — clean type check for the whole frontend (Next.js 15 / React 19 / TypeScript 6).
- `next lint --dir lib/assistant --dir components/assistant` — no warnings or errors.
- Matcher exercised standalone (compiled with `tsc` to CommonJS and run under Node):
  29 assertions covering route-context detection, greetings/thanks, product questions, typo
  tolerance (`transection history` → transaction history), context-resolved routes
  (`/advisor-dashboard/clients/17/documents`), follow-up memory (`open it` after
  `How do households work?`), unknown-query fallback, all quick-question chips, and knowledge
  integrity (93 entries, unique ids).
- All conversation examples from `FINPLAN_LIGHT_GUIDE_INSTALL.md` were verified, including the
  client-page and group-page examples.
- The running dev server was checked page by page: `/`, `/login`, `/advisor-dashboard`,
  `/pricing`, and `/tools/sip-calculator` each serve exactly one guide launcher instance.

## Try it

Run the frontend dev server, open any `/advisor-dashboard` page, and click the **FinPlan Guide**
button in the bottom-right corner. Suggested first messages:

- `hello`
- `How do I add a client?`
- `How do households work?` then `open it` (follow-up memory)
- From a client page: `open this client's documents`
- From a group page: `how do i move a client?`
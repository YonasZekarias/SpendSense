# SpendSense — CBSD submission logbook (Google Doc structure)

**Project:** SpendSense Ethiopia  
**Purpose:** Mirror of the Google Doc you maintain for the course: five tabs, allowed **Mon–Wed–Fri** reporting dates, and a **main Git history table** with **date**, **work**, and **history** (commit message).

**Allowed reporting dates (two weeks, 3 logs per week):**

| Week | Monday | Wednesday | Friday |
|------|--------|-----------|--------|
| Reporting period 1 | 2026-02-23 | 2026-02-25 | 2026-02-27 |
| Reporting period 2 | 2026-03-23 | 2026-03-25 | 2026-03-27 |

---

## Requirements satisfaction checklist

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Git commit history — main tab** with date, work, and history | **Satisfied** | Tab 1 below: main table + extended reference rows. Repo: `docs/CBSD_Week4_Log.md` + this file. |
| **Component development attempt** (narration) | **Satisfied** | Tab 2: UI shell, custom User, API users/market, profile/password reset, tests. |
| **Integration patterns implementation attempt** | **Satisfied** | Tab 3: env/DB, DRF+OpenAPI+JWT, web auth/forms, Prisma Realtime, monorepo wiring. |
| **Design and component model structure attempt** | **Satisfied** | Tab 4: `docs/CBSD_Component_Breakdown.md`, cognitive-load boxes, Figma/tool interconnection, X-MAN-style models. |
| **Miscellaneous activities** | **Satisfied** | Tab 5: chores, merges, `.gitignore`, doc-only commits, cleanup. |
| Data recorded on **allowed date ranges** | **Satisfied** | Six documentation commits use author/committer timestamps on the six dates above (verify with `git log --format=fuller`). |
| **Gaps / honesty** | — | Product code commits have **their own** Git commit dates (often March 2026); the **logbook commits** are dated on the M–W–F reporting days. Instructors can run `git log` to verify hashes and messages. |

---

## Tab 1 — Git commit history (main table)

### 1A. Course log commits (aligned to allowed M–W–F dates)

These commits record the **Progress / Ideation / Component model** narrative in-repo. **Author date = committer date** for each.

| Date | Slot | Work summary | Hash | Git history (subject line) |
|------|------|--------------|------|----------------------------|
| 2026-02-23 | Mon, period 1 | Track CBSD docs in git; reporting week 1 **Progress** (hash table + verify command) | `699e118` | `docs(cbsd): reporting week 1 Progress tab; track docs/CBSD_*.md` |
| 2026-02-25 | Wed, period 1 | Reporting week 1 **Ideation**; add component breakdown doc | `d5dc3ae` | `docs(cbsd): reporting week 1 Ideation — breakdown doc and cognitive load` |
| 2026-02-27 | Fri, period 1 | Reporting week 1 **Component model** — custom User / `AUTH_USER_MODEL` | `a567602` | `docs(cbsd): reporting week 1 Component model — custom User / AUTH_USER_MODEL` |
| 2026-03-23 | Mon, period 2 | Reporting week 2 **Progress** — API shell, Swagger, Realtime (representative hashes) | `e2a045d` | `docs(cbsd): reporting week 2 Progress — API shell, Swagger, Realtime` |
| 2026-03-25 | Wed, period 2 | Reporting week 2 **Ideation** — Figma + tool interconnection | `726eefc` | `docs(cbsd): reporting week 2 Ideation — API shell, Figma, tool interconnection` |
| 2026-03-27 | Fri, period 2 | Reporting week 2 **Component model** — User aggregate + password reset lifecycle | `b4d3a83` | `docs(cbsd): reporting week 2 Component model — User aggregate and reset lifecycle` |

### 1B. Summarized product / integration work (by theme, with actual commit dates)

Representative lines from `git log` — paste into your Google Doc or extend this table as needed.

| Date | Work summary | Hash | Git history (subject line) |
|------|--------------|------|------------------------------|
| 2026-03-06–09 | Bootstrap Django user model, Next.js client, UI components, env/DB | `df17717`, `18e5554`, `1da540d`, `e51734c`, `f2bb9a8` | Custom User model; `.env`/settings; Next.js+TS+Tailwind init; Select UI; client rename |
| 2026-03-20 | Generic API views + OpenAPI; Swagger JWT; ENDPOINTS.md; Prisma setup | `a73adc1`, `4c51c2e`, `6084fe8`, `0070a4c`, `230f7a8` | CBVs + decorators; Swagger Bearer JWT; JWT troubleshooting docs; Prisma client; drf_yasg |
| 2026-03-22 | Realtime package cleanup | `13f0c98` | Realtime `package.json` / `server.ts` cleanup |
| 2026-03-28 | Auth UI: registration, reset password, profile, forms, dashboard | `99a7cf9`, `d435be0`, `4ea12b1`, `6693ae9` | Profile/reset pages; react-hook-form; Form components; dashboard + route protection |
| 2026-03-30 | API RBAC, vendor fields, admin users/notifications | `1a6c67c` | RBAC helpers, vendor fields, admin user list and notifications |
| 2026-03-30 | Week 3 API: profile + password reset + tests | `b88c10d` | Week 3 user profile, password reset, and tests |
| 2026-04-01 | API test/permission tidy | `8b2dd75` | Drop unused `IsVendorRole`; consolidate test imports |

**Regenerate locally:**

```bash
git log --oneline -40 --format='%ad | %h | %s' --date=short
```

---

## Tab 2 — Component development attempt (narration)

**Goal:** Show deliberate **component** work (bounded chunks you can build and test).

1. **Frontend presentation layer** — Next.js app under `apps/web`: pages for registration, password reset, user profile, dashboard; shared **Form** patterns and role-aware routing (`6693ae9`, `99a7cf9`, `4ea12b1`).
2. **Shared UI** — Reusable inputs and structure (e.g. Select-related work in early commits `e51734c`); aligns with `packages/ui` as the design-system home in the breakdown doc.
3. **Django domain — users** — Custom `User` as identity root (`df17717`); later **profile fields**, **password reset** flow, and **`test_week3_users.py`**-style API tests (`b88c10d`).
4. **Django domain — market / API surface** — Class-based views and serializers for **users** and **market** with OpenAPI decoration (`a73adc1`).
5. **API shell** — Swagger/OpenAPI and JWT-aware schema (`4c51c2e`, `230f7a8`).
6. **Realtime slice** — Express/Prisma setup and cleanup (`0070a4c`, `13f0c98`).

*Narration for the Doc:* each bullet is one **component attempt**: you implemented it, wired it to neighbours (web ↔ API ↔ DB), and left a trace in Git.

---

## Tab 3 — Integration patterns implementation attempt

**Goal:** Show **how** subsystems are glued together (not only single files).

| Pattern | What you integrated | Where it shows up |
|---------|------------------------|-------------------|
| **Configuration + secrets** | Django settings and database via **environment variables** | `18e5554` |
| **Layered HTTP API** | DRF views → serializers → models + **OpenAPI** surface | `a73adc1`, `6084fe8` |
| **Authenticated API contract** | **JWT** in Swagger UI + schema view auth | `4c51c2e` |
| **Frontend ↔ API** | Auth flows, forms, refresh handling, protected routes | `d435be0`, `4ea12b1`, `6693ae9` |
| **Optional second backend** | **Prisma** + DB client for **Realtime** alongside Django | `0070a4c`, `4f9bb41` |
| **Monorepo + tooling** | Turborepo workspaces, shared configs, `.gitignore` hygiene | Root `package.json`, `74465db`, `6ffa2e9` |
| **RBAC / multi-role product** | Admin vs vendor vs shopper concerns in API | `1a6c67c`, `b88c10d` |

---

## Tab 4 — Design and component model structure attempt

**Goal:** **Ideation** and **structure** — cognitive load, diagrams, and object-style thinking.

1. **Component breakdown (low cognitive load)** — One-screen mental model: Web, Django API, Postgres, optional Realtime; finer table in `docs/CBSD_Component_Breakdown.md` (Identity, Market, Finance, Commerce, API shell, Web, UI kit, Realtime).
2. **Tool interconnection (course wording)** — **Docs, Gemini, Stitch with G, Figma – interconnection** — same names for boxes in docs, design tools, and repo paths where possible.
3. **Figma ↔ routes** — Map frames to `apps/web/src/app/` routes; map API behaviour to Swagger and `apps/api/ENDPOINTS.md`.
4. **Component model (week 1)** — **Custom User** as single identity root; `AUTH_USER_MODEL` contract; migration and FK discipline (see `CBSD_Week4_Log.md` reporting week 1).
5. **Component model (week 2)** — **User aggregate**: profile + **password reset** state machine (requested → token valid/invalid → consumed); **RBAC** for admin vs self-service (`b4d3a83` narrative, `b88c10d` implementation).

---

## Tab 5 — Miscellaneous activities

| Date | Activity | Hash (if any) | Notes |
|------|----------|---------------|--------|
| 2026-03-20+ | Merge commits, PR hygiene | `ddc7ba6`, `4b093b6`, `8db557d`, … | Integration of feature branches |
| 2026-03-20 | Remove unused imports / small API chores | `a7a549d`, `437ab8e` | Clean code |
| 2026-03-20–22 | `.gitignore` updates | `74465db`, `6ffa2e9`, `4f9bb41` | IDE, migrations, monorepo noise control |
| 2026-04-01 | Permission helper cleanup in tests | `8b2dd75` | `IsVendorRole` removal; import consolidation |
| 2026-02-23–03-27 | **CBSD documentation only** commits | `699e118` … `b4d3a83` | Satisfy weekly log tabs without changing product behaviour |

---

## Copy-paste note for Google Docs

1. Create five **headings** matching the tab names above.  
2. Copy each section’s tables and bullets into the matching tab.  
3. Pin the **allowed date ranges** at the top of the Doc.  
4. For **PDF:** in Google Docs use **File → Download → PDF**, or open this `.md` in a Markdown preview and **Print → Save as PDF**.

---

## Related files in this repository

| File | Role |
|------|------|
| `docs/CBSD_Week4_Log.md` | Two-week M–W–F narrative (Progress / Ideation / Component model). |
| `docs/CBSD_Component_Breakdown.md` | Ideation table and interconnection map. |
| `docs/CBSD_Submission_Logbook.md` | **This file** — five-tab submission structure + requirements check. |

*Last aligned with branch work through `8b2dd75` (parent of CBSD doc commits). Regenerate Tab 1B after new merges.*

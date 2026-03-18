# CBSD — Week 4 coursework (single deliverable)

SpendSense — component-based software development log. **One file** for the Google Doc mirror: **Progress**, **Ideation**, **Component model practice**, plus **process marks**.

**Allowed log rhythm:** three entries per week on **Mon–Wed–Fri**. This branch uses **2026-03-16 / 18 / 20** and **2026-03-23 / 25 / 27**.

---

## 2026-03-16 (Mon) — Progress tab — period 1

For each hash: tag as *component built*, *integration practice*, *design pattern*, or *refactoring / clean code*.

| Hash | Type | What changed |
|------|------|----------------|
| `df17717` | Component built | Django custom `User` as `AUTH_USER_MODEL`. |
| `18e5554` | Integration practice | Settings + `.env`; DB config from environment. |
| `1da540d` | Component built | Next.js + TypeScript + Tailwind app shell. |
| `e51734c` | Component built | Shared UI (e.g. Select and related pieces). |
| `f2bb9a8` | Refactoring / clean code | Client folder renamed to `spendsense-client`. |

Verify: `git log --until='2026-03-10' --oneline -12 --date=short`

**What counts (process marks):** system trials with component breakdown and ideation; independent design-pattern implementations; component-model test simulations; miscellaneous refactoring / clean-code improvements.

---

## 2026-03-18 (Wed) — Ideation tab — period 1

### Cognitive load (5–7 boxes)

One mental screen:

```text
[ Web (Next.js) ] ──REST/JWT──▶ [ Core API (Django) ] ──▶ [ PostgreSQL ]
        │                                      │
        └──────── optional ────────────────────┴──▶ [ Realtime (Express) + Prisma ]
```

### Component breakdown (maps to repo)

| Component | Responsibility | Primary location |
|-----------|----------------|------------------|
| **Identity & access** | Register, login, JWT, roles, password reset, profile, admin user ops | `apps/api/users/`, `apps/api/core_api/` |
| **Market intelligence** | Items, crowdsourced prices, moderation | `apps/api/market/` |
| **Personal finance** | Budgets, expenses, export | `apps/api/finance/` |
| **Commerce** | Vendors, listings, purchases | `apps/api/ecommerce/` |
| **API shell** | CORS, Swagger/OpenAPI, shared permissions | `apps/api/core_api/` |
| **Web presentation** | Pages, layouts, auth UI | `apps/web/src/` |
| **Shared UI kit** | Design-system components | `packages/ui/` |
| **Realtime gateway** | Socket server (optional) | `apps/realtime/` |

### Figma and connections

- Map Figma frames to routes under `apps/web/src/app/`.
- **Slide wording (interconnection):** **Docs, Gemini, Stitch with G, Figma – interconnection** — keep the same names in docs, design tools, and code paths so reviewers can follow slide → frame → folder.

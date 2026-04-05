# SpendSense — CBSD component breakdown (Ideation)

This document supports **CBSD “Clean Streak”** ideation: the system is split into **coarse components** (low cognitive load per box) that map to **real folders and apps** in this monorepo. It does not change runtime behaviour; it is **documentation only**.

---

## 1. System context (one screen in your head)

```text
[ Web client (Next.js) ] ──REST/JWT──▶ [ Core API (Django) ] ──▶ [ PostgreSQL ]
        │                                      │
        └──────── optional ────────────────────┴──▶ [ Realtime (Express) + Prisma ]
```

- **Shopper / vendor / admin** use the **web app** for most flows.
- **Django** owns auth, domain rules, and persistence for the main product.
- **Realtime** is an optional channel for live updates (separate process; same product).

---

## 2. Component breakdown (respecting cognitive load)

Each row is one **architectural unit** you can design, test, and reason about mostly on its own.

| Component | Responsibility | Primary location | Depends on |
|-----------|----------------|------------------|------------|
| **Identity & access** | Register, login, JWT, roles, password reset, profile (`/me`), admin user ops | `apps/api/users/`, `apps/api/core_api/` (settings, urls) | DB |
| **Market intelligence** | Items, crowdsourced prices, averages, moderation, trends/forecasts (as implemented) | `apps/api/market/` | DB, users |
| **Personal finance** | Budgets, categories, expenses, summaries, export | `apps/api/finance/` | DB, users |
| **Commerce** | Vendors, listings, recommendations, purchases, reviews | `apps/api/ecommerce/` | DB, users, market (items/prices as needed) |
| **API shell** | Routing, CORS, Swagger/OpenAPI, shared permissions | `apps/api/core_api/` | All mounted apps |
| **Web presentation** | Pages, layouts, auth UI, dashboard, forms | `apps/web/src/` | Django API |
| **Shared UI kit** | Reusable components (design system) | `packages/ui/` | — |
| **Cross-cutting utilities** | Logger, eslint/tailwind presets | `packages/logger/`, `packages/*-config/` | — |
| **Realtime gateway** | Socket server, DB adapter for live features | `apps/realtime/` | Optional DB |

**Design patterns in use (for Progress / “what counts” logs):** layered API (views → serializers → models), **RBAC** (`IsAdminRole`), **repository of components** = each Django app + web feature slice.

---

## 3. Interconnections (Docs / design / implementation)

| Artifact | Role |
|----------|------|
| **This doc** | Ideation: names boundaries and dependencies. |
| **Swagger** (`/swagger/`) | Live contract for Django endpoints. |
| **`apps/api/ENDPOINTS.md`** | Human-oriented quick reference. |
| **Figma** (your course artefact) | Screens and flows; map routes under `apps/web/src/app/` to frames. |
| **Prisma schema** (`apps/realtime/prisma/schema.prisma`) | Mirror/alternate data model for realtime side — keep **conceptually** aligned with Django domains (users, market, finance, ecommerce). |

---

## 4. Component model practice (deep-dive ideas)

Pick **one** per week for the “Component Model Practice” tab, tied to **this** repo:

1. **User aggregate** — `User` + `Vendor` + `Notification` + password reset flow (states: active, token validity).
2. **Market aggregate** — `Item` → `PriceSubmission` (lifecycle: pending → approved/rejected) → averages.
3. **Budget aggregate** — `Budget` → `BudgetCategory` → `Expense` (invariants: ownership, periods).
4. **Purchase flow** — `Transaction` / vendor listing / `VendorPrice` verification (e-commerce bounded context).

---

## 5. Honest “Progress tab” backfill (do not fake Git history)

Course requirement: log **real** commit hashes. If you did not keep a doc weekly, you may still **backfill the Google Doc** using **actual** history:

```bash
cd /path/to/SpendSense
git log --since="14 days ago" --pretty=format:"%h | %ad | %s" --date=short
```

Paste each line into your **Progress** tab and expand with 1–2 sentences (component built / integration / pattern). **Do not** run backdated commits to invent activity; instructors can verify `git log` and remotes.

Example lines from this repo’s recent history (replace with your machine’s output when you run the command):

- `8b2dd75` — chore: remove unused permission helper; tidy tests  
- `b88c10d` — feat: profile fields + password reset + Week 3 tests  
- `1a6c67c` — feat: RBAC, vendor profile, admin users/notifications  
- (merge commits and auth PRs as appropriate)

---

*SpendSense Ethiopia — CBSD ideation artefact. Keep in sync when you add major apps or routes.*

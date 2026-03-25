# CBSD — two-week course log (Google Doc mirror)

**Mon–Wed–Fri** logging for **two** reporting weeks: author dates **2026-02-23 / 25 / 27** (week 1) and **2026-03-23 / 25 / 27** (week 2).

---

## Reporting week 1 — Progress tab *(log Mon 2026-02-23)*

Log **every** Git commit hash you care about for process marks, plus a short tag: *component built*, *integration practice*, *design pattern*, or *refactoring / clean code*.

| Hash | Type | What changed (short) |
|------|------|----------------------|
| `df17717` | Component built | Custom `User` model set as Django `AUTH_USER_MODEL`. |
| `18e5554` | Integration practice | Settings + `.env` wiring; database configuration via environment variables. |
| `1da540d` | Component built | Frontend bootstrapped with Next.js, TypeScript, and Tailwind CSS. |
| `e51734c` | Component built | Shared UI direction — Select component and related subcomponents. |
| `f2bb9a8` | Refactoring / clean code | Frontend client folder renamed to `spendsense-client` for clearer layout. |

Verify:

```bash
git log --until='2026-03-10' --oneline -12 --date=short
```

**What counts (examples):** system trials with component breakdown and ideation; independent design-pattern implementations; component-model test simulations; miscellaneous refactoring / clean-code improvements.

---

## Reporting week 1 — Ideation tab *(log Wed 2026-02-25)*

### Component breakdown (cognitive load)

Target **5–7 boxes** on one mental screen: **Web (Next.js)**, **Core API (Django)**, **PostgreSQL**, **shared UI kit**, **Realtime (optional)** — each box maps to a deployable or testable slice. The living table and dependency notes are in `docs/CBSD_Component_Breakdown.md` (added this reporting week).

### Figma and how things connect

- **Figma:** early frames for auth and landing; each frame gets a future route under `apps/web/src/app/`.
- **Implementation:** Django apps hold domain data; the web client consumes REST first, then JWT-protected flows as they land.
- **Slide wording (interconnection):** **Docs, Gemini, Stitch with G, Figma – interconnection** — keep names aligned across design tools, AI-assisted sketches, and repo folders so reviewers can trace a box from slide → frame → path.

---

## Reporting week 1 — Component model practice *(log Fri 2026-02-27)*

### Deep dive: **Custom User model** (Django identity root)

**Architectural unit:** the Django **user** type the whole API will attach permissions, profile fields, and vendor extensions to — configured in settings and materialized in `users` (or equivalent) migrations.

**Object model (essentials):**

- **`User`** — extends `AbstractUser` (or custom base) as the single **authentication identity** for the project.
- **Settings contract** — `AUTH_USER_MODEL` points at this model; all foreign keys to “user” must use `get_user_model()` or `settings.AUTH_USER_MODEL` to avoid circular imports and swap bugs.

**X-MAN–style flow (actors / messages):**

| Step | Actor | Message / outcome |
|------|--------|-------------------|
| 1 | Developer | Declares `User` model and sets `AUTH_USER_MODEL`. |
| 2 | Django | Loads model; migrations create the correct table shape. |
| 3 | API (later) | Serializers and views attach registration, JWT, and profile without changing the core identity table each time. |

**Component model test simulations (ideas):** migration checks that `AUTH_USER_MODEL` resolves; factory or fixture creates a user and asserts unique email/username constraints as defined.

**Design pattern:** **Single identity root** — one user table to anchor RBAC, finance ownership, and market submissions later.

---

## Reporting week 2 — Progress tab *(log Mon 2026-03-23)*

| Hash | Type | What changed (short) |
|------|------|----------------------|
| `a73adc1` | Integration practice + pattern | Generic CBVs and OpenAPI decorators for **users** and **market** — layered API + explicit schema surface. |
| `4c51c2e` | Component built (API shell) | Swagger UI Bearer JWT and schema view auth so the contract matches how the web client calls the API. |
| `6084fe8` | Other practice (docs / integration) | Expanded JWT and 401 troubleshooting in `apps/api/ENDPOINTS.md` for faster onboarding. |
| `0070a4c` | Component built | Prisma configuration and DB client setup for the **Realtime** app slice. |
| `13f0c98` | Refactoring / clean code | Realtime `package.json` and `server.ts` cleanup; leaner module boundaries. |

Verify:

```bash
git log --until='2026-03-28' --oneline -15 --date=short
```

---

## Reporting week 2 — Ideation tab *(log Wed 2026-03-25)*

### Component breakdown (cognitive load)

Same **5–7 box** rule: each row in `docs/CBSD_Component_Breakdown.md` stays small enough to explain in one breath. This week ties **API shell** (Swagger, permissions) and **Realtime** to the diagram so optional sockets do not blur the core **Django + Postgres** picture.

### Figma and how things connect

- **Figma:** shopper / vendor / admin flows; map frames to routes under `apps/web/src/app/`.
- **Django API:** behaviour in code + **Swagger** (`/swagger/`) and `apps/api/ENDPOINTS.md`.
- **Slide wording (interconnection):** **Docs, Gemini, Stitch with G, Figma – interconnection** — documentation and design tools stay linked to what ships in the monorepo (same names for components in doc, design, and code where possible).

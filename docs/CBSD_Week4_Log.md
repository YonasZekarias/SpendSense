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

# Week 1 — Create pull requests

All Week 1 branches are pushed. Create a PR for each branch from the links below (or open the repo on GitHub and use "Compare & pull request" for each branch).

**Suggested merge order** (so dependencies are in place):

1. **week1/user-model-auth** — User model (AbstractBaseUser) + JWT auth  
   https://github.com/YonasZekarias/SpendSense/pull/new/week1/user-model-auth

2. **week1/user-api** — Register, GET/PATCH me (depends on 1)  
   https://github.com/YonasZekarias/SpendSense/pull/new/week1/user-api

3. **week1/market-items** — GET /api/market/items/ (no auth)  
   https://github.com/YonasZekarias/SpendSense/pull/new/week1/market-items

4. **week1/price-submission** — PriceSubmission + POST submit (depends on 1–2)  
   https://github.com/YonasZekarias/SpendSense/pull/new/week1/price-submission

5. **week1/market-averages** — GET /api/market/prices/averages/ (depends on 4)  
   https://github.com/YonasZekarias/SpendSense/pull/new/week1/market-averages

6. **week1/migrations-seed-docs** — Backend README + seed_items command (depends on 5)  
   https://github.com/YonasZekarias/SpendSense/pull/new/week1/migrations-seed-docs

---

To create the PRs with GitHub CLI (if installed):

```bash
gh pr create --base main --head week1/user-model-auth --title "Week 1: user-model-auth" --body "User model (AbstractBaseUser) + JWT auth with email"
gh pr create --base main --head week1/user-api --title "Week 1: user-api" --body "Register, GET/PATCH me"
gh pr create --base main --head week1/market-items --title "Week 1: market-items" --body "GET /api/market/items/"
gh pr create --base main --head week1/price-submission --title "Week 1: price-submission" --body "PriceSubmission + POST submit"
gh pr create --base main --head week1/market-averages --title "Week 1: market-averages" --body "GET /api/market/prices/averages/"
gh pr create --base main --head week1/migrations-seed-docs --title "Week 1: migrations-seed-docs" --body "Backend README + seed_items command"
```

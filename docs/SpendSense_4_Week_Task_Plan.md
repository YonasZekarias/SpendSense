# SpendSense Ethiopia — 4-Week Task Plan

**Based on SRS: Cost of Living Tracker, Budget Assistant & Smart Shopping Platform**

This plan divides implementation into **4 weeks**, assuming the SRS and high-level design are done and the repo (Django + Next.js + Express) is initialized.

---

## Week 1 — Backend foundation: Auth, users, market core

**Goal:** Secure authentication, user management, and basic market (items + price submission + aggregation).

### 1.1 User & identity (Django)

- [ ] **User model**  
  Ensure custom User (e.g. `users.User`) supports auth: either extend `AbstractBaseUser` with `USERNAME_FIELD = 'email'` and hashing, or keep current model and implement custom JWT auth (email/phone + password).

- [ ] **Auth API**  
  - `POST /api/auth/token/` — login (return access + refresh).  
  - `POST /api/auth/token/refresh/` — refresh access token.  
  Use SimpleJWT or custom view that validates against your User model.

- [ ] **User API**  
  - `POST /api/users/register/` — register (full_name, email/phone, password, household_size, income_bracket, role).  
  - `GET /api/users/me/` — current user profile.  
  - `PATCH /api/users/me/` — update profile (income, household_size, location, notification_preferences).  
  Apply RBAC: only own profile for non-admin.

- [ ] **CORS & env**  
  CORS allowed origins for frontend (e.g. `localhost:3000`). SECRET_KEY, DEBUG, DB, JWT and CORS from env.

### 1.2 Market — items and price submission

- [ ] **Items**  
  - `GET /api/market/items/` — list tracked items (name, category, unit).  
  Seed or admin-created items (e.g. Teff, Oil, etc.).

- [ ] **Price submission**  
  - `POST /api/market/prices/submit/` — body: item_id (or name), unit, category, price_value, market_location, city, date_observed.  
  Validate required fields and numeric ranges; store with status `pending` and user_id.  
  Optional: basic outlier flag (e.g. vs existing average) and return warning.

- [ ] **Averages (basic)**  
  - `GET /api/market/prices/averages/` — query by item_id, city, date range; return aggregated (e.g. national/city) from approved submissions only (this week: approve manually or auto-approve for dev).

### 1.3 Database and DevOps

- [ ] Migrations for `users`, `market`, `finance`, `ecommerce` (as per existing models).  
- [ ] Seed script or admin UI to create initial **Items** and optionally test user/vendor.  
- [ ] Document how to run backend (venv, `.env`, `manage.py runserver`).

**Deliverables:** Login, register, profile, submit price, list items, get averages. Frontend can start integrating in Week 3.

---

## Week 2 — Backend: Market (moderation, trends), finance, e-commerce core

**Goal:** Admin price moderation, price trends/forecasts (stub or simple), budgets and expenses, vendors and recommendations.

### 2.1 Market — moderation and trends

- [ ] **Admin moderation**  
  - `GET /api/market/admin/submissions/` — list pending (admin only).  
  - `POST .../approve/`, `POST .../reject/`, `PATCH .../` to edit then approve.  
  Update submission status; approved data included in aggregation.

- [ ] **Trends and forecasts**  
  - `GET /api/market/trends/` — historical series by item/city/date range (from approved prices).  
  - `GET /api/market/forecasts/` — 1–4 week forecasts: stub (e.g. last known price) or simple rule; later replace with SARIMA (Week 4 or post-MVP).  
  - `GET /api/market/inflation/` — weekly/monthly indicator (e.g. % change vs previous period).

### 2.2 Finance

- [ ] **Budgets**  
  - `GET/POST /api/finance/budgets/` — list and create (month, year, total_limit, categories with limit_amount).  
  - `GET/PATCH/DELETE /api/finance/budgets/<id>/`.  
  - `GET /api/finance/budgets/suggestions/` — suggestions by income/household (can use national averages from market).

- [ ] **Expenses**  
  - `GET/POST /api/finance/expenses/` — list and create (category, amount, date, description, optional item_id, vendor_id).  
  - `GET/PATCH/DELETE /api/finance/expenses/<id>/`.  
  Filter by budget, category, date range.

- [ ] **Summary and export**  
  - `GET /api/finance/budgets/<id>/summary/` — spent vs planned per category; percentages (80%/100% flags for alerts).  
  - `GET /api/finance/export/?format=pdf|csv&month=&year=` — generate PDF/CSV (use a library; can be minimal at first).

### 2.3 E-commerce — vendors and recommendations

- [ ] **Vendors**  
  - `POST /api/ecommerce/vendors/` — vendor registration (shop_name, city, address, contact, lat/long); role Vendor.  
  - `GET /api/ecommerce/vendors/<id>/` — public profile.  
  - `GET/POST /api/ecommerce/vendors/<id>/listings/` — list and add/update item price and availability (vendor or admin).

- [ ] **Recommendations**  
  - `GET /api/ecommerce/recommendations/?item_id=&city=&latitude=&longitude=` — rank vendors by price vs average, reliability (e.g. rating), and distance (optional). Return list with price, distance, rating.

- [ ] **Purchases (no payment yet)**  
  - `POST /api/ecommerce/purchases/` — create purchase (vendor_id, listing_id, quantity); return `purchase_id`, `amount`; status `pending`.  
  - `GET /api/ecommerce/purchases/` and `GET .../<id>/` — list and detail for current user.

- [ ] **Reviews**  
  - `POST /api/ecommerce/vendors/<id>/reviews/` — rating + comment; recalc vendor rating.  
  - `GET /api/ecommerce/vendors/<id>/reviews/` — list reviews.

### 2.4 Admin — users and vendors

- [ ] `GET /api/users/admin/users/` — list users (admin).  
- [ ] `PATCH /api/users/admin/users/<id>/` — deactivate/activate.  
- [ ] `GET /api/ecommerce/admin/vendors/` — list vendors; `POST .../<id>/verify/` — verify vendor.

**Deliverables:** Full market (submit, moderate, trends, forecasts stub), budgets and expenses, vendor listings, recommendations, purchases (no gateway), reviews. Admin can moderate and verify.

---

## Week 3 — Frontend: Pages and API integration

**Goal:** All main user and vendor pages implemented and wired to the backend; basic real-time connection.

### 3.1 Auth and layout

- [ ] **Login** (`/login`) and **Register** (`/register`) — forms, call auth and user APIs; store token; redirect to dashboard or onboarding.  
- [ ] **Onboarding** (`/onboarding`) — location and alert preferences; then redirect to dashboard.  
- [ ] **Layout** — header with nav (Dashboard, Price Trends, Budget, Shop, Alerts), profile menu (Profile, Export, Logout).  
- [ ] **Role-based nav** — show Vendor/Admin links when applicable.  
- [ ] **Protected routes** — redirect unauthenticated users to login.

### 3.2 User pages

- [ ] **Dashboard** (`/dashboard`) — fetch budgets summary, recent expenses, price highlights, alerts; display cards and small charts (Recharts).  
- [ ] **Price Trends** (`/market/trends`) — filters (item, city, date range); call trends and forecasts APIs; line/bar charts.  
- [ ] **Submit Price** (`/market/submit`) — form → POST to price submission API; show success/validation errors.  
- [ ] **Budget Planner** (`/finance/budget`) — load suggestions; create/edit budget; category limits.  
- [ ] **Budget Overview** (`/finance/overview`) — budget vs actual charts and progress bars.  
- [ ] **Log Expense** (`/finance/expense`) — form (amount, category, date, description); POST expense.  
- [ ] **Expense list** (`/finance/expenses`) — list with filters.  
- [ ] **Smart Shopping** (`/shop`) — search item; call recommendations API; list vendors with price, distance, rating.  
- [ ] **Vendor detail** (`/shop/vendor/[id]`) — listings and reviews; “Add to cart” / “Proceed to payment”.  
- [ ] **Checkout** (`/shop/checkout`) — confirm order; call purchase API; redirect to payment URL when integrated (Week 4).  
- [ ] **My Purchases** (`/shop/orders`) — list purchases and status.  
- [ ] **Review Vendor** (`/shop/orders/[id]/review`) — rating and comment form.  
- [ ] **Alerts** — page or dropdown listing alerts (from API or WebSocket).  
- [ ] **Export** (`/finance/export`) — month/year and format; trigger download from export API.  
- [ ] **Profile** (`/profile`) — get/patch profile.

### 3.3 Vendor and admin pages

- [ ] **Vendor dashboard** (`/vendor/dashboard`) — summary and recent orders.  
- [ ] **Vendor listings** (`/vendor/listings`) — CRUD for vendor’s item prices and availability.  
- [ ] **Admin dashboard** (`/admin/dashboard`) — counts (users, vendors, pending submissions).  
- [ ] **Price moderation** (`/admin/moderate/prices`) — list pending; approve/reject/edit.  
- [ ] **Manage users** (`/admin/users`) — list; activate/deactivate.  
- [ ] **Manage vendors** (`/admin/vendors`) — list; verify.

### 3.4 Real-time (basic)

- [ ] **Express + Socket.io** — server running; auth with JWT.  
- [ ] **Frontend** — connect Socket.io client after login; send `authenticate` with token.  
- [ ] **Listen** for `budget_warning`, `price_spike_alert` (backend can emit test events); show toast or badge.

**Deliverables:** Full user flow (register → dashboard → trends, budget, expense, shop, alerts, export), vendor and admin UIs, basic WebSocket connection.

---

## Week 4 — Payments, real-time alerts, ML stub, testing, deploy prep

**Goal:** Payment gateway integration, delivery tracking (real-time), SARIMA stub or simple forecast, testing, and deployment readiness.

### 4.1 Payment and delivery

- [ ] **Chapa or Telebirr** — integrate gateway (redirect or embed): create payment from purchase, handle return URL and webhook; on success update purchase status and create expense (FR-25, FR-26).  
- [ ] **Checkout** — after POST purchase, redirect user to `payment_url`; on return show success/failure and update “My Purchases”.  
- [ ] **Delivery tracking** — purchase has status (e.g. pending, paid, shipped, delivered). Express endpoint or Socket event for status updates; frontend subscribes to `delivery_update` for a purchase and shows status on order detail.

### 4.2 Alerts and notifications

- [ ] **Backend triggers** — when budget category or total hits 80% or 100%, emit `budget_warning` via Express. When price spike detected (e.g. vs threshold), emit `price_spike_alert`. Optional: `vendor_deal` when vendor price is below average.  
- [ ] **Frontend** — handle all event types; show in Alerts page and toasts; optional sound for critical alerts.

### 4.3 ML and forecasts (proof of concept)

- [ ] **SARIMA pipeline (optional)** — script or Django command: load historical approved prices for an item, fit SARIMA (or simple fallback), save forecast to DB. Run on schedule or manually.  
- [ ] **Forecasts API** — `GET /api/market/forecasts/` reads from DB; if no model yet, return stub or last-known price.  
- [ ] **Admin** — page or command to trigger retrain and view last run status (FR-37).

### 4.4 Admin and config

- [ ] **System settings** (`/admin/settings`) — configure item categories, acceptable price ranges, alert thresholds (store in DB or config); use in validation and alert logic (FR-38).  
- [ ] **Admin audit** — log admin actions (moderation, verify vendor, deactivate user) for accountability.

### 4.5 Testing and quality

- [ ] **API tests** — Django REST: auth, users, market submit/moderation, finance, ecommerce (purchase, review).  
- [ ] **E2E (optional)** — one flow: register → login → create budget → log expense → view dashboard (e.g. Playwright/Cypress).  
- [ ] **Bug fixing** — prioritize login, payment, and budget/expense accuracy.

### 4.6 Deployment preparation

- [ ] **Environment** — production `.env.example`; no secrets in repo.  
- [ ] **Backend** — run with gunicorn; static files and DB migrations documented.  
- [ ] **Frontend** — build and env for API base URL and WebSocket URL.  
- [ ] **Real-time server** — run in production (e.g. process manager).  
- [ ] **Deploy** — optional: deploy Django + Express + Next.js to a cloud provider (e.g. Render, Railway, or VPS); PostgreSQL (e.g. managed DB).  
- [ ] **Docs** — link Backend API doc and Frontend Pages/Flow doc in README; add 4-Week Task Plan to repo.

**Deliverables:** Payment and delivery flow working; real-time alerts; ML forecast stub or simple model; admin settings; tests and fixes; deployment-ready setup and docs.

---

## Summary by week

| Week | Focus | Main deliverables |
|------|--------|-------------------|
| **1** | Auth, users, market core | Login/register, profile, items, price submit, averages |
| **2** | Market full, finance, e-commerce | Moderation, trends, forecasts stub, budgets, expenses, vendors, recommendations, purchases, reviews, admin user/vendor |
| **3** | Frontend | All user/vendor/admin pages, API integration, basic WebSocket |
| **4** | Payments, real-time, ML, release | Chapa/Telebirr, delivery tracking, alerts, SARIMA stub, tests, deploy prep |

---

## Notes

- **Order of tasks** within a week can be parallelized (e.g. one dev on auth, another on market).  
- **SARIMA** can stay as a stub (return last price or simple trend) if data is insufficient; focus on data aggregation and API first.  
- **Payment** — ensure webhook signature verification and idempotency for payment confirmation.  
- Keep **Backend API Doc** and **Frontend Pages and Flow** in sync as you add or change endpoints and pages.

*Document derived from SpendSense Ethiopia SRS. Adjust dates and assignees as needed.*

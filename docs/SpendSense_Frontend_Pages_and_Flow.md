# SpendSense Ethiopia — Frontend Pages and User Flow

**Based on SRS: Cost of Living Tracker, Budget Assistant & Smart Shopping Platform**

---

## 1. Overview

The frontend is a **Next.js** responsive web application. It serves three roles: **User (Shopper)**, **Vendor**, and **Admin**. Pages and flows below are derived from the SRS functional requirements and scenarios.

---

## 2. Technology Stack

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **Charts / Data viz:** Recharts
- **Communication:** REST API (Django), WebSocket (Socket.io for real-time alerts)
- **Auth:** JWT stored (e.g. in memory or httpOnly cookie); token in `Authorization` header

---

## 3. Page Inventory

### 3.1 Public (unauthenticated)

| Page | Route (suggestion) | Description |
|------|--------------------|-------------|
| Home / Landing | `/` | Value proposition, login/register CTAs, brief feature overview. |
| Login | `/login` | Email/phone + password; redirect to dashboard on success. |
| Register | `/register` | Full name, email or phone, password, household size, income bracket; then onboarding. |
| Price Trends (public view) | `/prices` or `/market/trends` | National/city price trends and inflation summary (read-only, no personalization). |

### 3.2 Onboarding (first-time after register)

| Page | Route | Description |
|------|--------|-------------|
| Onboarding | `/onboarding` | Set location (city), enable price and budget alerts; then redirect to dashboard. |

### 3.3 User (Shopper) — Authenticated

| Page | Route | Description |
|------|--------|-------------|
| Dashboard | `/dashboard` | Summary: budget progress, recent expenses, price trends, alerts, vendor deals (FR-32). |
| Price Trends (full) | `/market/trends` | Historical + forecast charts; filters: time range, category, region (FR-13, UC-04). |
| Submit Price | `/market/submit` | Form: item, unit, price, market, date; submit for crowdsourcing (UC-05). |
| Budget Planner | `/budget` or `/finance/budget` | Create/edit monthly budget; category limits; suggestions (FR-15, FR-16, UC-07). |
| Budget Overview | `/finance/overview` | Charts: spending by category, progress bars, vs budget (FR-18, Scenario 9). |
| Log Expense | `/finance/expense` | Quick form: amount, category, date, description (FR-17, UC-08). |
| Expense History | `/finance/expenses` | List/filter expenses; link to budget. |
| Smart Shopping | `/shop` or `/ecommerce` | Search item; view ranked vendors (price, reliability, distance) (UC-12). |
| Vendor Detail | `/shop/vendor/[id]` | Vendor info, listings, reviews; “Proceed to payment”. |
| Checkout / Payment | `/shop/checkout` | Confirm order; redirect to Chapa/Telebirr (UC-13). |
| My Purchases | `/shop/orders` | List purchases; status; delivery tracking link. |
| Review Vendor | `/shop/orders/[id]/review` | After purchase: rating + comment (UC-14). |
| Alerts / Notifications | `/alerts` or in-dashboard | List price-spike, budget, vendor-deal alerts (FR-28–FR-31). |
| Export Report | `/finance/export` | Choose month, format (PDF/CSV); download (FR-34, Scenario 16). |
| Profile | `/profile` | View/edit profile: income, household size, location, notification preferences (FR-03). |

### 3.4 Vendor — Authenticated

| Page | Route | Description |
|------|--------|-------------|
| Vendor Dashboard | `/vendor/dashboard` | Sales summary, pending orders, recent reviews. |
| Vendor Listings | `/vendor/listings` | Add/edit item prices and availability (FR-21, Scenario 13). |
| Vendor Profile | `/vendor/profile` | Shop name, address, contact, location. |
| Vendor Orders | `/vendor/orders` | Orders to fulfill; update status. |

### 3.5 Admin — Authenticated

| Page | Route | Description |
|------|--------|-------------|
| Admin Dashboard | `/admin/dashboard` | System stats: users, vendors, price submissions (FR-35). |
| Price Moderation | `/admin/moderate/prices` | Queue of pending submissions; approve/reject/edit (FR-07, UC-06). |
| Manage Users | `/admin/users` | List users; activate/deactivate (FR-36). |
| Manage Vendors | `/admin/vendors` | List vendors; verify/reject (FR-36, Scenario 15). |
| System Settings | `/admin/settings` | Item categories, price ranges, alert thresholds, ML config (FR-38). |
| ML / Forecasts | `/admin/ml` | Monitor pipelines, retrain, view accuracy (FR-37). |

### 3.6 Shared

| Page | Route | Description |
|------|--------|-------------|
| Logout | — | Clear tokens; redirect to `/` or `/login`. |
| 404 | — | Not found page. |
| Error | — | Generic error boundary page. |

---

## 4. User Flows (Key Scenarios)

### 4.1 Registration and first login (Scenario 1, 2)

1. User opens **Home** → clicks **Create Account**.
2. **Register** page: full name, email or phone, password, household size, income bracket → Submit.
3. Backend creates account; frontend receives tokens (or session).
4. Redirect to **Onboarding**: set location, enable alerts → Submit.
5. Redirect to **Dashboard** (first-time view).

### 4.2 Login and dashboard (Scenario 2)

1. User opens **Login** → email/phone + password → Submit.
2. Backend returns JWT pair; frontend stores access token.
3. Redirect to **Dashboard**.
4. Dashboard loads: budget progress, recent expenses, national averages, alerts, vendor deals (via REST + optional WebSocket).

### 4.3 View price trends (Scenario 3, UC-04)

1. From **Dashboard** or nav, user opens **Price Trends**.
2. Frontend requests trends (and optionally forecasts) from `/api/market/trends/`, `/api/market/forecasts/`.
3. Page shows charts (e.g. Recharts); user can filter by time range, item category, region.
4. If no data for filter → show notice (alternative flow 5A).

### 4.4 Submit price (crowdsourcing) (Scenario 4, UC-05)

1. User opens **Submit Price**.
2. Form: select or type item, unit, price, market name, city, date → Submit.
3. Frontend POSTs to `/api/market/prices/submit/`.
4. If validation or outlier warning → show message; user may confirm or correct.
5. On success → submission saved as “Pending”; show confirmation.

### 4.5 Create monthly budget (Scenario 7, UC-07)

1. User opens **Budget Planner**.
2. Frontend fetches suggestions from `/api/finance/budgets/suggestions/` (month, year).
3. User sets total and per-category limits (or accepts suggestions) → Save.
4. POST to `/api/finance/budgets/`; dashboard and budget overview update.

### 4.6 Log expense and budget warnings (Scenario 8, UC-08)

1. User opens **Log Expense**.
2. Form: amount, category, date, optional description (and optional item/vendor) → Submit.
3. POST to `/api/finance/expenses/`; budget summary recalculated.
4. If category or total reaches 80% or 100%, backend/real-time sends **budget warning** → show alert (in-dashboard or Alerts page).

### 4.7 Smart shopping and purchase (Scenario 11, 12, UC-12, UC-13)

1. User opens **Smart Shopping**; searches for item (e.g. cooking oil).
2. Frontend GET `/api/ecommerce/recommendations/?item_id=...` (and optional location).
3. Page shows ranked vendors (price, distance, rating).
4. User clicks vendor → **Vendor Detail** (listings, reviews).
5. User selects listing and quantity → **Checkout**.
6. Frontend POSTs `/api/ecommerce/purchases/`; backend returns payment URL (Chapa/Telebirr).
7. User redirected to payment gateway; on success, gateway redirects back (or webhook).
8. Frontend shows success; purchase appears in **My Purchases**; optional **Review Vendor** prompt.

### 4.8 Receive price spike alert (Scenario 10)

1. Backend or real-time service detects price increase (e.g. teff +20%) → creates alert.
2. Real-time server sends `price_spike_alert` over WebSocket (or poll).
3. Frontend shows notification (toast/banner); user can open **Alerts** or **Price Trends** for detail and suggested actions.

### 4.9 Admin: moderate price submissions (Scenario 5, UC-06)

1. Admin logs in → **Admin Dashboard** → **Price Moderation**.
2. Frontend GET `/api/market/admin/submissions/` (pending).
3. Admin sees list (price, location, contributor, deviation); reviews each.
4. Admin approves, rejects, or edits → POST approve/reject or PATCH; list updates.

### 4.10 Export report (Scenario 16, FR-34)

1. User opens **Export Report** (or from Budget/Finance section).
2. Select month, year, format (PDF or CSV) → Submit.
3. Frontend GET `/api/finance/export/?format=pdf&month=3&year=2025` (or csv).
4. Browser downloads file.

### 4.11 Logout (Scenario 19)

1. User clicks **Logout**.
2. Frontend discards tokens (and optionally calls logout endpoint).
3. Redirect to **Home** or **Login**.

---

## 5. Navigation Structure (Suggested)

- **Header:** Logo, Nav (Dashboard, Price Trends, Budget, Shop, Alerts), Profile menu (Profile, Export, Logout).
- **Dashboard:** Cards/sections for budget progress, recent expenses, price highlights, alerts, vendor deals.
- **Sidebar (optional):** Same links for mobile drawer or desktop sidebar.
- **Vendor:** Vendor-specific nav (Dashboard, Listings, Orders, Profile).
- **Admin:** Admin nav (Dashboard, Moderation, Users, Vendors, Settings, ML).

---

## 6. Real-Time Integration

- **Socket.io client** connects to Express real-time server (e.g. after login).
- Send **authenticate** with JWT for user-scoped events.
- Listen for: `price_spike_alert`, `budget_warning`, `vendor_deal`, `delivery_update`, `payment_confirmation`.
- Show in-app toasts or badge on **Alerts**; optional sound for critical alerts.

---

## 7. Responsive and Accessibility

- All main flows must work on **mobile, tablet, desktop** (FR-14, NFR-12, NFR-14).
- Charts and key numbers readable on small screens; primary actions easily tappable.
- Use semantic HTML and ARIA where needed; sufficient contrast (usability, NFR-12).

---

## 8. Page–API Mapping (Summary)

| Frontend page / action | Main API(s) |
|------------------------|-------------|
| Login | POST `/api/auth/token/` |
| Register | POST `/api/users/register/` |
| Dashboard | GET `/api/finance/budgets/`, expenses, `/api/market/trends/`, alerts |
| Price Trends | GET `/api/market/trends/`, `/api/market/forecasts/`, `/api/market/inflation/` |
| Submit Price | POST `/api/market/prices/submit/` |
| Budget Planner | GET suggestions, POST/PATCH `/api/finance/budgets/` |
| Log Expense | POST `/api/finance/expenses/` |
| Budget Overview | GET `/api/finance/budgets/<id>/summary/` |
| Smart Shopping | GET `/api/ecommerce/recommendations/` |
| Vendor detail | GET vendor, listings, reviews |
| Checkout | POST `/api/ecommerce/purchases/` |
| My Purchases | GET `/api/ecommerce/purchases/` |
| Review Vendor | POST `/api/ecommerce/vendors/<id>/reviews/` |
| Export | GET `/api/finance/export/?format=...` |
| Profile | GET/PATCH `/api/users/me/` |
| Admin moderation | GET/POST/PATCH `/api/market/admin/submissions/` |
| Alerts | WebSocket events + optional GET alerts endpoint |

---

*Document derived from SpendSense Ethiopia SRS. Implement Next.js pages and flows according to this specification.*

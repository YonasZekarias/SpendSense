# SpendSense Page to Endpoint Map

This file maps frontend pages/flows to Django API endpoints and expected page behavior.

## Next.js redirects (legacy → current)

- `/live-prices`, `/price-trends` -> `/market/trends`
- `/signup` -> `/register`
- `/admin/users` -> `/admin/admin-panel/users`
- `/admin/vendors` -> `/admin/admin-panel/vendors`
- `/admin/settings` -> `/admin/admin-panel/system-settings`
- `/admin/moderate/prices` -> `/admin/admin-panel/price-moderation`
- Other `/admin/...` shortcuts: see `apps/web/next.config.js` `redirects()`.

## Public/Auth

- `/login` -> `POST /api/auth/token/` : authenticate and store JWT.
- `/register` -> `POST /api/users/register/` : create account, then onboarding.
- `/forgot-password` -> `POST /api/users/password/reset/request/` : request reset.
- `/reset-password` -> `POST /api/users/password/reset/confirm/` : apply new password.
- `POST /api/auth/logout/` : sign out (client should discard tokens).
- `/settings` (alerts) -> `GET/PATCH /api/users/preferences/` : notification preferences (alias of profile prefs).

## User pages

- `/dashboard` -> budget list, expenses list, trends, notifications.
- `/market` -> redirect to `/market/trends`.
- `/market/trends` -> `GET /api/market/trends/`, `GET /api/market/forecasts/`, `GET /api/market/inflation/`.
- `/market/<id>` (numeric) -> rewrite to `/market/items/<id>`; `GET /api/market/items/<id>/`.
- `GET /api/market/categories/` -> filter chips / category pickers.
- `/market/submit` -> `POST /api/market/prices/submit/`.
- `/budget` -> `GET /api/finance/budgets/suggestions/`, `POST/PATCH /api/finance/budgets/...`.
- `/finance/overview` -> `GET /api/finance/budgets/<id>/summary/`.
- `/finance/expense` -> `POST /api/finance/expenses/`.
- `/finance/expenses` -> `GET /api/finance/expenses/`.
- `/finance/export` -> `GET /api/finance/export/?format=csv|pdf`.
- History/summary on `/dashboard`, `/finance/*`, and expense views: **derive** from `GET /api/finance/expenses/`, `GET /api/finance/budgets/`, and `GET /api/finance/budgets/<id>/summary/` (no dependency on aggregate `reports` or `history` routes in the web app).
- `/expenses/new`, `/expenses/[id]/edit` -> `POST/PATCH/DELETE /api/finance/expenses/...`.
- `/shop` -> `GET /api/ecommerce/recommendations/`.
- `/shop/vendor/[id]` -> vendor detail + listings + reviews endpoints.
- `/shop/checkout` -> `POST /api/ecommerce/purchases/`.
- `/shop/orders` -> `GET /api/ecommerce/purchases/`.
- `/shop/orders/[id]` -> `GET /api/ecommerce/purchases/<id>/`.
- `/shop/payment/return` and `/shop/payment/cancel` -> use purchase detail to show final state.
- `/notifications` -> `GET/PATCH /api/users/me/notifications/...`.
- `/profile` -> `GET/PATCH /api/users/me/`.

## Vendor pages

- `/vendor/register` -> `POST /api/ecommerce/vendors/`.
- `/vendor/listings` -> `GET/POST /api/ecommerce/vendors/<vendor_id>/listings/`, `PATCH /api/ecommerce/listings/<id>/`.
- `/vendor/orders` and detail -> `PATCH /api/ecommerce/purchases/<id>/status/`.

## Admin pages

- `/admin/moderate/prices` -> market admin submission endpoints.
- `/admin/users` -> `GET/PATCH /api/users/admin/users/...`.
- `/admin/vendors` -> ecommerce admin vendor verify/reject endpoints.
- `/admin/settings` -> `GET/PATCH /api/admin/settings/`.
- `/admin/ml` -> `POST /api/admin/ml/retrain/`, `GET /api/admin/ml/status/`.
- `/admin/audit` -> `GET /api/admin/audit/`.

## Real-time (Express + Socket.io, `apps/realtime`)

- Web client: `NEXT_PUBLIC_REALTIME_URL` (default `http://127.0.0.1:3001`), path `/socket.io`.
- After connect, emit `authenticate` with `{ token: accessToken }` (same HS256 secret as Django `SECRET_KEY` / `JWT_SIGNING_KEY`).
- Events: `budget_warning`, `price_spike_alert`, `vendor_deal`, `delivery_update`, `payment_confirmation`, `notification` (payload includes `message` when pushed from Django `Notification`).
- Internal bridge: Django `post_save` on `Notification` -> `POST {REALTIME_INTERNAL_URL}/internal/emit` with `X-Internal-Token`.

## Server-only integration

- Payment gateway webhook -> `POST /api/ecommerce/webhooks/payment/`.

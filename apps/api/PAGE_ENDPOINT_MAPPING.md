# SpendSense Page to Endpoint Map

This file maps frontend pages/flows to Django API endpoints and expected page behavior.

## Public/Auth

- `/login` -> `POST /api/auth/token/` : authenticate and store JWT.
- `/register` -> `POST /api/users/register/` : create account, then onboarding.
- `/forgot-password` -> `POST /api/users/password/reset/request/` : request reset.
- `/reset-password` -> `POST /api/users/password/reset/confirm/` : apply new password.

## User pages

- `/dashboard` -> budget list, expenses list, trends, notifications.
- `/market/trends` -> `GET /api/market/trends/`, `GET /api/market/forecasts/`, `GET /api/market/inflation/`.
- `/market/items/[id]` -> `GET /api/market/items/<id>/`.
- `/market/submit` -> `POST /api/market/prices/submit/`.
- `/budget` -> `GET /api/finance/budgets/suggestions/`, `POST/PATCH /api/finance/budgets/...`.
- `/finance/overview` -> `GET /api/finance/budgets/<id>/summary/`.
- `/finance/expense` -> `POST /api/finance/expenses/`.
- `/finance/expenses` -> `GET /api/finance/expenses/`.
- `/finance/export` -> `GET /api/finance/export/?format=csv|pdf`.
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

## Server-only integration

- Payment gateway webhook -> `POST /api/ecommerce/webhooks/payment/`.

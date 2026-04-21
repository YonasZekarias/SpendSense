# SpendSense API — Endpoints (local testing)

Base URL when running locally: **http://127.0.0.1:8000**

---

## Swagger (interactive docs)

| URL | Description |
|-----|-------------|
| **http://127.0.0.1:8000/swagger/** | Swagger UI — browse and try all endpoints |
| **http://127.0.0.1:8000/redoc/** | ReDoc — alternative API docs |
| **http://127.0.0.1:8000/swagger.json** | OpenAPI schema (JSON) |

Use **Swagger** to see request/response shapes and to call endpoints from the browser.

---

## Auth (JWT)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/token/` | No | Login. Body: `{"email": "you@example.com", "password": "..."}` or use `"username"` instead of `"email"`. Returns `access` + `refresh` tokens. |
| POST | `/api/auth/token/refresh/` | No | Refresh access token. Body: `{"refresh": "<refresh_token>"}`. |

Use the **access** token in the header for protected endpoints:  
`Authorization: Bearer <access_token>`

### If you get 401 Unauthorized

1. **Use the correct URL** — profile is **`GET /api/users/me/`** (not `/me` at the site root).

2. **Send exactly one access token** — the `Authorization` header must look like:
   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....signature_here
   ```
   - Copy **only** the `access` string from the login JSON (no `{`, no `"access":`, no quotes around the token).
   - **Do not** paste several tokens back-to-back or extra `"` characters inside the header value.
   - **Do not** use `Bearer` twice (`Bearer Bearer eyJ...`).

3. **Swagger Authorize** — type `Bearer ` (with a space) then paste **only** the `access` string. A valid JWT has **three** parts separated by **two** dots: `xxxxx.yyyyy.zzzzz`.

4. **Token must match this server** — if `SECRET_KEY` in `.env` changed, old tokens are invalid; log in again.

5. **User must exist in this database** — tokens from another environment or an old DB (e.g. integer `user_id` while this project uses UUID users) will return 401.

6. **Login returns 401?**  
   - Register first with **POST /api/users/register/** if needed.  
   - Use the same email and password; body is JSON with `email` (or `username`) and `password`.

---

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register/` | No | Register. Body: `full_name`, `email`, `password`, optional `phone`, `city`, `household_size`, `income_bracket`, `notification_preferences`, `onboarding_completed`. |
| GET | `/api/users/me/` | Yes | Current user profile (includes `notification_preferences`, `onboarding_completed`). |
| PATCH | `/api/users/me/` | Yes | Update profile (partial): city, household, income, **`notification_preferences`** (JSON), **`onboarding_completed`** (for `/onboarding` → dashboard). |
| POST | `/api/users/password/reset/request/` | No | **Week 3** forgot-password. Body: `{ "email": "..." }`. Always `200` with generic message; sends email with `uid` + `token` query params when user exists. |
| POST | `/api/users/password/reset/confirm/` | No | **Week 3** reset-password. Body: `{ "uid": "<from email>", "token": "<from email>", "new_password": "..." }`. |
| GET | `/api/users/me/notifications/` | Yes | List notifications. |
| PATCH | `/api/users/me/notifications/<id>/` | Yes | Mark read, etc. |

### Password reset (Week 3 frontend)

Configure the link target for emails (defaults suit local Next.js):

| Env var | Purpose |
|---------|---------|
| `FRONTEND_URL` | e.g. `http://localhost:3000` |
| `PASSWORD_RESET_FRONTEND_PATH` | e.g. `/reset-password` (page reads `?uid=&token=`) |
| `EMAIL_BACKEND` | Default: console in `DEBUG`; set SMTP in production |
| `DEFAULT_FROM_EMAIL` | From address for reset emails |

---

## Market

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/market/items/` | No | List tracked items. Query: `?category=Food`, `?search=teff`. |
| POST | `/api/market/admin/items/` | Admin | Create a tracked item. Body: `name`, `category`, `unit`. |
| POST | `/api/market/prices/submit/` | Yes | Submit a price. Body: `item_id`, `price_value`, `market_location`, `city`, `date_observed`. |
| GET | `/api/market/prices/averages/` | No | Aggregated averages from approved submissions. Query: `?item_id=`, `?city=`, `?from_date=`, `?to_date=`. |

---

## Finance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET/POST | `/api/finance/budgets/` | Yes | List/create user budgets. |
| GET/PATCH/DELETE | `/api/finance/budgets/<id>/` | Yes | Read/update/delete budget. |
| GET | `/api/finance/budgets/suggestions/` | Yes | Suggested monthly split. |
| GET | `/api/finance/budgets/<id>/summary/` | Yes | Budget vs actual summary and warning flags. |
| GET/POST | `/api/finance/expenses/` | Yes | List/log expenses. |
| GET/PATCH/DELETE | `/api/finance/expenses/<id>/` | Yes | Read/update/delete expense. |
| GET | `/api/finance/export/?format=csv` | Yes | CSV export. |
| GET | `/api/finance/export/?format=pdf` | Yes | PDF export. |

## E-commerce

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ecommerce/vendors/` | Yes | Register current user as vendor. |
| GET | `/api/ecommerce/vendors/<id>/` | No | Public vendor profile. |
| GET/POST | `/api/ecommerce/vendors/<vendor_id>/listings/` | Yes | Vendor listing management. POST body requires: `item` (Item id, int), `price` (decimal). |
| PATCH | `/api/ecommerce/listings/<id>/` | Yes | Update listing. |
| GET | `/api/ecommerce/recommendations/` | Yes | Vendor recommendations by item/location. |
| GET/POST | `/api/ecommerce/purchases/` | Yes | List purchases / create purchase checkout session. |
| GET | `/api/ecommerce/purchases/<id>/` | Yes | Purchase detail. |
| PATCH | `/api/ecommerce/purchases/<id>/status/` | Yes (vendor/admin) | Delivery state update (`shipped`, `delivered`, `cancelled`). |
| POST | `/api/ecommerce/webhooks/payment/` | No (gateway + secret) | Payment callback updates transaction status. |
| GET | `/api/ecommerce/admin/vendors/` | Admin | Vendor verification queue. |
| POST | `/api/ecommerce/admin/vendors/<id>/verify/` | Admin | Verify vendor. |
| POST | `/api/ecommerce/admin/vendors/<id>/reject/` | Admin | Reject vendor (if no purchases). |

## Admin and ML (Week 4)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET/PATCH | `/api/admin/settings/` | Admin | Read/update system settings keys. |
| GET | `/api/admin/audit/` | Admin | Audit stream of admin/system actions. |
| POST | `/api/admin/ml/retrain/` | Admin | Run forecast generation job and persist `Forecast` rows. |
| GET | `/api/admin/ml/status/` | Admin | Last ML run metadata. |

---

## Quick test (curl)

```bash
# Register
curl -X POST http://127.0.0.1:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"testpass123"}'

# Login (use "username" with email)
curl -X POST http://127.0.0.1:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"testpass123"}'

# Get profile (replace TOKEN with access token from login)
curl http://127.0.0.1:8000/api/users/me/ -H "Authorization: Bearer TOKEN"

# List items
curl http://127.0.0.1:8000/api/market/items/
```

---

## Install Swagger dependency

If Swagger URLs return 404, install the doc package:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

Then restart the server: `python manage.py runserver`.

---

## Automated checks

```bash
cd apps/api
python manage.py test tests.test_week2_endpoints -v 2
python manage.py test tests.test_week3_users -v 2
python manage.py test tests.test_week4_backend -v 2
```

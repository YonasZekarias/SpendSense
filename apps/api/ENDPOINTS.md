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
| POST | `/api/users/register/` | No | Register. Body: `full_name`, `email`, `password`, optional `phone`, `city`, `household_size`, `income_bracket`. |
| GET | `/api/users/me/` | Yes | Current user profile. |
| PATCH | `/api/users/me/` | Yes | Update profile (partial). |
| GET | `/api/users/me/notifications/` | Yes | List in-app notifications. |
| PATCH | `/api/users/me/notifications/<id>/` | Yes | Mark notification read/unread (`is_read`). |
| GET | `/api/users/admin/users/` | Admin | List users (`role` = `admin` or `is_staff`). |
| GET | `/api/users/admin/users/<uuid>/` | Admin | User detail. |
| PATCH | `/api/users/admin/users/<uuid>/` | Admin | Body: `is_active`. |

**Admin** = JWT for a user with `role: "admin"` or Django `is_staff`.

---

## Market

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/market/items/` | No | List items. Query: `category`, `search`. |
| GET | `/api/market/items/<id>/` | No | Item detail. |
| POST | `/api/market/prices/submit/` | Yes | Submit price. Body: `item_id`, `price_value`, `market_location`, `city`, `date_observed`. |
| GET | `/api/market/prices/averages/` | No | Aggregates (approved only). Query: `item_id`, `city`, `from_date`, `to_date`. |
| GET | `/api/market/trends/` | No | Time series. Query: **`item_id`** (required), `city`, `from_date`, `to_date`. |
| GET | `/api/market/forecasts/` | No | Forecasts or stub. Query: **`item_id`**, `city`, `forecast_weeks`. |
| GET | `/api/market/inflation/` | No | Period compare. Query: `period` (`week` or `month`), `city`, optional `item_id`. |
| GET | `/api/market/national-prices/` | No | Official/crowd national rows. Query: `item_id`, `city`, `from_date`, `to_date`. |
| GET | `/api/market/admin/submissions/` | Admin | Pending price submissions. |
| GET | `/api/market/admin/submissions/<id>/` | Admin | Submission detail. |
| PATCH | `/api/market/admin/submissions/<id>/` | Admin | Edit fields / status before approve. |
| POST | `/api/market/admin/submissions/<id>/approve/` | Admin | Approve. |
| POST | `/api/market/admin/submissions/<id>/reject/` | Admin | Reject. |

---

## Finance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/finance/budgets/suggestions/` | Yes | Heuristic suggestions. Query: `month`, `year`. |
| GET | `/api/finance/budgets/` | Yes | List budgets. |
| POST | `/api/finance/budgets/` | Yes | Create. Body: `month`, `year`, `total_limit`, `categories[]` with `category_name`, `limit_amount`. |
| GET | `/api/finance/budgets/<id>/` | Yes | Budget + categories. |
| PATCH | `/api/finance/budgets/<id>/` | Yes | Update; optional full `categories[]` replace. |
| DELETE | `/api/finance/budgets/<id>/` | Yes | Delete budget. |
| GET | `/api/finance/budgets/<id>/summary/` | Yes | Spent vs limits, 80%/100% flags. |
| GET | `/api/finance/expenses/` | Yes | List. Query: `category`, `date_from`, `date_to`. |
| POST | `/api/finance/expenses/` | Yes | Body: `category`, `amount`, `date`, optional `description` (→ note), `item`, `vendor`, `payment_method`. |
| GET | `/api/finance/expenses/<id>/` | Yes | Detail. |
| PATCH | `/api/finance/expenses/<id>/` | Yes | Partial update. |
| DELETE | `/api/finance/expenses/<id>/` | Yes | Delete. |
| GET | `/api/finance/export/` | Yes | Query: `format`=`csv`\|`pdf` (PDF → 501), `month`, `year`. |

---

## E-commerce

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ecommerce/vendors/` | Yes | Register vendor; sets `role` → `vendor`. Body: `shop_name`, `city`, `address`, `contact_phone`, optional `latitude`, `longitude`. |
| GET | `/api/ecommerce/vendors/<uuid>/` | No | Public vendor profile. |
| GET | `/api/ecommerce/vendors/<uuid>/listings/` | Yes | Vendor’s prices (owner or admin). |
| POST | `/api/ecommerce/vendors/<uuid>/listings/` | Yes | Add `VendorPrice`. Body: `item`, `price`. |
| PATCH | `/api/ecommerce/listings/<id>/` | Yes | Update listing (owner or admin). |
| GET | `/api/ecommerce/recommendations/` | Yes | Ranked vendors. Query: **`item_id`**, `city`, `latitude`, `longitude`, `limit`. |
| GET | `/api/ecommerce/purchases/` | Yes | List purchases. |
| POST | `/api/ecommerce/purchases/` | Yes | Body: `vendor_id`, `listing_id` (VendorPrice id), `quantity`. |
| GET | `/api/ecommerce/purchases/<uuid>/` | Yes | Purchase detail. |
| GET | `/api/ecommerce/vendors/<uuid>/reviews/` | No | List reviews. |
| POST | `/api/ecommerce/vendors/<uuid>/reviews/` | Yes | Body: `rating` (1–5), `comment`. One review per user per vendor. |
| GET | `/api/ecommerce/admin/vendors/` | Admin | All vendors. |
| POST | `/api/ecommerce/admin/vendors/<uuid>/verify/` | Admin | Set `is_verified`. |
| POST | `/api/ecommerce/admin/vendors/<uuid>/reject/` | Admin | Delete vendor if no purchases; reset owner `role` to `user`. |

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

## Automated checks (Week 1–2 smoke tests)

From `apps/api` with venv activated:

```bash
python manage.py test tests.test_week2_endpoints -v 2
```

Covers: items list/detail, register/login/me, price submit, trends/forecasts/inflation, admin submissions authz, finance budget + expense, ecommerce recommendations + purchase, admin user list.

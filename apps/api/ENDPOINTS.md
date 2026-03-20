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

---

## Market

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/market/items/` | No | List tracked items. Query: `?category=Food`, `?search=teff`. |
| POST | `/api/market/prices/submit/` | Yes | Submit a price. Body: `item_id`, `price_value`, `market_location`, `city`, `date_observed`. |
| GET | `/api/market/prices/averages/` | No | Aggregated averages from approved submissions. Query: `?item_id=`, `?city=`, `?from_date=`, `?to_date=`. |

---

## Finance & E-commerce

Currently no routes; app URLs are empty. Will be added in later weeks.

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

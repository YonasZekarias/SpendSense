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

1. **Protected endpoints** (`/api/users/me/`, `/api/market/prices/submit/`) require a token.  
   - First call **POST /api/auth/token/** with `{"email": "your@email.com", "password": "yourpassword"}`.  
   - Copy the `access` value from the response.  
   - In Swagger: click **Authorize**, enter `Bearer <paste access token>`, then **Authorize**.  
   - Or in curl: add header `-H "Authorization: Bearer <access>"`.

2. **Login returns 401?**  
   - User must exist. Call **POST /api/users/register/** first if you haven’t.  
   - Use the same email and password you registered with.  
   - Body must be JSON with `email` (or `username`) and `password`.

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

# SpendSense Ethiopia — Backend API Documentation

**Based on SRS: Cost of Living Tracker, Budget Assistant & Smart Shopping Platform**

---

## 1. Overview

The SpendSense backend is a **hybrid architecture**:
- **Django (Python)** — Core API, authentication, market intelligence, finance, e-commerce, ML forecasting.
- **Express.js (Node.js)** — Real-time notifications and delivery tracking via WebSockets (Socket.io).

All REST APIs use **JSON**. Authentication is **JWT** (JSON Web Tokens). Base URL for Django API: `/api/`.

---

## 2. Authentication

### 2.1 Obtain Token Pair (Login)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/token/` | Returns access + refresh tokens (email/phone + password). |

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```
*Or use `phone` instead of `email` if supported.*

**Response (200):**
```json
{
  "access": "<JWT_ACCESS_TOKEN>",
  "refresh": "<JWT_REFRESH_TOKEN>"
}
```

### 2.2 Refresh Access Token

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/token/refresh/` | Returns new access token using refresh token. |

**Request body:**
```json
{
  "refresh": "<JWT_REFRESH_TOKEN>"
}
```

**Response (200):**
```json
{
  "access": "<NEW_JWT_ACCESS_TOKEN>"
}
```

### 2.3 Authenticated Requests

Include in header:
```
Authorization: Bearer <access_token>
```

---

## 3. Users & Identity (`/api/users/`)

### 3.1 Register User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/users/register/` | No | Create new user (FR-01). |

**Request body:**
```json
{
  "full_name": "Abebe Kebede",
  "email": "abebe@example.com",
  "phone": "+251911234567",
  "password": "securePassword",
  "household_size": 4,
  "income_bracket": "5000-10000",
  "role": "user"
}
```

**Response (201):** User object (excluding password).

### 3.2 Get Current User Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users/me/` | Yes | Get authenticated user profile (FR-03). |

**Response (200):** User profile (name, email, phone, role, household_size, income_level, location, notification_preferences).

### 3.3 Update Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/api/users/me/` | Yes | Update profile: income_level, household_size, location, notification_preferences (FR-03). |

**Request body (partial):**
```json
{
  "household_size": 5,
  "income_bracket": "10000-20000",
  "city": "Adama",
  "notification_preferences": { "price_alerts": true, "budget_alerts": true }
}
```

### 3.4 Logout (optional)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/users/logout/` | Yes | Invalidate session / refresh token (client may simply discard tokens). |

---

## 4. Market Intelligence (`/api/market/`)

### 4.1 List Tracked Items

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/market/items/` | Optional | List all tracked items (name, category, unit). |

**Query params:** `category`, `search`.

### 4.2 Submit Price (Crowdsourcing)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/market/prices/submit/` | Yes | Submit price report (FR-05, FR-06). |

**Request body:**
```json
{
  "item_id": "uuid",
  "item_name": "Teff",
  "unit": "kg",
  "category": "Food",
  "price_value": 85.50,
  "market_location": "Merkato",
  "city": "Addis Ababa",
  "date_observed": "2025-03-10"
}
```

**Response (201):** Submission with `status: "pending"`. Outliers may be flagged (FR-06).

### 4.3 Get National / City Averages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/market/prices/averages/` | No | Aggregated prices by item, city, date range (FR-09). |

**Query params:** `item_id`, `city`, `from_date`, `to_date`, `level` (national | city).

**Response (200):** List of `{ item_id, item_name, average_price, city, date, source }`.

### 4.4 Price Trends & History

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/market/trends/` | Optional | Historical price trends for items (FR-13). |

**Query params:** `item_id`, `city`, `from_date`, `to_date`.

**Response (200):** Time-series data for charts (historical + optional forecast).

### 4.5 Get Forecasts (ML)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/market/forecasts/` | Optional | Short-term price forecasts 1–4 weeks (FR-11, FR-14). |

**Query params:** `item_id`, `city`, `forecast_weeks`.

**Response (200):** `{ item_id, forecast_date, predicted_price, confidence_low, confidence_high, model_used }`.

### 4.6 Inflation Indicators

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/market/inflation/` | Optional | Weekly/monthly inflation indicators (FR-12). |

**Query params:** `period` (week | month), `city`.

---

## 5. Admin — Price Moderation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/market/admin/submissions/` | Admin | List pending price submissions (FR-07). |
| `GET` | `/api/market/admin/submissions/<id>/` | Admin | Get submission detail. |
| `POST` | `/api/market/admin/submissions/<id>/approve/` | Admin | Approve submission (FR-07, FR-08). |
| `POST` | `/api/market/admin/submissions/<id>/reject/` | Admin | Reject submission. |
| `PATCH` | `/api/market/admin/submissions/<id>/` | Admin | Edit submission then approve. |

---

## 6. Financial Management (`/api/finance/`)

### 6.1 Budgets

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/finance/budgets/` | Yes | List user's budgets (month, year). |
| `GET` | `/api/finance/budgets/<id>/` | Yes | Get budget with categories and summary. |
| `POST` | `/api/finance/budgets/` | Yes | Create monthly budget (FR-15). |
| `PATCH` | `/api/finance/budgets/<id>/` | Yes | Update budget. |
| `DELETE` | `/api/finance/budgets/<id>/` | Yes | Delete budget. |

**Create/Update body:**
```json
{
  "month": 3,
  "year": 2025,
  "total_limit": 15000,
  "categories": [
    { "category_name": "Food", "limit_amount": 8000 },
    { "category_name": "Transport", "limit_amount": 2000 },
    { "category_name": "Utilities", "limit_amount": 1500 }
  ]
}
```

### 6.2 Budget Suggestions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/finance/budgets/suggestions/` | Yes | Personalized suggestions by income, household, national averages (FR-16). |

**Query params:** `month`, `year`.

### 6.3 Expenses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/finance/expenses/` | Yes | List user expenses; filter by budget, category, date range. |
| `GET` | `/api/finance/expenses/<id>/` | Yes | Get expense detail. |
| `POST` | `/api/finance/expenses/` | Yes | Log expense (FR-17). |
| `PATCH` | `/api/finance/expenses/<id>/` | Yes | Update expense. |
| `DELETE` | `/api/finance/expenses/<id>/` | Yes | Delete expense. |

**Create expense body:**
```json
{
  "category": "Food",
  "amount": 450,
  "date": "2025-03-10",
  "description": "Teff 5kg",
  "item_id": "uuid",
  "vendor_id": "uuid",
  "payment_method": "cash"
}
```

### 6.4 Budget vs Actual Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/finance/budgets/<id>/summary/` | Yes | Compare planned vs actual; charts data (FR-18). |

**Response (200):** Category-wise spent, remaining, percentages; triggers for 80%/100% (FR-19).

### 6.5 Export Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/finance/export/?format=pdf` | Yes | Export spending/budget summary as PDF (FR-34). |
| `GET` | `/api/finance/export/?format=csv` | Yes | Export as CSV. |

**Query params:** `month`, `year`, `format` (pdf | csv).

---

## 7. E-commerce & Vendors (`/api/ecommerce/`)

### 7.1 Vendor Registration (Vendor role)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ecommerce/vendors/` | Yes (Vendor) | Register vendor (FR-20). |

**Request body:**
```json
{
  "shop_name": "Abebe Store",
  "city": "Adama",
  "address": "Bole Road",
  "contact_phone": "+251911234567",
  "latitude": 8.5242,
  "longitude": 39.2692
}
```

### 7.2 Vendor Listings (Vendor manages own)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/ecommerce/vendors/<vendor_id>/listings/` | Yes | List vendor's items. |
| `POST` | `/api/ecommerce/vendors/<vendor_id>/listings/` | Vendor | Add/update item price (FR-21). |
| `PATCH` | `/api/ecommerce/listings/<id>/` | Vendor | Update price/availability. |

### 7.3 Vendor Recommendations (Smart Shopping)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/ecommerce/recommendations/` | Yes | Ranked vendors by price, reliability, proximity (FR-23). |

**Query params:** `item_id`, `city`, `latitude`, `longitude`, `limit`.

**Response (200):** List of vendors with price, distance, rating, comparison to average (FR-22).

### 7.4 Purchase (Checkout)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ecommerce/purchases/` | Yes | Initiate purchase (FR-24). |

**Request body:**
```json
{
  "vendor_id": "uuid",
  "listing_id": "uuid",
  "quantity": 2,
  "delivery_address": "optional",
  "payment_method": "chapa"
}
```

**Response (201):** `{ purchase_id, amount, currency, payment_url }` — redirect user to Chapa/Telebirr (FR-25). On success, purchase is logged and expense created (FR-26).

### 7.5 Purchase Status

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/ecommerce/purchases/` | Yes | List user's purchases. |
| `GET` | `/api/ecommerce/purchases/<id>/` | Yes | Get purchase detail and delivery status. |

### 7.6 Review Vendor

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ecommerce/vendors/<vendor_id>/reviews/` | Yes | Submit rating and comment (FR-27). |

**Request body:**
```json
{
  "rating": 5,
  "comment": "Fast delivery, good quality."
}
```

**Response (201):** Review stored; vendor reliability score updated.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/ecommerce/vendors/<vendor_id>/reviews/` | No | List public reviews. |

---

## 8. Admin — Users & Vendors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users/admin/users/` | Admin | List/manage users (FR-36). |
| `PATCH` | `/api/users/admin/users/<id>/` | Admin | Deactivate/activate user. |
| `GET` | `/api/ecommerce/admin/vendors/` | Admin | List vendors for verification (FR-36). |
| `POST` | `/api/ecommerce/admin/vendors/<id>/verify/` | Admin | Verify vendor. |

---

## 9. Real-Time (Express.js + Socket.io)

Base URL for real-time server (e.g. `http://localhost:4000` or same host, different path). Connect with Socket.io client; send JWT for auth.

### 9.1 Events (Server → Client)

| Event | Description |
|-------|-------------|
| `price_spike_alert` | Price of watched item increased beyond threshold (FR-28, FR-29). |
| `budget_warning` | Category or total budget at 80% or 100% (FR-19, FR-31). |
| `vendor_deal` | Nearby vendor offers price below average (FR-30). |
| `delivery_update` | Delivery status change for a purchase (FR-31). |
| `payment_confirmation` | Payment success/failure for a purchase. |

### 9.2 Events (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticate` | `{ token: "<JWT>" }` | Identify user for targeted events. |
| `subscribe_budget` | `{ budget_id }` | Receive budget warnings for that budget. |
| `subscribe_delivery` | `{ purchase_id }` | Receive delivery updates. |

---

## 10. Error Responses

| Code | Meaning |
|------|---------|
| 400 | Bad Request — validation error (body or query). |
| 401 | Unauthorized — missing or invalid JWT. |
| 403 | Forbidden — valid JWT but insufficient role/permission. |
| 404 | Not Found — resource does not exist. |
| 500 | Internal Server Error. |

**Error body (example):**
```json
{
  "detail": "Error message.",
  "code": "optional_error_code",
  "errors": { "field": ["validation message"] }
}
```

---

## 11. Role-Based Access Summary

| Resource | User | Vendor | Admin |
|----------|------|--------|-------|
| Profile | Own only | Own only | Full access |
| Price submit | Yes | Yes | Approve/Reject |
| Vendor listings | View | Manage own | Manage all |
| Budget & expenses | Own | Own | Audit |
| Purchases & reviews | Yes | View own sales | View all |
| Price moderation | No | No | Yes |
| System config / ML | No | No | Yes |

---

*Document derived from SpendSense Ethiopia SRS. Implement endpoints in Django (and Express for real-time) according to this specification.*

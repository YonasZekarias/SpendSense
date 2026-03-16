# SpendSense Backend — Week 1 Completed Work

**Document generated:** Summary of backend deliverables completed in Week 1 (4-Week Task Plan).

---

## 1. User & Identity (Django)

### 1.1 User model
- **Custom User** extends Django’s `AbstractBaseUser` and `PermissionsMixin`.
- **USERNAME_FIELD** = `email` (login with email, not username).
- **Fields:** `id` (UUID), `full_name`, `email`, `phone`, `role`, `city`, `household_size`, `income_bracket`, `is_staff`, `is_active`, `created_at`.
- **Password** handled via Django’s built-in hashing (no raw `password_hash`).
- **UserManager** with `create_user()` and `create_superuser()`.
- **Admin:** User, Vendor, and Notification registered in Django admin.

### 1.2 Auth API
- **POST `/api/auth/token/`** — Login with `email` and `password`; returns JWT access + refresh tokens.
- **POST `/api/auth/token/refresh/`** — Refresh access token using refresh token.
- **Custom JWT view** accepts `email` (or `username`) in the request body for compatibility with the API spec.

### 1.3 User API
- **POST `/api/users/register/`** — Register: `full_name`, `email`, `password`, optional `phone`, `city`, `household_size`, `income_bracket`; returns user profile (no password).
- **GET `/api/users/me/`** — Current user profile (authenticated).
- **PATCH `/api/users/me/`** — Update own profile (income, household_size, city, etc.); RBAC so users only edit their own profile.

---

## 2. Market — Items & Price Submission

### 2.1 Items
- **GET `/api/market/items/`** — List tracked items with fields: `id`, `name`, `category`, `unit`.
- **Query parameters:** `category` (filter by category), `search` (filter by name).
- **Permission:** AllowAny (public read).

### 2.2 Price submission (crowdsourcing)
- **Model: PriceSubmission** — `user`, `item`, `price_value`, `market_location`, `city`, `date_observed`, `status` (pending/approved/rejected), `created_at`.
- **POST `/api/market/prices/submit/`** — Submit a price report; body: `item_id`, `price_value`, `market_location`, `city`, `date_observed`.
- **Validation:** Required fields and `price_value` > 0.
- **Optional outlier warning:** If price differs from recent approved average by more than 50%, response includes a warning message.
- **Permission:** IsAuthenticated; submissions stored with `status = pending`.

### 2.3 Price averages
- **GET `/api/market/prices/averages/`** — Aggregated average prices from **approved** submissions only.
- **Query parameters:** `item_id`, `city`, `from_date`, `to_date`.
- **Response:** List of `item_id`, `item_name`, `average_price`, `city`, `source` (crowdsourced), `count`.
- **Permission:** AllowAny.

---

## 3. Database & DevOps

### 3.1 Migrations
- **User model** and related changes require running `python manage.py makemigrations` and `python manage.py migrate` after merging Week 1 branches (see backend README).

### 3.2 Seed data
- **Management command:** `python manage.py seed_items`
- **Creates initial items** if they do not exist, e.g. Teff, Wheat Flour, Cooking Oil, Rice, Sugar, Onion, Tomato, Potato, Lentils, Bread, Fuel (Benzene/Diesel), Minibus, Electricity, Water (Food, Transport, Utilities).

### 3.3 Backend run documentation
- **`spendsense-server/README.md`** includes:
  - Prerequisites (Python, PostgreSQL).
  - Setup: install dependencies, copy `.env`, run migrations, optional `seed_items` and `createsuperuser`.
  - How to run: `python manage.py runserver`.
  - Pointers to admin and API auth endpoints.

---

## 4. Summary Checklist (Week 1 Backend)

| Item | Status |
|------|--------|
| User model (AbstractBaseUser, email, password hashing) | Done |
| JWT auth (token + refresh, email login) | Done |
| POST /api/users/register/ | Done |
| GET /api/users/me/ | Done |
| PATCH /api/users/me/ | Done |
| GET /api/market/items/ (with filters) | Done |
| PriceSubmission model | Done |
| POST /api/market/prices/submit/ (with outlier warning) | Done |
| GET /api/market/prices/averages/ | Done |
| seed_items management command | Done |
| Backend README (run/setup docs) | Done |

---

## 5. Git Branches Delivered (Week 1)

1. **week1/user-model-auth** — User model + Auth API  
2. **week1/user-api** — Register + GET/PATCH me  
3. **week1/market-items** — GET items  
4. **week1/price-submission** — PriceSubmission + POST submit  
5. **week1/market-averages** — GET averages  
6. **week1/migrations-seed-docs** — README + seed_items  

All branches have been pushed to the repository. Merge order and PR links are in `docs/WEEK1_PULL_REQUESTS.md`.

---

*SpendSense Ethiopia — Backend Week 1 completed work summary.*

# SpendSense Backend (Django)

Core API for SpendSense Ethiopia: auth, users, market (items, price submission, averages), and more.

## Prerequisites

- Python 3.10+
- PostgreSQL
- (Optional) Virtual environment: `python3 -m venv venv` then `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)

## Setup

1. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` for PostgreSQL
   - `SECRET_KEY` for Django (use a random string in production)
   - `DEBUG=True` for development
   - Optional: `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`

3. **Database**

   Create the PostgreSQL database, then run migrations:

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Seed data (optional)**

   Load initial tracked items (e.g. Teff, Cooking Oil):

   ```bash
   python manage.py seed_items
   ```

   Create a superuser for Django admin:

   ```bash
   python manage.py createsuperuser
   ```

## Run

```bash
python manage.py runserver
```

API base: `http://127.0.0.1:8000/`

- Admin: `http://127.0.0.1:8000/admin/`
- API auth: `POST /api/auth/token/` (email + password)
- API docs: see `docs/SpendSense_Backend_API_Documentation.md`

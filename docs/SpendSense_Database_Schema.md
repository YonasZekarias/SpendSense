# SpendSense Ethiopia — Database Schema

**Database:** PostgreSQL  
**ORM:** Django (Python). Table names follow Django’s `app_label_modelname` (lowercase).

---

## 1. Users app (`users_*`)

### 1.1 users_user

Custom user (auth). Extends Django `AbstractBaseUser` + `PermissionsMixin`.

| Column           | Type           | Constraints        | Description                    |
|------------------|----------------|--------------------|--------------------------------|
| id               | UUID           | PK                 | Primary key                    |
| password         | VARCHAR(128)   | —                  | Hashed password                |
| last_login       | TIMESTAMP      | NULL               | Last login time                |
| is_superuser     | BOOLEAN        | default FALSE      | Superuser flag                 |
| full_name        | VARCHAR(120)   | NOT NULL           | Display name                   |
| email            | VARCHAR(254)   | UNIQUE, NOT NULL   | Login identifier               |
| phone            | VARCHAR(20)    | UNIQUE, NULL       | Phone number                   |
| role             | VARCHAR(10)    | default 'user'     | user \| vendor \| admin        |
| city             | VARCHAR(100)   | NULL               | City                           |
| household_size   | INTEGER        | NULL               | Household size                 |
| income_bracket   | VARCHAR(50)    | NULL               | Income bracket                 |
| is_staff         | BOOLEAN        | default FALSE      | Staff / admin access           |
| is_active        | BOOLEAN        | default TRUE       | Account active                 |
| created_at       | TIMESTAMP      | auto               | Registration time              |

M2M (separate tables): `users_user_groups`, `users_user_user_permissions` (Django auth).

---

### 1.2 users_vendor

Vendor (shop) linked to a user.

| Column    | Type              | Constraints | Description      |
|-----------|-------------------|-------------|------------------|
| id        | UUID              | PK          | Primary key      |
| owner_id  | UUID              | FK → users_user, CASCADE | Owner user  |
| shop_name | VARCHAR(150)      | NOT NULL    | Shop name        |
| city      | VARCHAR(120)      | NOT NULL    | City             |
| latitude  | DECIMAL(10,6)     | NULL        | Location         |
| longitude | DECIMAL(10,6)     | NULL        | Location         |
| joined_at | TIMESTAMP         | auto        | Registration     |

---

### 1.3 users_notification

User notifications.

| Column     | Type         | Constraints        | Description   |
|------------|--------------|--------------------|---------------|
| id         | BIGSERIAL    | PK                 | Primary key  |
| user_id    | UUID         | FK → users_user, CASCADE | User    |
| type       | VARCHAR(50)  | NOT NULL           | Notification type |
| message    | TEXT         | NOT NULL           | Message body |
| is_read    | BOOLEAN      | default FALSE      | Read flag    |
| created_at | TIMESTAMP    | auto               | Created at   |

---

## 2. Market app (`market_*`)

### 2.1 market_item

Master list of tracked items (e.g. Teff, Cooking Oil).

| Column   | Type         | Constraints  | Description   |
|----------|--------------|--------------|---------------|
| id       | BIGSERIAL    | PK           | Primary key  |
| name     | VARCHAR(120) | UNIQUE, NOT NULL | Item name |
| category | VARCHAR(100) | NOT NULL     | e.g. Food, Transport |
| unit     | VARCHAR(30)  | NOT NULL     | e.g. kg, litre |

---

### 2.2 market_pricesubmission

Crowdsourced price submissions (pending/approved/rejected).

| Column          | Type           | Constraints        | Description     |
|-----------------|----------------|--------------------|-----------------|
| id              | BIGSERIAL      | PK                 | Primary key    |
| user_id         | UUID           | FK → users_user, CASCADE | Submitter  |
| item_id         | BIGINT         | FK → market_item, CASCADE | Item    |
| price_value     | DECIMAL(10,2)  | NOT NULL           | Reported price |
| market_location | VARCHAR(120)  | NOT NULL           | Market name    |
| city            | VARCHAR(120)   | NOT NULL           | City           |
| date_observed   | DATE           | NOT NULL           | Observation date |
| status          | VARCHAR(20)    | default 'pending'  | pending \| approved \| rejected |
| created_at      | TIMESTAMP      | auto               | Submitted at   |

---

### 2.3 market_nationalprice

Aggregated/official national/city prices.

| Column | Type          | Constraints        | Description   |
|--------|---------------|--------------------|---------------|
| id     | BIGSERIAL     | PK                 | Primary key  |
| item_id| BIGINT        | FK → market_item, CASCADE | Item   |
| price  | DECIMAL(10,2) | NOT NULL           | Price        |
| source | VARCHAR(20)   | NOT NULL           | crowdsourced \| official |
| city   | VARCHAR(120)  | NOT NULL           | City         |
| date   | DATE          | NOT NULL           | Price date   |

---

### 2.4 market_vendorprice

Price at which a vendor sells an item.

| Column      | Type          | Constraints           | Description   |
|-------------|---------------|------------------------|---------------|
| id          | BIGSERIAL     | PK                    | Primary key  |
| vendor_id   | UUID          | FK → users_vendor, CASCADE | Vendor  |
| item_id     | BIGINT        | FK → market_item, CASCADE  | Item    |
| price       | DECIMAL(10,2) | NOT NULL              | Price        |
| date        | DATE          | auto                  | Set/updated   |
| is_verified | BOOLEAN       | default FALSE         | Verified flag |

---

### 2.5 market_forecast

ML/statistical price forecasts.

| Column         | Type             | Constraints | Description   |
|----------------|------------------|-------------|---------------|
| id             | BIGSERIAL        | PK          | Primary key  |
| item_id        | BIGINT           | FK → market_item, CASCADE | Item   |
| forecast_date  | DATE             | NOT NULL    | Forecast date |
| predicted_price| DECIMAL(12,2)    | NOT NULL    | Predicted price |
| model_used     | VARCHAR(50)      | NOT NULL    | e.g. SARIMA  |
| confidence_low | DECIMAL(12,2)   | NULL        | Lower bound   |
| confidence_high| DECIMAL(12,2)   | NULL        | Upper bound   |
| generated_at   | TIMESTAMP        | auto        | When generated |

---

## 3. Finance app (`finance_*`)

### 3.1 finance_budget

User’s monthly budget.

| Column      | Type           | Constraints        | Description   |
|-------------|----------------|--------------------|---------------|
| id          | BIGSERIAL      | PK                 | Primary key  |
| user_id     | UUID           | FK → users_user, CASCADE | User   |
| month       | INTEGER        | NOT NULL           | 1–12         |
| year        | INTEGER        | NOT NULL           | Year         |
| total_limit | DECIMAL(12,2)  | NOT NULL           | Total budget |
| created_at  | TIMESTAMP      | auto               | Created at   |

---

### 3.2 finance_budgetcategory

Category limits within a budget.

| Column        | Type          | Constraints        | Description   |
|---------------|---------------|--------------------|---------------|
| id            | BIGSERIAL     | PK                 | Primary key  |
| budget_id     | BIGINT        | FK → finance_budget, CASCADE | Budget |
| category_name | VARCHAR(120)  | NOT NULL           | e.g. Food, Transport |
| limit_amount  | DECIMAL(12,2) | NOT NULL           | Category limit |

---

### 3.3 finance_expense

User expense entries.

| Column        | Type          | Constraints           | Description   |
|---------------|---------------|------------------------|---------------|
| id            | BIGSERIAL     | PK                    | Primary key  |
| user_id       | UUID          | FK → users_user, CASCADE | User     |
| category      | VARCHAR(120)  | NOT NULL              | Category     |
| item_id       | BIGINT        | FK → market_item, SET_NULL, NULL | Optional item |
| amount        | DECIMAL(12,2) | NOT NULL              | Amount       |
| vendor_id     | UUID          | FK → users_vendor, SET_NULL, NULL | Optional vendor |
| payment_method| VARCHAR(50)   | NULL                 | e.g. cash   |
| date          | DATE          | NOT NULL              | Expense date |
| note          | TEXT          | NULL                  | Note         |

---

## 4. E-commerce app (`ecommerce_*`)

### 4.1 ecommerce_transaction

Purchase/payment transaction.

| Column    | Type          | Constraints        | Description   |
|-----------|---------------|--------------------|---------------|
| id        | UUID          | PK                 | Primary key  |
| user_id   | UUID          | FK → users_user, CASCADE | Buyer   |
| vendor_id | UUID          | FK → users_vendor, CASCADE | Vendor |
| amount    | DECIMAL(12,2) | NOT NULL           | Amount       |
| currency  | VARCHAR(10)   | default 'ETB'      | Currency     |
| status    | VARCHAR(10)   | NOT NULL           | pending \| success \| failed |
| reference | VARCHAR(120)  | UNIQUE, NOT NULL   | Payment ref  |
| created_at| TIMESTAMP     | auto               | Created at   |

---

## 5. Entity relationship summary

```
users_user 1 —— * users_vendor (owner)
users_user 1 —— * users_notification
users_user 1 —— * market_pricesubmission
users_user 1 —— * finance_budget
users_user 1 —— * finance_expense
users_user 1 —— * ecommerce_transaction

users_vendor 1 —— * market_vendorprice
users_vendor 1 —— * ecommerce_transaction

market_item 1 —— * market_pricesubmission
market_item 1 —— * market_nationalprice
market_item 1 —— * market_vendorprice
market_item 1 —— * market_forecast
market_item * —— 1 finance_expense (optional)

finance_budget 1 —— * finance_budgetcategory
```

---

*SpendSense Ethiopia — database schema derived from Django models. Table names may be prefixed by Django (e.g. `users_user`).*

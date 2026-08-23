# 🌿 Shoonya Farms — Full-Stack Storefront

A production-style e-commerce storefront for a natural/organic Indian staples brand
(ghee, honey, cold-pressed oils, hand-milled dals, jaggery, chemical-free atta & more).

- **Frontend:** React 18 + Vite + React Router (client-side cart with `localStorage`)
- **Backend:** FastAPI + SQLAlchemy (server-side authoritative pricing & orders)
- **Database:** SQLite locally or Supabase PostgreSQL via `DATABASE_URL`
- **Auth:** bcrypt password hashing (passlib) + JWT bearer tokens (python-jose)

Full working **add-to-cart**, **cart drawer**, **accounts**, **checkout**, **order
confirmation**, and a **my-orders area** split into pending orders and order history —
all orders are persisted to the database with server-computed subtotal, shipping, and total.

---

## ✅ Prerequisites

Already set up on this machine:

- **Node.js** — portable install at `C:\Users\ritesh.kumar03\nodejs` (added to PATH)
- **Python 3.14** — with a virtualenv at `backend/.venv` (dependencies installed)

If you ever move machines: install [Node.js LTS](https://nodejs.org) and
[Python 3.12+](https://python.org), then run the one-time setup in the next section.

### Supabase database

The default configuration uses `backend/shoonya.db`. To use Supabase, copy the
Postgres connection string from **Supabase → Project Settings → Database →
Connection string** and set it as `DATABASE_URL` before starting the backend:

```powershell
$env:DATABASE_URL = "postgresql://postgres:<db-password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
cd backend
.venv/Scripts/pip.exe install -r requirements.txt
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

The app converts the standard `postgresql://` form to the installed Psycopg
driver automatically. On first startup it creates the application tables and
seeds the catalog. Existing rows in `backend/shoonya.db` are not copied to
Supabase; migrate them separately if they are needed.

---

## 🚀 Running the app (two terminals)

The app has **two servers** that must both be running.

### Terminal 1 — Backend (port 8001)

```bash
cd backend
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8001
```

### Terminal 2 — Frontend (port 5173)

```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

> The Vite dev server proxies all `/api/*` requests to the storefront backend on port 8001,
> so there are no CORS issues and you only ever visit the `:5173` URL.

### 🖱️ Or just double-click (Windows)

- `start-all.bat` — opens both servers in separate windows
- `start-backend.bat` / `start-frontend.bat` — start them individually

---

## 🔧 One-time setup (only if deps are missing)

```bash
# Backend
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

The database auto-creates and seeds itself with 42 products on first backend startup.
To re-seed from scratch, delete `backend/shoonya.db` and restart the backend, or run:

```bash
cd backend
.venv/Scripts/python.exe -m app.seed --force
```

An **existing** `shoonya.db` from before accounts were added is upgraded in place on
startup (`ensure_schema()` adds the missing columns and index and prints what it did),
so there's no need to delete the database and lose past orders.

---

## 📡 API reference

Base URL: `http://localhost:8000`

Endpoints marked 🔒 require an `Authorization: Bearer <token>` header.

| Method | Endpoint                                | Description                                |
| ------ | --------------------------------------- | ------------------------------------------ |
| GET    | `/api/health`                           | Health check                               |
| GET    | `/api/categories`                       | Categories with product counts (slugs)     |
| GET    | `/api/products`                         | List products — `?category=&search=&sort=` |
| GET    | `/api/products/{slug}`                  | Single product detail                      |
| POST   | `/api/auth/register`                    | Create an account, returns a token         |
| POST   | `/api/auth/login`                       | Log in, returns a token                    |
| GET    | `/api/auth/me` 🔒                       | Current account                            |
| PATCH  | `/api/auth/me` 🔒                       | Update name / email / phone / address      |
| POST   | `/api/auth/change-password` 🔒          | Change password, returns a fresh token     |
| POST   | `/api/orders` 🔒                        | Create an order (server-side pricing)      |
| GET    | `/api/orders/me` 🔒                     | Every order on your account, newest first  |
| GET    | `/api/orders/{order_number}` 🔒         | Fetch one of your own orders               |
| POST   | `/api/orders/{order_number}/receive` 🔒 | Confirm delivery → moves it to history     |

Interactive API docs (Swagger UI): **http://localhost:8000/docs**

**Sort options:** `featured` · `price-asc` · `price-desc` · `rating` · `name`
**Shipping rule:** free over ₹999, otherwise ₹49 (computed on the server).

---

## 👤 Accounts & orders

Checkout requires an account, so every order belongs to someone and can be listed
later. Registering logs you in immediately.

Orders have exactly **two states**:

- **`confirmed`** — still on its way. Shows under **Pending orders**.
- **`delivered`** — finished. Shows under **Order history**.

There's no admin panel or courier integration, so the shopper moves an order
between the two by opening it under Pending and choosing **Mark as received**.

Tokens are HS256 JWTs valid for 7 days, held in `localStorage` and sent as a
bearer header. Changing a password invalidates every token issued before it, so
other devices are signed out (the tab that made the change gets a fresh token).

> **Set `SECRET_KEY` before deploying anywhere real.** It defaults to a known
> development value, and the backend logs a warning on startup while that
> default is in use. Anyone with the key can mint valid tokens.

```bash
# Windows (PowerShell)
$env:SECRET_KEY = "some-long-random-string"
```

Orders placed before accounts existed keep a `NULL` user_id and stay hidden from
every account — matching them by email would let anyone register someone else's
address and read their delivery details.

---

## 📁 Project structure

```
shoonya-web/
├── backend/
│   ├── .venv/                 # Python virtualenv
│   ├── app/
│   │   ├── main.py            # FastAPI app + startup seeding/migration + CORS
│   │   ├── database.py        # SQLAlchemy engine/session + ensure_schema()
│   │   ├── models.py          # User, Product, ProductVariant, Order, OrderItem
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── security.py        # Password hashing, JWTs, get_current_user
│   │   ├── crud.py            # Queries + order creation (authoritative pricing)
│   │   ├── seed.py            # Seeder entry point
│   │   ├── seed_data.py       # 42 products across 9 categories
│   │   └── routers/           # auth.py, products.py, orders.py
│   ├── requirements.txt
│   └── shoonya.db             # SQLite database (auto-created)
└── frontend/
    ├── public/
    │   ├── logo.svg           # "Seal of Purity" badge — header + footer
    │   ├── favicon.svg        # Simplified mark that survives 16px
    │   └── apple-touch-icon.png  # 180px, rendered from favicon.svg
    ├── src/
    │   ├── components/        # Header, Footer, CartDrawer, RequireAuth, …
    │   ├── pages/             # Home, Shop, ProductDetail, Checkout,
    │   │                      #   OrderConfirmation, Login, Register,
    │   │                      #   Account, AccountOrders, AccountProfile
    │   ├── context/           # CartContext (cart + localStorage), AuthContext
    │   ├── data/              # catalogMeta (SVG illustrations, themes, INR helper)
    │   ├── api.js             # Fetch wrapper + token handling
    │   ├── App.jsx            # Routes (incl. guarded routes) + scroll manager
    │   └── styles.css         # Full design system
    ├── vite.config.js         # Dev proxy /api → :8000
    └── package.json
```

---

## 🎨 Notes

- Product imagery uses hand-built inline **SVG illustrations** (one per category),
  so the storefront is fully self-contained with no external image dependencies.
- The **logo** is the Shoonya "Seal of Purity" badge. It already contains the
  `shoonya` wordmark, so it appears on its own — there is no text wordmark beside
  it, and the accessible name comes from the link's `aria-label`. Because the
  badge's navy artwork is nearly invisible on the dark footer, the footer copy
  sits on a cream chip (`.brand--light .brand__mark`) instead of using a second,
  recoloured file. `favicon.svg` is a _deliberately simplified_ version: at 16px
  the full badge's wordmark collapses into a grey bar, so the icon keeps only the
  green canopy and cyan wave inside a capsule.
- Prices are stored as **whole rupees (integers)** to avoid floating-point issues.
- This is a **demo store** — the "Online Payment" option does not process real charges.

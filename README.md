# Redfield Gaming — EcommerGameShop

A full-stack e-commerce platform for gaming gear and peripherals, built as a TypeScript monorepo with a separate customer-facing storefront and an admin back office. Covers the full commerce loop — browsing, cart, Stripe checkout, order tracking and refunds — plus an admin dashboard to manage products, orders and refunds.

**Live Demo:** [red-field-gaming.vercel.app](https://red-field-gaming.vercel.app)

---

## Features

### Storefront

- **Product Catalog** — Browse, search, filter and paginate products by category, with a promoted-products carousel on the homepage
- **Product Variations** — Products support variations (e.g. color/edition) with independent stock tracking
- **Cart** — Works for guests (stored client-side) and logged-in users; the guest cart automatically migrates into the account cart on login
- **Checkout** — Secure payments via Stripe, with server-side stock validation before payment is confirmed
- **Orders** — Order confirmation, order history, and order status tracking
- **Refunds** — Customers can request a refund directly from their order history
- **Auth** — Register/login with JWT-based sessions and salted + peppered, bcrypt-hashed passwords
- **Profile** — Update account info and password

### Admin Dashboard

*(role-protected, `/admin`)*

- **Dashboard** — Sales chart and summary cards for a quick business overview
- **Product Management** — Add, edit, delete (single or bulk), activate/deactivate, discount, and promote products
- **Order Management** — View all orders, inspect a single order with customer info, and update order status (single or bulk)
- **Refund Management** — Review refund requests, approve/reject individually, or mass-reject

### Platform / Infrastructure

- **Stock-safe checkout** — A scheduled cron job (every 10 min) expires unpaid pending orders, restores stock, and reconciles order status against Stripe's PaymentIntent state
- **Rate limiting** — Separate limits for auth, checkout, admin actions and general browsing (`express-rate-limit`)
- **Image uploads** — Product images stored via Cloudinary
- **Security** — Helmet-hardened HTTP headers, origin-restricted CORS, centralized error handling
- **Health check** — Dedicated endpoint for uptime monitoring
- **Shared validation** — Zod schemas and TypeScript types shared between frontend and backend (`packages/shared`)
- **Testing** — Jest + Supertest integration tests for the API, Vitest + Testing Library for the frontend
- **CI** — GitHub Actions runs both test suites against a real Postgres service container on every push/PR to `main`
- **Dockerized dev environment** — One command spins up the database, API and web app together, pre-seeded with demo data

---

## Tech Stack

| Layer             | Technology                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| Frontend           | React 19, TypeScript, Vite, TanStack Query, TanStack Table, React Router, React Hook Form, Zustand   |
| UI                 | Tailwind CSS 4, shadcn/ui, Recharts, Embla Carousel                                                  |
| Backend            | Node.js, Express 5, TypeScript                                                                       |
| Database           | PostgreSQL 18, node-postgres (`pg`)                                                                  |
| Auth               | JSON Web Tokens, bcrypt (with a server-side pepper)                                                  |
| Payments           | Stripe (Payment Elements + Webhooks)                                                                 |
| Image Storage      | Cloudinary                                                                                            |
| Validation         | Zod (shared between frontend & backend via `packages/shared`)                                        |
| Security           | Helmet, CORS, express-rate-limit                                                                     |
| Testing            | Jest, Supertest (API) · Vitest, React Testing Library (Web)                                          |
| Monorepo Tooling   | npm workspaces, Turborepo                                                                            |
| CI/CD              | GitHub Actions                                                                                       |
| Containerization   | Docker                                                                               |
| Deployment         | Vercel (frontend) · Render (backend) · NeonDB (database)                                  |

---

## Project Structure

```
EcommerGameShop/
├── apps/
│   ├── api/                  # Express backend
│   │   ├── migrations/       # SQL schema migrations + demo/backup data
│   │   ├── src/
│   │   │   ├── controllers/  # Route handlers 
│   │   │   ├── services/     # Business logic 
│   │   │   ├── repositories/ # DB access layer 
│   │   │   ├── routes/       # Express route definitions
│   │   │   ├── middleWare/   # Auth, upload, request logging
│   │   │   ├── gateways/     # Stripe, Cloudinary integrations
│   │   │   ├── cron/         # Scheduled cleanup job
│   │   │   ├── db/           # Postgres pool + transaction helper
│   │   │   ├── migration/    # Migration runner scripts
│   │   │   └── utils/        # JWT, password, rate-limit, logger helpers
│   │   └── Dockerfile        # Multi-stage production build
│   │
│   └── web/                  # React frontend
│       └── src/
│           ├── pages/        # Route-level pages
│           ├── components/   # UI components
│           ├── hooks/        # React Query hooks
│           ├── context/      # Auth provider
│           ├── route/        # Route guards (private/admin/public-only)
│           └── lib/          # Axios instance, utils
│
├── packages/
│   └── shared/                # Shared Zod schemas & TypeScript types (@ecom/shared)
│
├── compose.yml                # Docker Compose: db + api + web
├── Dockerfile.dev             # Dev image used by api/web services
└── turbo.json                 # Turborepo task pipeline
```

---

## Getting Started

### Prerequisites

| Tool | Needed for |
| --- | --- |
| [Node.js](https://nodejs.org/) & npm | Both setup paths (You don't need Node installed on your local machine for the Docker path. However, it is recommended to install it even you go with docker way as it allow you to run the test or build command with npm manually.) |
| [Docker](https://www.docker.com/) | Docker setup path (recommended) |
| [PostgreSQL 18](https://www.postgresql.org/) | Local machine setup path |
| [pgAdmin 4](https://www.pgadmin.org/) *(optional)* | Inspecting/managing the database with a GUI, either path |

### 1. Clone the repo

```bash
git clone https://github.com/ChongKangRui/EcommerGameShop.git
cd EcommerGameShop
```

### 2. Set up environment variables

There are **three** `.env.example` files — copy each one to `.env` in the same folder:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

| File | Variable | Description |
| --- | --- | --- |
| `/.env` | `DB_PASSWORD` | Password for the Postgres user. Used by Docker Compose to configure the database container. |
| `/apps/api/.env` | `PEPPER` | Static secret appended to passwords before hashing. |
| | `JWT_SECRET` | Secret used to sign/verify JWTs. |
| | `CLOUDINARY_CLOUD_NAME` / `_KEY` / `_SECRET` | From your Cloudinary dashboard → Account Details. |
| | `STRIPE_SECRET_KEY` | From Stripe Dashboard → Developers → API keys → Secret key. |
| | `STRIPE_WEBHOOK_KEY` | From Stripe Dashboard → Developers → Webhooks. |
| | `DB_PASSWORD` | Postgres password — keep this the same as the one in root `/.env`. |
| | `DATABASE_URL` | Full connection string; only used when `NODE_ENV=production` such as deploy on Render. The url usually obtain based on which database provider you choose(e.g. NeonDB). |
| `/apps/web/.env` | `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (safe for the client). From Stripe Dashboard → API Keys → Publishable key. |
| | `VITE_API_URL` | Backend base URL; only used in production builds — local dev talks to `http://localhost:3000`. |

> At minimum, `DB_PASSWORD` must be filled in for the app to start.

Now pick **one** of the two setups below.

---

### Option A — Docker (recommended)

This is the easiest path: one command builds and starts the database, API and web app together, and the database is **automatically restored with demo data** on first run.

```bash
docker compose up
```

- Web app → [http://localhost:5173](http://localhost:5173)
- API → [http://localhost:3000](http://localhost:3000)
- Postgres → `localhost:5433` (mapped from container port `5432`)

**To connect with pgAdmin 4:**

1. Right-click **Servers** → **Register** → **Server**
2. **General** tab → Name: `RedfieldGamingDB (docker)` (or anything you like)
3. **Connection** tab:
   - Host name/address: `localhost`
   - Port: `5433`
   - Username: `postgres`
   - Password: your `DB_PASSWORD`

---

### Option B — Local machine

More setup, but useful if you'd rather not use Docker.

1. **Install PostgreSQL 18** locally and make sure it's running.
2. **Create a database** named `RedfieldGamingDB`.
3. **Load the schema and data** — either:
   - Restore the full backup via pgAdmin 4: right-click the new database → **Restore...** → select `apps/api/migrations/BackupData/BackupRedfieldGamingTable.sql`, **or**
   - Run the schema-only migration script (empty tables, no demo data):
     ```bash
     npm run initDB -w api
     ```
4. **Install dependencies and build the shared package:**
   ```bash
   npm ci
   npm run build
   ```
5. **Run the apps in separate terminals:**
   ```bash
   # Frontend
   npm run dev -w web

   # Backend
   npm run dev -w api
   ```
   - Web app → [http://localhost:5173](http://localhost:5173)
   - API → [http://localhost:3000](http://localhost:3000)

By default the API connects to `localhost:5432`, database `RedfieldGamingDB`, user `postgres`, using the `DB_PASSWORD` from `apps/api/.env` — override `DB_HOST` / `DB_USER` / `DB_PORT` / `DB_NAME` in that file if your local setup differs.

---

## Testing

```bash
npm run test -w web
npm run test -w api
```

- `test -w web` runs Vitest + React Testing Library — no database required.
- `test -w api` runs Jest + Supertest integration tests against a **real** Postgres database. It expects a database named `testDB` to exist and auto-migrates/seeds it before running (`pretest` hook). Make sure Postgres is running and `DB_PASSWORD` / `PEPPER` are set in `apps/api/.env` first.

---

## Deployment

| Part | Platform |
| --- | --- |
| Frontend (`apps/web`) | [Vercel](https://vercel.com) |
| Backend (`apps/api`) | [Render](https://render.com) |
| Database | [NeonDB](https://neon.com/) |

In production, the API reads a single `DATABASE_URL` connection string instead of the individual `DB_HOST`/`DB_USER`/etc. variables — set `NODE_ENV=production` and `DATABASE_URL` on your host. The frontend needs `VITE_API_URL` pointed at the deployed API, and `VITE_STRIPE_PUBLISHABLE_KEY` set at build time.

---

## What I Learned

**Architecture & Data**
- Structuring a project as a **monorepo** (npm workspaces + Turborepo) with a shared package for types/validation, versus a single monolithic app
- Refactoring an initial monolithic MVC structure into a **layered Controller → Service → Repository architecture**, separating HTTP handling, business logic, and data access to improve testability and maintainability
- Writing raw **SQL** for schema design, migrations, and queries — joins, enums, transactions — instead of leaning on an ORM

**Core Features**
- Implementing **JWT-based stateless authentication and authorization**, including role-based route protection for admin vs. customer
- Building category-based product **browsing, search, filtering, and pagination** end-to-end, from the database query up through the API to the UI
- Integrating **Stripe** for payments, from Payment Elements on the frontend to webhook handling on the backend

**Backend Robustness**
- **Defensive programming**: designing for the non-happy path — handling partial failures, invalid states, and edge cases across the payment and order flows so a single bad request or webhook can't corrupt system state
- **Race conditions and idempotency**: working through concurrency bugs in stock reservation and payment initialization, and learning to use database transactions/locking and idempotent operations to keep concurrent requests safe

**Testing & Delivery**
- Writing both **integration tests** (API, against a real test database) and **unit tests** (business logic), and learning when each one earns its keep
- Containerizing the database, API, and frontend with **Docker** for a consistent, one-command local dev environment
- Setting up **GitHub Actions** to run the full test suite automatically against a real Postgres service container on every push/PR

---

## License

MIT

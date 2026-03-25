# Developer Setup Guide

## Prerequisites

- Node.js 20+
- Bun (`npm install -g bun`)
- PostgreSQL 14 (running locally)

## Database Setup

### 1. Create the database

```bash
psql -U ltap221001 -d postgres -c "CREATE DATABASE gym_management;"
```

### 2. Create tables

```bash
psql -U ltap221001 -d gym_management -c "
CREATE TABLE IF NOT EXISTS auth_users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  \"emailVerified\" TIMESTAMP,
  image TEXT,
  \"createdAt\" TIMESTAMP DEFAULT NOW(),
  \"updatedAt\" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_accounts (
  id SERIAL PRIMARY KEY,
  \"userId\" INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  type VARCHAR(50),
  provider TEXT,
  \"providerAccountId\" TEXT,
  access_token TEXT,
  expires_at INTEGER,
  refresh_token TEXT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  password TEXT
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id SERIAL PRIMARY KEY,
  \"sessionToken\" TEXT UNIQUE NOT NULL,
  \"userId\" INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_verification_token (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trainers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT,
  phone TEXT,
  email TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  specialties TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gender TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
  photo_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membership_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  duration_value INTEGER,
  duration_unit VARCHAR(20),
  price NUMERIC(12,2),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS member_subscriptions (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES membership_plans(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  frozen_from DATE,
  frozen_to DATE,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC(12,2),
  currency VARCHAR(10) DEFAULT 'PKR',
  method VARCHAR(30),
  status VARCHAR(20) DEFAULT 'PENDING',
  receipt_url TEXT,
  reference_no TEXT,
  notes TEXT,
  received_by_staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMP,
  confirmed_by_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
  voided_at TIMESTAMP,
  void_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  attendee_type VARCHAR(20),
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
  staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
  attendance_date DATE,
  check_in_at TIMESTAMP,
  check_out_at TIMESTAMP,
  status VARCHAR(20),
  method VARCHAR(20),
  notes TEXT,
  marked_by_staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type VARCHAR(30),
  custom_type_label TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES inventory_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER DEFAULT 0,
  unit TEXT,
  reorder_level INTEGER,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  purchase_price NUMERIC(12,2),
  sale_price NUMERIC(12,2),
  supplier TEXT,
  location TEXT,
  expiry_date DATE,
  serial_number TEXT,
  warranty_end_date DATE,
  maintenance_interval_days INTEGER,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type VARCHAR(20),
  quantity NUMERIC(12,2),
  note TEXT,
  performed_by_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  action VARCHAR(30),
  summary TEXT,
  \"timestamp\" TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
"
```

### 3. Seed the database

After the server is running:

```bash
curl -X POST -H "Content-Type: application/json" -d '{}' http://localhost:4000/api/seed
```

This creates 20 members, 6 trainers, 6 staff, 9 plans, 20 subscriptions, 17 payments, 10 attendance records, 10 inventory categories, 12 inventory items, and 3 admin accounts.

## Environment Variables

File: `apps/web/.env`

```
ANYTHING_PROJECT_TOKEN=<existing token>
DATABASE_URL=postgresql://ltap221001@localhost:5432/gym_management
AUTH_SECRET=local-dev-secret-key-change-in-production
```

Note: Do NOT set `AUTH_URL` — the auth config uses `basePath: '/api/auth'` instead. Setting both causes warnings and can break auth.

## Running the Project

```bash
cd apps/web
bun install
bun run dev
```

Default port: **4000** (will auto-increment if in use)

## Admin Login Credentials

All accounts use password: `admin123`

| Email              | Role       |
|--------------------|------------|
| admin@gym.com      | Admin      |
| manager@gym.com    | Manager    |
| reception@gym.com  | Reception  |

Sign in at: `http://localhost:4000/account/signin`

## Auth Pages

- `/account/signin` — Admin login (split-screen layout with GymFlow branding)
- `/account/signup` — Restricted: shows "contact your administrator" message (no self-registration)
- `/account/logout` — Auto signs out and redirects to signin

Self-registration is disabled. Only existing admin accounts can sign in. New accounts must be created by a super admin via the seed script or directly in the database.

## Key Local Dev Changes

The original project uses Neon serverless PostgreSQL. For local development, these files were modified to support a local PostgreSQL connection:

- `src/app/api/utils/sql.js` — Auto-detects local vs Neon URLs, uses `pg` for local
- `__create/index.ts` — Same Pool detection for the auth adapter + `basePath: '/api/auth'` for local auth
- `vite.config.ts` — SSR externals for `pg` module
- `src/app/api/seed/route.js` — Seed endpoint (blocked in production)

Navigation was converted from `window.location.href` to React Router's `useNavigate()` across all dashboard pages for SPA behavior (no full page reloads).

## Tests

```bash
# Run all tests (67 tests across 3 suites)
cd apps/web && bunx vitest run

# Test suites:
# - src/components/__tests__/sidebar.test.jsx — Sidebar navigation, active state
# - src/app/dashboard/__tests__/navigation.test.jsx — SPA navigation safety (no window.location.href)
# - src/app/account/__tests__/auth-pages.test.jsx — Auth page rendering, form validation
```

## Useful Commands

```bash
# Type checking
bun run typecheck

# Run tests
bunx vitest

# Run a single test
bunx vitest run <file>

# Re-seed database (wipes and repopulates all data)
curl -X POST -H "Content-Type: application/json" -d '{}' http://localhost:4000/api/seed

# Connect to database directly
psql -U ltap221001 -d gym_management

# Drop and recreate database (nuclear option)
psql -U ltap221001 -d postgres -c "DROP DATABASE gym_management;"
psql -U ltap221001 -d postgres -c "CREATE DATABASE gym_management;"
# Then re-run the CREATE TABLE commands above and re-seed
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gym management system monorepo with a web admin dashboard (`apps/web`) and mobile app (`apps/mobile`). The web app is a React Router v7 SSR application powered by a Hono backend server with Neon PostgreSQL.

## Commands

```bash
# Development (from apps/web/)
bun run dev          # Starts Hono + Vite dev server on 0.0.0.0:4000

# Type checking
bun run typecheck    # Runs tsc + react-router typegen

# Tests
bunx vitest          # Run all tests
bunx vitest run <file>  # Run a specific test file
```

There is no separate build or start script — `react-router dev` handles everything.

## Architecture

### Server Entry & API Routes

The Hono server is configured in `apps/web/__create/index.ts`. It sets up auth, CORS, request ID middleware, and body size limits.

**API routes use file-based discovery:** `apps/web/__create/route-builder.ts` scans `src/app/api/**/route.js` files and registers them as Hono routes. Path segments like `[id]` become `:id` params, and `[...path]` becomes catch-all params.

API handler signature:
```javascript
export async function GET(request) {
  return Response.json(data);
}
export async function POST(request) {
  const body = await request.json();
  return Response.json(data, { status: 201 });
}
```

### Database

PostgreSQL via `@neondatabase/serverless` (production) or `pg` (local dev). The SQL client is in `src/app/api/utils/sql.js` — auto-detects Neon vs local URLs.

Two query styles are used:
- Tagged template: `` sql`SELECT * FROM members WHERE id = ${id}` ``
- Parameterized: `sql(queryString, [param1, param2])` with `$1, $2` placeholders

Key tables: `auth_users`, `auth_accounts`, `auth_sessions`, `members`, `trainers`, `staff`, `member_subscriptions`, `payments`, `attendance`, `inventory_items`, `inventory_categories`.

### Authentication

Auth is handled by `@auth/core` + `@hono/auth-js` with credentials-based (email/password) strategy using argon2 hashing. Config lives in `src/auth.js`, adapter in `__create/adapter.ts`. JWT-based sessions.

Auth pages: `/account/signin` (login), `/account/signup` (restricted — no self-registration), `/account/logout`. Auth requires `basePath: '/api/auth'` in the `initAuthConfig` — do NOT set `AUTH_URL` env var alongside it.

### Frontend

- Pages live in `src/app/` using file-based routing (React Router v7 fs-routes)
- Client pages use `"use client"` directive
- Data fetching via React Query (`@tanstack/react-query`) — staleTime: 5min, cacheTime: 30min, retry: 1, refetchOnWindowFocus: false
- Styling: Chakra UI + Tailwind CSS, with Emotion/styled-jsx
- Forms: React Hook Form
- State: Zustand
- Charts: Recharts
- Toasts: Sonner

### The `__create` Pattern

Two `__create` directories contain framework-level code:
- `apps/web/__create/` — Server-side: Hono app setup, route builder, auth DB adapter, error pages
- `apps/web/src/__create/` — Client-side: custom fetch wrapper, Stripe integration, auth config, dev heartbeat

### Vite Plugins (`apps/web/plugins/`)

Notable custom plugins:
- `layouts.ts` — Automatically wraps pages with ancestor `layout.jsx` files (hierarchical layout nesting)
- `nextPublicProcessEnv.ts` — Exposes `NEXT_PUBLIC_*` env vars to client
- `restart.ts` — Triggers HMR when page/layout/route files change
- `restartEnvFileChange.ts` — Restarts dev server on `.env` changes

### Path Aliases

- `@/*` → `./src/*` (tsconfig + vite)
- `lodash` → `lodash-es`
- `stripe` → `./src/__create/stripe`
- `@auth/create` → custom auth adapter

## Conventions

- Pages are `.jsx`, framework/config files are `.ts`/`.tsx`
- API routes return `Response.json()` with appropriate status codes
- Error responses: `Response.json({ error: "message" }, { status: 500 })`
- SQL queries use parameterized inputs (`$1, $2`) — never string interpolation
- React Query keys follow `["resource-name", id?, filters?]` pattern
- Dashboard pages follow a consistent pattern: data table with search/filter state, pagination, CRUD mutations with query invalidation, and confirmation modals for destructive actions
- Navigation uses React Router's `useNavigate()` and `<Link>` — never `window.location.href` (enforced by tests)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (Neon for prod, local pg for dev)
- `AUTH_SECRET` — Auth session signing key (required for auth to work)
- `ANYTHING_PROJECT_TOKEN` — Project token (in .env)
- `NEXT_PUBLIC_*` — Client-exposed variables
- `CORS_ORIGINS` — Comma-separated CORS allowlist
- Do NOT set `AUTH_URL` — use `basePath: '/api/auth'` in auth config instead

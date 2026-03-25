# GymFlow Admin

Gym management system with a web admin dashboard. Built with React Router v7, Hono server, and PostgreSQL.

## Features

- Member management (profiles, subscriptions, payments)
- Attendance tracking (members, trainers, staff)
- Payment recording and reporting
- Membership plans and subscriptions
- Trainer and staff management
- Inventory management (items, categories, stock movements)
- Dashboard with real-time stats

## Tech Stack

- **Frontend:** React 18, React Router v7, Tailwind CSS, Chakra UI, React Query
- **Backend:** Hono (Node.js), PostgreSQL (Neon serverless / local pg)
- **Auth:** @auth/core + @hono/auth-js, JWT sessions, argon2 password hashing
- **Dev Tools:** Vite 6, Vitest, TypeScript, Bun

## Quick Start

See [DEV-SETUP.md](DEV-SETUP.md) for full setup instructions.

```bash
cd apps/web
bun install
bun run dev
```

Default port: **4000**

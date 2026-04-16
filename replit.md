# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Elite Store Project

### Overview
A professional Arabic-first digital products store and game top-up platform. Dark gaming + fintech style. Multi-language, multi-currency.

### Design System
- Primary: #6C5CE7 (Elite Purple), Secondary: #00CEC9 (Neon Cyan), Accent: #FD79A8
- Background: #0F172A, Cards: #111827, Border: #1F2937
- CSS classes: `.glass-card`, `.glass-dark`, `.neon-text`, `.neon-text-cyan`, `.neon-border`, `.gradient-btn-primary`, `.shine-card`, `.pulse-glow`, `.ticker-text`

### Features
- Multi-language (AR/EN), multi-currency (USD/SYP/EUR)
- 12 category cards on home page (3-column grid, 2×2 icon grid per card, VIP badge, gradient overlays) — matches shams4store.com style
- Home page category layout updated to a wider responsive Shams4Store-style section grid with fixed category routing and a community notice panel
- Products page now groups products into organized service/game sections first, with fallback section cards if product API data is unavailable
- Animated announcement ticker at top of every page (gradient purple-cyan)
- Stats bar on home page (24/7, 100%, 500+, 10K+)
- Products synced from shams4store API (`SHAMS4STORE_API_TOKEN` env var, shared environment)
- Full admin panel at `/admin` (login: ZEAN.23 / ZEAN333ZEAN#)
- Wallet system: Syriatel Cash (14816688) + ShamCash (wallet: zean677, ID: 5649dd63431812890980008b5b1c3d53)
- Dynamic SYP rate from admin settings API (use-settings.ts hook, staleTime 5min)
- Orders page with Arabic status tabs + date filter + search
- Development PostgreSQL database was provisioned and schema pushed; API seed created default admin, demo user, 46 demo products, and 12 categories

### shams4store API
- Base URL: `https://api.shams4store.com/client/api/`
- Auth: `api-token` header (NOT query param — query param doesn't work)
- Product types: `amount` (unit price × min_qty = effective price), `package`/`Package`/`specificPackage`/`stock` (fixed price)
- Sync route: `POST /api/admin/products` (requires admin JWT)

### DB Schema Notes
- `products.priceUsd` = effective price (for `amount` type: unit_price × min_qty)
- `products.unitPriceUsd` = raw unit price from API
- `products.productType` = `amount` | `package` | etc.
- `products.qtyMin` / `products.qtyMax` = quantity limits for amount-type products

### Admin Credentials
- Username: `ZEAN.23`, Password: `ZEAN333ZEAN#`, Email: `zean23@elitestore.admin`
- Seeded on every server start in `artifacts/api-server/src/index.ts`

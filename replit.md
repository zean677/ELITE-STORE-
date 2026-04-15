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
A digital products store and game top-up platform with dark gaming UI.

### Features
- Multi-language (AR/EN), multi-currency (USD/SYP/EUR)
- Products synced from shams4store API (`SHAMS4STORE_API_TOKEN` env var, shared environment)
- Full admin panel at `/admin` (login: ZEAN.23 / ZEAN333ZEAN#)
- Dark gaming UI with category-based color system
- Wallet system, Syriatel Cash + ShamCash payments (planned)

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

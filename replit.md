# Elite Store

Elite Store is an e-commerce platform offering digital products, primarily games and top-ups, with features for both customers and administrators.

## Run & Operate

- Run DB schema push: `pnpm --filter @workspace/db run push`
- Run API server: `pnpm --filter @workspace/api-server run dev`
- Run frontend: `pnpm --filter @workspace/elite-store run dev`
- Regenerate API hooks/schemas: `pnpm --filter @workspace/api-spec run codegen`

**Required Environment Variables:**
- `TELEGRAM_BOT_TOKEN`: Bot token for Telegram integration.
- `TELEGRAM_ADMIN_CHAT_ID`: Admin chat ID for Telegram notifications.
- `AHMINIX_API_KEY`: API key for Ahminix provider.
- `OWNER_FALLBACK_CHAT_ID`: (Optional) Fallback owner chat ID for Telegram.
- `TELEGRAM_EXTRA_ADMIN_IDS`: (Optional) Comma-separated additional admin chat IDs.

## Stack

- **Monorepo:** pnpm workspaces
- **Node.js:** 24
- **Package Manager:** pnpm
- **API Framework:** Express 5
- **Database:** PostgreSQL + Drizzle ORM
- **Validation:** Zod (`zod/v4`), `drizzle-zod`
- **API Codegen:** Orval (from OpenAPI spec)
- **API Build:** esbuild
- **Frontend:** React + Vite

## Where things live

- **Frontend Application:** `artifacts/elite-store`
- **Backend API:** `artifacts/api-server`
- **DB Schema:** `lib/db/src/schema/`
- **API Contracts/OpenAPI Spec:** `artifacts/api-spec` (source for `orval` codegen)
- **Admin Backend Routes:** `api-server/src/routes/admin.ts`, `api-server/src/routes/admin-extra.ts`
- **Shared Permissions:** `lib/permissions.ts`
- **Telegram Bot Logic:** `lib/telegram-queue.ts`, `lib/stuck-monitor.ts`, `lib/bot-health-monitor.ts`
- **Provider Integration:** `lib/providers.ts`
- **Order Automation:** `lib/retry-scheduler.ts`, `lib/order-actions.ts`, `lib/order-poller.ts`, `lib/order-timeout.ts`
- **Deployment Scripts:** `scripts/backup-db.sh`, `DEPLOYMENT.md`

## Architecture decisions

- **Game Grouping Logic:** `product.description` field is used as the source of truth for `Shams4Store` game/category labels to group products.
- **Image Proxy & Caching:** `GET /api/logo?domain=example.com` provides an in-memory 24-hour cached image proxy for external product images.
- **Asynchronous Order Dispatch:** External provider dispatch runs in the background to prevent checkout blocking due to provider latency.
- **Automatic VIP Promotion:** Completed orders increment user VIP spending and can automatically promote users to higher VIP levels.
- **Smart Provider Failover:** If a primary provider fails with a transient error, the system attempts to fulfill the order via an alternate provider for the same product before retrying or refunding.
- **Session Management:** User sessions are managed via JWTs with `jti` claims, stored in a `user_sessions` table, and validated on each request, allowing for multi-device login management.

## Product

- **User Accounts:** Registration, login (email-based), 2FA (TOTP), password reset, login history, and device session management.
- **Product Catalog:** Browse products by categories and games, search functionality.
- **Shopping & Checkout:** Add to cart, apply promo codes, gift to friend option, VIP discounts, wallet deductions.
- **Order Management:** View order history, track order status, order detail pages with delivery codes.
- **Wishlist:** Users can save products to a wishlist.
- **Product Reviews:** Users can submit reviews for products.
- **VIP System:** Tiered VIP levels based on total spending, offering escalating discounts.
- **Telegram Integration:** Two-way bot integration for admin commands and user/admin notifications.
- **Admin Panel:**
    - CRUD for products, categories, payment methods, promo codes, staff roles, scheduled notifications.
    - Global admin search (users, orders, products).
    - Bulk order actions (approve/reject/retry).
    - Urgent issues panel for monitoring critical system states.
    - Internal customer notes.
    - Homepage section management.
    - CSV exports for various data entities.
    - Product change history.
    - Smart price suggestions.
    - Maintenance mode toggle.
    - System health endpoint.
    - Best sellers and top customers dashboard.

## User preferences

_Populate as you build_

## Gotchas

- **DB Schema Changes:** Always run `pnpm --filter @workspace/db run push` after modifying `lib/db/src/schema/`.
- **API Spec Changes:** Always run `pnpm --filter @workspace/api-spec run codegen` after modifying the OpenAPI spec to regenerate client hooks and Zod schemas.
- **Telegram Bot Configuration:** The Telegram bot requires `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` environment variables; it will not function without them.
- **Login Credentials:** The login endpoint expects an `email`, not a `username`.
- **Game Grouping:** The `product.description` field is critical for correct game grouping and navigation logic; ensure it accurately reflects the Shams4Store `category_name` / game label.
- **Profit Margin Enforcement:** Products with upstream price = 0 SYP are auto-marked inactive during sync. Orders will fail if the sell price is less than the provider cost unless `enforce_profit_margin` is disabled.

## Pointers

- **Drizzle ORM Docs:** [https://orm.drizzle.team/docs/overview](https://orm.drizzle.team/docs/overview)
- **Express.js Docs:** [https://expressjs.com/](https://expressjs.com/)
- **React Docs:** [https://react.dev/](https://react.dev/)
- **Vite Docs:** [https://vitejs.dev/](https://vitejs.dev/)
- **Zod Docs:** [https://zod.dev/](https://zod.dev/)
- **Orval Docs:** [https://orval.dev/](https://orval.dev/)
- **pnpm Workspaces:** [https://pnpm.io/workspaces](https://pnpm.io/workspaces)
- **Shams4Store API Docs:** _(Assumed external documentation)_
- **Mega Game API Docs:** _(Assumed external documentation)_
- **Ahminix API Docs:** [https://store.ahminix.com/api-docs/](https://store.ahminix.com/api-docs/)
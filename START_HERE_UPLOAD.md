# Elite Store — Complete Upload Package

This package is intended to be uploaded as one complete project folder. It includes source code, built frontend files, built API files, local installed dependencies, Docker deployment files, database schema, and Telegram bot code.

## What is included

- Website frontend: `artifacts/elite-store`
- Built frontend: `artifacts/elite-store/dist/public`
- API/server: `artifacts/api-server`
- Built API: `artifacts/api-server/dist`
- Telegram bot/admin command panel: `artifacts/api-server/src/lib/telegram.ts`
- Database schema: `lib/db/src/schema`
- Installed dependencies: `node_modules` folders
- Deployment files: `Dockerfile`, `docker-compose.yml`, `deploy.sh`, `.env.example`

## Fastest VPS/Docker run

1. Upload and extract this archive on the server.
2. Copy `.env.example` to `.env`.
3. Fill these values in `.env`:
   - `POSTGRES_PASSWORD`
   - `SESSION_SECRET`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_ADMIN_CHAT_ID`
   - `SITE_URL`
   - `TELEGRAM_WEBHOOK_URL`
   - `ALLOWED_ORIGINS`
   - `SHAMS4STORE_API_TOKEN`
   - `AHMINIX_API_KEY` if used
4. Run:

```bash
bash deploy.sh
```

The app runs on port `8080` and serves both the website and API from the same server.

## Direct Node run

If the hosting provider does not use Docker:

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push
PORT=8080 BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/elite-store run build
pnpm --filter @workspace/api-server run build
PORT=8080 NODE_ENV=production pnpm --filter @workspace/api-server run start
```

## Telegram bot readiness

The Telegram bot is part of the API server. When the API starts in production and `TELEGRAM_BOT_TOKEN` plus `SITE_URL` or `TELEGRAM_WEBHOOK_URL` are set, the server configures the Telegram webhook at:

`/api/telegram/webhook`

Admin chat ID currently used:

`2113043286`

Admin commands include:

- `/admin`
- `/stats`
- `/orders`
- `/balance`
- `/find TERM`
- `/product PRODUCT_ID`
- `/price PRODUCT_ID PRICE`
- `/toggle PRODUCT_ID`
- `/markup PERCENT`

## Admin login

- URL: `/admin`
- Email: `zean23@elitestore.admin`
- Password: `Zean333zean#`

## Important

A public domain with HTTPS is required for Telegram webhooks to work reliably. After upload, set `SITE_URL` to the real public website URL.
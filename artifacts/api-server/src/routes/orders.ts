import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, usersTable, walletTransactionsTable, notificationsTable, settingsTable } from "@workspace/db";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../lib/auth";
import { CreateOrderBody, GetOrdersQueryParams, GetOrderParams } from "@workspace/api-zod";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  SYP: 13000,
  EUR: 0.92,
};

async function getSettingVal(key: string, def: string): Promise<string> {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  return row?.value ?? def;
}

async function dispatchToProvider(order: any, product: any): Promise<{ success: boolean; providerOrderId?: string; error?: string }> {
  try {
    const provider = product.provider ?? "manual";

    if (provider === "shams4store") {
      const token = await getSettingVal("shams4store_api_token", process.env.SHAMS4STORE_API_TOKEN ?? "");
      if (!token) return { success: false, error: "SHAMS4STORE API token not configured" };

      const baseUrl = await getSettingVal("shams4store_base_url", "https://api.shams4store.com/client/api/");
      const providerProductId = product.providerProductId;

      const body: Record<string, any> = {
        order_uuid: order.id,
        playerId: order.playerId ?? "",
        qty: order.qty,
      };

      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/newOrder/${providerProductId}`, {
        method: "POST",
        headers: { "api-token": token.trim(), "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        return { success: false, error: `Provider returned ${response.status}: ${text.slice(0, 200)}` };
      }

      const data = await response.json();
      return { success: true, providerOrderId: String(data?.order_id ?? data?.id ?? order.id) };
    }

    if (provider === "ahminix") {
      const apiKey = await getSettingVal("ahminix_api_key", process.env.AHMINIX_API_KEY ?? "");
      if (!apiKey) return { success: false, error: "AHMINIX API key not configured" };

      const baseUrl = await getSettingVal("ahminix_base_url", "https://store.ahminix.com/client/api/");
      const providerProductId = product.providerProductId;

      const body: Record<string, any> = {
        qty: order.qty,
        playerId: order.playerId ?? "",
        order_uuid: order.id,
      };

      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/newOrder/${providerProductId}`, {
        method: "POST",
        headers: { "api-key": apiKey.trim(), "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        return { success: false, error: `Provider returned ${response.status}: ${text.slice(0, 200)}` };
      }

      const data = await response.json();
      return { success: true, providerOrderId: String(data?.order_id ?? data?.id ?? order.id) };
    }

    // Manual products — admin processes manually
    return { success: true, providerOrderId: order.id };
  } catch (err: any) {
    logger.error({ err, orderId: order.id }, "Provider dispatch failed");
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}

router.get("/orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const qp = GetOrdersQueryParams.safeParse(req.query);
  const page = qp.success ? (qp.data.page ?? 1) : 1;
  const limit = qp.success ? (qp.data.limit ?? 20) : 20;
  const status = qp.success ? qp.data.status : undefined;
  const offset = (page - 1) * limit;

  const conditions = [eq(ordersTable.userId, req.user!.id)];
  if (status) {
    conditions.push(eq(ordersTable.status, status));
  }
  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

  const [totalResult] = await db.select({ count: count() }).from(ordersTable).where(whereClause);
  const orders = await db
    .select()
    .from(ordersTable)
    .where(whereClause)
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    orders: orders.map(o => ({ ...o, totalPrice: parseFloat(o.totalPrice ?? "0") })),
    total: totalResult?.count ?? 0,
    page,
    limit,
  });
});

router.post("/orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { productId, qty, playerId, currency = "USD" } = parsed.data;

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product || product.status !== "active") {
    res.status(404).json({ error: "Product not found or inactive" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const rate = CURRENCY_RATES[currency] ?? 1;
  const priceUsd = parseFloat(product.priceUsd ?? "0");
  const totalPrice = priceUsd * qty * rate;
  const userBalance = parseFloat(user.balance ?? "0") * rate;

  if (userBalance < totalPrice) {
    res.status(400).json({ error: "Insufficient balance", message: "Your wallet balance is insufficient for this order" });
    return;
  }

  const orderId = uuidv4();
  const deductUsd = priceUsd * qty;

  await db
    .update(usersTable)
    .set({ balance: sql`${usersTable.balance} - ${deductUsd.toString()}` })
    .where(eq(usersTable.id, req.user!.id));

  await db.insert(walletTransactionsTable).values({
    userId: req.user!.id,
    type: "purchase",
    amount: (-deductUsd).toString(),
    currency: "USD",
    description: `Order: ${product.name} x${qty}`,
  });

  const [order] = await db
    .insert(ordersTable)
    .values({
      id: orderId,
      userId: req.user!.id,
      productId,
      productName: product.name,
      qty,
      playerId: playerId ?? null,
      totalPrice: totalPrice.toString(),
      currency,
      status: "processing",
      providerOrderId: null,
    })
    .returning();

  await db.insert(notificationsTable).values({
    userId: req.user!.id,
    type: "order_completed",
    title: "Order Placed",
    message: `Your order for ${product.name} (x${qty}) has been placed and is being processed.`,
    isRead: false,
  });

  logger.info({ orderId, userId: req.user!.id, productId }, "Order created");

  // Dispatch to provider in the background (non-blocking)
  dispatchToProvider(order, product).then(async (result) => {
    if (result.success) {
      await db.update(ordersTable).set({ status: "completed", providerOrderId: result.providerOrderId ?? null, updatedAt: new Date() }).where(eq(ordersTable.id, orderId));
      await db.insert(notificationsTable).values({
        userId: req.user!.id,
        type: "order_completed",
        title: "تم إتمام الطلب",
        message: `تم تنفيذ طلبك لـ ${product.name} (x${qty}) بنجاح.`,
        isRead: false,
      });
    } else {
      await db.update(ordersTable).set({ status: "failed", updatedAt: new Date() }).where(eq(ordersTable.id, orderId));
      logger.warn({ orderId, error: result.error }, "Provider dispatch failed, order marked failed");
    }
  }).catch((err) => {
    logger.error({ err, orderId }, "Background provider dispatch threw");
  });

  res.status(201).json({ ...order, totalPrice: parseFloat(order.totalPrice ?? "0") });
});

router.get("/orders/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, rawId), eq(ordersTable.userId, req.user!.id)));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({ ...order, totalPrice: parseFloat(order.totalPrice ?? "0") });
});

export default router;

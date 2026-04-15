import { Router, type IRouter } from "express";
import { db, usersTable, ordersTable, paymentsTable, productsTable, walletTransactionsTable, notificationsTable } from "@workspace/db";
import { eq, desc, and, count, sum, gte, sql, like } from "drizzle-orm";
import { requireAdmin, AuthRequest } from "../lib/auth";
import { VerifyPaymentBody, GetAdminOrdersQueryParams, GetAdminPaymentsQueryParams, GetAdminUsersQueryParams, UpdateUserBalanceBody, SuspendUserBody } from "@workspace/api-zod";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/admin/dashboard", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const [totalRevenueResult] = await db
    .select({ total: sum(ordersTable.totalPrice) })
    .from(ordersTable)
    .where(eq(ordersTable.status, "completed"));

  const [totalOrdersResult] = await db.select({ count: count() }).from(ordersTable);
  const [totalUsersResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "user"));
  const [pendingPaymentsResult] = await db.select({ count: count() }).from(paymentsTable).where(eq(paymentsTable.status, "pending"));
  const [completedOrdersResult] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "completed"));
  const [failedOrdersResult] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "failed"));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [revenueTodayResult] = await db
    .select({ total: sum(ordersTable.totalPrice) })
    .from(ordersTable)
    .where(and(eq(ordersTable.status, "completed"), gte(ordersTable.createdAt, todayStart)));

  const [ordersTodayResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, todayStart));

  const topProductsRaw = await db
    .select({
      productId: ordersTable.productId,
      productName: ordersTable.productName,
      orderCount: count(),
      revenue: sum(ordersTable.totalPrice),
    })
    .from(ordersTable)
    .groupBy(ordersTable.productId, ordersTable.productName)
    .orderBy(desc(count()))
    .limit(5);

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  res.json({
    totalRevenue: parseFloat(totalRevenueResult?.total ?? "0"),
    totalOrders: totalOrdersResult?.count ?? 0,
    totalUsers: totalUsersResult?.count ?? 0,
    pendingPayments: pendingPaymentsResult?.count ?? 0,
    completedOrders: completedOrdersResult?.count ?? 0,
    failedOrders: failedOrdersResult?.count ?? 0,
    revenueToday: parseFloat(revenueTodayResult?.total ?? "0"),
    ordersToday: ordersTodayResult?.count ?? 0,
    topProducts: topProductsRaw.map(p => ({
      productId: p.productId,
      productName: p.productName,
      orderCount: p.orderCount,
      revenue: parseFloat(p.revenue ?? "0"),
    })),
    recentOrders: recentOrders.map(o => ({ ...o, totalPrice: parseFloat(o.totalPrice ?? "0") })),
  });
});

router.get("/admin/orders", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const qp = GetAdminOrdersQueryParams.safeParse(req.query);
  const page = qp.success ? (qp.data.page ?? 1) : 1;
  const limit = qp.success ? (qp.data.limit ?? 20) : 20;
  const status = qp.success ? qp.data.status : undefined;
  const offset = (page - 1) * limit;

  const conditions = status ? [eq(ordersTable.status, status)] : [];
  const whereClause = conditions.length > 0 ? conditions[0] : undefined;

  const totalQ = whereClause
    ? db.select({ count: count() }).from(ordersTable).where(whereClause)
    : db.select({ count: count() }).from(ordersTable);

  const ordersQ = whereClause
    ? db.select().from(ordersTable).where(whereClause).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset)
    : db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);

  const [[totalResult], orders] = await Promise.all([totalQ, ordersQ]);

  res.json({
    orders: orders.map(o => ({ ...o, totalPrice: parseFloat(o.totalPrice ?? "0") })),
    total: totalResult?.count ?? 0,
    page,
    limit,
  });
});

router.post("/admin/orders/:id/retry", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [order] = await db
    .update(ordersTable)
    .set({ status: "processing", updatedAt: new Date() })
    .where(and(eq(ordersTable.id, rawId), eq(ordersTable.status, "failed")))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found or not in failed state" });
    return;
  }

  logger.info({ orderId: rawId }, "Order retry requested by admin");
  res.json({ ...order, totalPrice: parseFloat(order.totalPrice ?? "0") });
});

router.get("/admin/payments", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const qp = GetAdminPaymentsQueryParams.safeParse(req.query);
  const status = qp.success ? qp.data.status : undefined;

  const payments = status
    ? await db.select().from(paymentsTable).where(eq(paymentsTable.status, status)).orderBy(desc(paymentsTable.createdAt))
    : await db.select().from(paymentsTable).orderBy(desc(paymentsTable.createdAt));

  res.json(payments.map(p => ({ ...p, amount: parseFloat(p.amount ?? "0") })));
});

router.post("/admin/payments/:id/verify", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const parsed = VerifyPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { action, adminNote } = parsed.data;
  const newStatus = action === "approve" ? "approved" : "rejected";

  const [payment] = await db
    .update(paymentsTable)
    .set({ status: newStatus, adminNote: adminNote ?? null })
    .where(eq(paymentsTable.id, id))
    .returning();

  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  if (action === "approve") {
    const amountUsd = parseFloat(payment.amount ?? "0");
    const convertedToUsd = payment.currency === "SYP" ? amountUsd / 13000 : payment.currency === "EUR" ? amountUsd / 0.92 : amountUsd;

    await db
      .update(usersTable)
      .set({ balance: sql`${usersTable.balance} + ${convertedToUsd.toString()}` })
      .where(eq(usersTable.id, payment.userId));

    await db.insert(walletTransactionsTable).values({
      userId: payment.userId,
      type: "deposit",
      amount: convertedToUsd.toString(),
      currency: "USD",
      description: `Deposit via ${payment.method} (${payment.currency} ${payment.amount})`,
    });

    await db.insert(notificationsTable).values({
      userId: payment.userId,
      type: "payment_approved",
      title: "Payment Approved",
      message: `Your deposit of ${payment.currency} ${payment.amount} has been approved and added to your wallet.`,
      isRead: false,
    });
  }

  logger.info({ paymentId: id, action, adminId: req.user!.id }, "Payment verified by admin");
  res.json({ ...payment, amount: parseFloat(payment.amount ?? "0") });
});

router.get("/admin/users", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const qp = GetAdminUsersQueryParams.safeParse(req.query);
  const page = qp.success ? (qp.data.page ?? 1) : 1;
  const limit = qp.success ? (qp.data.limit ?? 20) : 20;
  const search = qp.success ? qp.data.search : undefined;
  const offset = (page - 1) * limit;

  const conditions = search ? [like(usersTable.email, `%${search}%`)] : [];
  const whereClause = conditions.length > 0 ? conditions[0] : undefined;

  const totalQ = whereClause
    ? db.select({ count: count() }).from(usersTable).where(whereClause)
    : db.select({ count: count() }).from(usersTable);

  const usersQ = whereClause
    ? db.select().from(usersTable).where(whereClause).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset)
    : db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);

  const [[totalResult], users] = await Promise.all([totalQ, usersQ]);

  res.json({
    users: users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      balance: parseFloat(u.balance ?? "0"),
      isSuspended: u.isSuspended,
      createdAt: u.createdAt,
    })),
    total: totalResult?.count ?? 0,
    page,
    limit,
  });
});

router.patch("/admin/users/:id/balance", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = parseInt(rawId, 10);

  const parsed = UpdateUserBalanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { amount, operation, reason } = parsed.data;

  let newBalanceSql;
  if (operation === "add") {
    newBalanceSql = sql`${usersTable.balance} + ${amount.toString()}`;
  } else if (operation === "subtract") {
    newBalanceSql = sql`${usersTable.balance} - ${amount.toString()}`;
  } else {
    newBalanceSql = sql`${amount.toString()}`;
  }

  const [user] = await db
    .update(usersTable)
    .set({ balance: newBalanceSql })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await db.insert(walletTransactionsTable).values({
    userId,
    type: operation === "subtract" ? "purchase" : "deposit",
    amount: (operation === "subtract" ? -amount : amount).toString(),
    currency: "USD",
    description: reason ?? `Admin balance adjustment (${operation})`,
  });

  await db.insert(notificationsTable).values({
    userId,
    type: "balance_updated",
    title: "Balance Updated",
    message: `Your balance has been updated by an administrator.`,
    isRead: false,
  });

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    balance: parseFloat(user.balance ?? "0"),
    isSuspended: user.isSuspended,
    createdAt: user.createdAt,
  });
});

router.patch("/admin/users/:id/suspend", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = parseInt(rawId, 10);

  const parsed = SuspendUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ isSuspended: parsed.data.suspended })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    balance: parseFloat(user.balance ?? "0"),
    isSuspended: user.isSuspended,
    createdAt: user.createdAt,
  });
});

router.post("/admin/products", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const SHAMS_TOKEN = process.env.SHAMS4STORE_API_TOKEN;

  if (!SHAMS_TOKEN) {
    res.status(500).json({ error: "SHAMS4STORE_API_TOKEN is not configured" });
    return;
  }

  let synced = 0;
  let failed = 0;
  let skipped = 0;

  const categoryMap: Record<string, string> = {
    "التطبيقات": "services",
    "Applications": "services",
    "ألعاب الهاتف": "mobile_games",
    "Mobile Games": "mobile_games",
    "ألعاب الكمبيوتر": "pc_games",
    "PC Games": "pc_games",
    "بطاقات هدية": "gift_cards",
    "Gift Cards": "gift_cards",
  };

  function mapCategory(catName: string): string {
    for (const [key, val] of Object.entries(categoryMap)) {
      if (catName.toLowerCase().includes(key.toLowerCase())) return val;
    }
    if (catName.toLowerCase().includes("game") || catName.toLowerCase().includes("pubg") || catName.toLowerCase().includes("free fire") || catName.toLowerCase().includes("clash")) return "mobile_games";
    if (catName.toLowerCase().includes("steam") || catName.toLowerCase().includes("pc")) return "pc_games";
    if (catName.toLowerCase().includes("card") || catName.toLowerCase().includes("gift") || catName.toLowerCase().includes("itunes") || catName.toLowerCase().includes("google")) return "gift_cards";
    return "general";
  }

  try {
    const cleanToken = SHAMS_TOKEN.trim();
    const response = await fetch(`https://api.shams4store.com/client/api/products`, {
      method: "GET",
      headers: {
        "api-token": cleanToken,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logger.error({ status: response.status, body }, "shams4store API error");
      res.status(502).json({ error: `shams4store API returned ${response.status}`, detail: body });
      return;
    }

    const products: Array<{
      id: number;
      name: string;
      description?: string;
      price: number;
      params: string[];
      category_name: string;
      available: boolean;
      product_type: string;
      parent_id: number;
      qty_values?: { min?: number; max?: number } | null;
    }> = await response.json();

    for (const p of products) {
      try {
        const productId = `shams_${p.id}`;
        const category = mapCategory(p.category_name);
        const unitPrice = typeof p.price === "number" ? p.price : parseFloat(String(p.price));
        const qtyMin = p.qty_values?.min ?? null;
        const qtyMax = p.qty_values?.max ?? null;

        // For "amount" type, effective price = unit_price * min_qty
        // For package/stock types, price is fixed per product
        const effectivePrice =
          p.product_type === "amount" && qtyMin && qtyMin > 0
            ? unitPrice * qtyMin
            : unitPrice;

        await db
          .insert(productsTable)
          .values({
            id: productId,
            name: p.name,
            nameAr: p.name,
            description: p.description ?? null,
            category,
            provider: "shams4store",
            providerProductId: String(p.id),
            priceUsd: String(effectivePrice),
            unitPriceUsd: String(unitPrice),
            requiredFields: p.params ?? [],
            status: p.available ? "active" : "inactive",
            profitMargin: "10",
            productType: p.product_type ?? "package",
            qtyMin: qtyMin !== null ? String(qtyMin) : null,
            qtyMax: qtyMax !== null ? String(qtyMax) : null,
          })
          .onConflictDoUpdate({
            target: productsTable.id,
            set: {
              name: p.name,
              priceUsd: String(effectivePrice),
              unitPriceUsd: String(unitPrice),
              status: p.available ? "active" : "inactive",
              requiredFields: p.params ?? [],
              productType: p.product_type ?? "package",
              qtyMin: qtyMin !== null ? String(qtyMin) : null,
              qtyMax: qtyMax !== null ? String(qtyMax) : null,
            },
          });
        synced++;
      } catch (err) {
        logger.error({ err, productId: p.id }, "Failed to upsert product");
        failed++;
      }
    }
  } catch (err) {
    logger.error({ err }, "Failed to fetch from shams4store");
    res.status(502).json({ error: "Failed to connect to shams4store API" });
    return;
  }

  logger.info({ synced, failed, skipped }, "Products sync from shams4store completed");
  res.json({ synced, failed, skipped, message: `Synced ${synced} products from shams4store` });
});

router.get("/admin/revenue-chart", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const period = (req.query.period as string) ?? "30d";
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      date: sql<string>`DATE(${ordersTable.createdAt})`.as("date"),
      revenue: sum(ordersTable.totalPrice),
      orders: count(),
    })
    .from(ordersTable)
    .where(and(gte(ordersTable.createdAt, startDate), eq(ordersTable.status, "completed")))
    .groupBy(sql`DATE(${ordersTable.createdAt})`)
    .orderBy(sql`DATE(${ordersTable.createdAt})`);

  res.json(result.map(r => ({
    date: r.date,
    revenue: parseFloat(r.revenue ?? "0"),
    orders: r.orders,
  })));
});

router.post("/admin/products/create", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { name, nameAr, description, image, priceUsd, category, provider, providerProductId, requiredFields, status, profitMargin } = req.body;

  if (!name || priceUsd === undefined || !category || !provider) {
    res.status(400).json({ error: "name, priceUsd, category, and provider are required" });
    return;
  }

  const id = uuidv4();
  const [product] = await db
    .insert(productsTable)
    .values({
      id,
      name,
      nameAr: nameAr ?? null,
      description: description ?? null,
      image: image ?? null,
      priceUsd: String(priceUsd),
      category: category ?? "general",
      provider: provider ?? "manual",
      providerProductId: providerProductId ?? id,
      requiredFields: requiredFields ?? [],
      status: status ?? "active",
      profitMargin: String(profitMargin ?? 10),
    })
    .returning();

  res.status(201).json({
    ...product,
    priceUsd: parseFloat(product.priceUsd ?? "0"),
    profitMargin: parseFloat(product.profitMargin ?? "10"),
    requiredFields: product.requiredFields ?? [],
  });
});

router.put("/admin/products/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const productId = req.params.id;
  const { name, nameAr, description, image, priceUsd, category, status, profitMargin } = req.body;

  const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (nameAr !== undefined) updateData.nameAr = nameAr;
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (priceUsd !== undefined) updateData.priceUsd = String(priceUsd);
  if (category !== undefined) updateData.category = category;
  if (status !== undefined) updateData.status = status;
  if (profitMargin !== undefined) updateData.profitMargin = String(profitMargin);

  const [updated] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, productId))
    .returning();

  res.json({
    ...updated,
    priceUsd: parseFloat(updated.priceUsd ?? "0"),
    profitMargin: parseFloat(updated.profitMargin ?? "10"),
    requiredFields: updated.requiredFields ?? [],
  });
});

router.delete("/admin/products/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const productId = req.params.id;

  const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, productId));
  res.json({ success: true });
});

export default router;

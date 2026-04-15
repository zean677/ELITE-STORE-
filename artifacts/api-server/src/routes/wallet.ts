import { Router, type IRouter } from "express";
import { db, usersTable, walletTransactionsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../lib/auth";
import { GetWalletHistoryQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/wallet", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ balance: parseFloat(user.balance ?? "0"), currency: "USD" });
});

router.get("/wallet/history", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const qp = GetWalletHistoryQueryParams.safeParse(req.query);
  const page = qp.success ? (qp.data.page ?? 1) : 1;
  const limit = qp.success ? (qp.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;

  const [totalResult] = await db
    .select({ count: count() })
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, req.user!.id));

  const transactions = await db
    .select()
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, req.user!.id))
    .orderBy(desc(walletTransactionsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    transactions: transactions.map(t => ({
      ...t,
      amount: parseFloat(t.amount ?? "0"),
    })),
    total: totalResult?.count ?? 0,
    page,
    limit,
  });
});

export default router;

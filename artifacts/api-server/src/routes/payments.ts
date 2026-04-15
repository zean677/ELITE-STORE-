import { Router, type IRouter } from "express";
import { db, paymentsTable, usersTable, walletTransactionsTable, notificationsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, AuthRequest } from "../lib/auth";
import { CreatePaymentBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/payment/my", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const payments = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.userId, req.user!.id))
    .orderBy(desc(paymentsTable.createdAt));

  res.json(payments.map(p => ({ ...p, amount: parseFloat(p.amount ?? "0") })));
});

router.post("/payment/create", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { amount, currency, method, screenshotUrl } = parsed.data;

  const [payment] = await db
    .insert(paymentsTable)
    .values({
      userId: req.user!.id,
      amount: amount.toString(),
      currency,
      method,
      status: "pending",
      screenshotUrl: screenshotUrl ?? null,
      adminNote: null,
    })
    .returning();

  res.status(201).json({ ...payment, amount: parseFloat(payment.amount ?? "0") });
});

export default router;

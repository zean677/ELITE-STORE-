import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, req.user!.id))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  res.json(notifications);
});

router.patch("/notifications/:id/read", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  const [notification] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.user!.id)))
    .returning();

  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json(notification);
});

export default router;

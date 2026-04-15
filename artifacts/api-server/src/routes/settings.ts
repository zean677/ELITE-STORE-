import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin, AuthRequest } from "../lib/auth";

const router: IRouter = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  syp_rate: "13000",
  eur_rate: "0.92",
  default_profit_margin: "10",
};

async function getSetting(key: string): Promise<string> {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  return row?.value ?? DEFAULT_SETTINGS[key] ?? "";
}

router.get("/settings", async (req, res): Promise<void> => {
  const rows = await db.select().from(settingsTable);
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    map[row.key] = row.value;
  }
  res.json(map);
});

router.put("/admin/settings", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { syp_rate, eur_rate, default_profit_margin } = req.body;

  const updates: { key: string; value: string }[] = [];
  if (syp_rate !== undefined) updates.push({ key: "syp_rate", value: String(syp_rate) });
  if (eur_rate !== undefined) updates.push({ key: "eur_rate", value: String(eur_rate) });
  if (default_profit_margin !== undefined) updates.push({ key: "default_profit_margin", value: String(default_profit_margin) });

  for (const { key, value } of updates) {
    await db
      .insert(settingsTable)
      .values({ key, value })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value } });
  }

  const rows = await db.select().from(settingsTable);
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) map[row.key] = row.value;
  res.json(map);
});

export { getSetting };
export default router;

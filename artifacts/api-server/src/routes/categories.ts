import { Router, type IRouter } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin, AuthRequest } from "../lib/auth";

const router: IRouter = Router();

// ── Public: GET all active categories ─────────────────────────
router.get("/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.isActive, true))
    .orderBy(asc(categoriesTable.sortOrder));
  res.json(rows);
});

// ── Admin: GET all categories (including inactive) ─────────────
router.get("/admin/categories", requireAdmin, async (_req: AuthRequest, res): Promise<void> => {
  const rows = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.sortOrder));
  res.json(rows);
});

// ── Admin: CREATE category ─────────────────────────────────────
router.post("/admin/categories", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { nameAr, nameEn, href, color, bgGradient, icon1, icon2, icon3, icon4, iconLabel1, iconLabel2, iconLabel3, iconLabel4, sortOrder, isActive } = req.body;

  if (!nameAr || !nameEn) {
    res.status(400).json({ error: "nameAr and nameEn are required" });
    return;
  }

  const [cat] = await db.insert(categoriesTable).values({
    nameAr,
    nameEn,
    href: href || "/products",
    color: color || "#6C5CE7",
    bgGradient: bgGradient || "linear-gradient(145deg, #1a0040, #2d0080)",
    icon1: icon1 || "",
    icon2: icon2 || "",
    icon3: icon3 || "",
    icon4: icon4 || "",
    iconLabel1: iconLabel1 || "",
    iconLabel2: iconLabel2 || "",
    iconLabel3: iconLabel3 || "",
    iconLabel4: iconLabel4 || "",
    sortOrder: sortOrder ?? 0,
    isActive: isActive ?? true,
  }).returning();

  res.status(201).json(cat);
});

// ── Admin: UPDATE category ─────────────────────────────────────
router.put("/admin/categories/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = Number(req.params.id);
  const { nameAr, nameEn, href, color, bgGradient, icon1, icon2, icon3, icon4, iconLabel1, iconLabel2, iconLabel3, iconLabel4, sortOrder, isActive } = req.body;

  const [updated] = await db.update(categoriesTable)
    .set({ nameAr, nameEn, href, color, bgGradient, icon1, icon2, icon3, icon4, iconLabel1, iconLabel2, iconLabel3, iconLabel4, sortOrder, isActive })
    .where(eq(categoriesTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Category not found" }); return; }
  res.json(updated);
});

// ── Admin: DELETE category ─────────────────────────────────────
router.delete("/admin/categories/:id", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ success: true });
});

export default router;

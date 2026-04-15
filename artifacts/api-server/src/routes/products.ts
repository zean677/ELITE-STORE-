import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, like, and, count, sql } from "drizzle-orm";
import { GetProductsQueryParams, GetProductParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products/categories", async (req, res): Promise<void> => {
  const categories = await db
    .selectDistinct({ category: productsTable.category })
    .from(productsTable)
    .where(eq(productsTable.status, "active"));

  const catMap: Record<string, { id: string; name: string; nameAr: string; icon: string }> = {
    "mobile_games": { id: "mobile_games", name: "Mobile Games", nameAr: "ألعاب الهاتف", icon: "📱" },
    "pc_games": { id: "pc_games", name: "PC Games", nameAr: "ألعاب الكمبيوتر", icon: "🖥️" },
    "gift_cards": { id: "gift_cards", name: "Gift Cards", nameAr: "بطاقات هدية", icon: "🎁" },
    "services": { id: "services", name: "Services", nameAr: "خدمات", icon: "⚡" },
    "general": { id: "general", name: "General", nameAr: "عام", icon: "🛍️" },
  };

  const result = await db
    .select({ category: productsTable.category, cnt: count() })
    .from(productsTable)
    .where(eq(productsTable.status, "active"))
    .groupBy(productsTable.category);

  const out = result.map(r => ({
    id: r.category,
    name: catMap[r.category]?.name ?? r.category,
    nameAr: catMap[r.category]?.nameAr ?? r.category,
    icon: catMap[r.category]?.icon ?? "🛒",
    productCount: r.cnt,
  }));

  res.json(out);
});

router.get("/products/featured", async (req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.status, "active"))
    .limit(8);

  res.json(products.map(p => ({
    ...p,
    priceUsd: parseFloat(p.priceUsd ?? "0"),
    profitMargin: parseFloat(p.profitMargin ?? "10"),
    requiredFields: p.requiredFields ?? [],
  })));
});

router.get("/products", async (req, res): Promise<void> => {
  const qp = GetProductsQueryParams.safeParse(req.query);
  const page = qp.success ? (qp.data.page ?? 1) : 1;
  const limit = qp.success ? (qp.data.limit ?? 24) : 24;
  const category = qp.success ? qp.data.category : undefined;
  const search = qp.success ? qp.data.search : undefined;
  const offset = (page - 1) * limit;

  const conditions = [eq(productsTable.status, "active")];
  if (category) {
    conditions.push(eq(productsTable.category, category));
  }
  if (search) {
    conditions.push(like(productsTable.name, `%${search}%`));
  }

  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(productsTable)
    .where(whereClause);

  const products = await db
    .select()
    .from(productsTable)
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  const categories = await db
    .selectDistinct({ category: productsTable.category })
    .from(productsTable)
    .where(eq(productsTable.status, "active"));

  res.json({
    products: products.map(p => ({
      ...p,
      priceUsd: parseFloat(p.priceUsd ?? "0"),
      profitMargin: parseFloat(p.profitMargin ?? "10"),
      requiredFields: p.requiredFields ?? [],
    })),
    total: totalResult?.count ?? 0,
    page,
    limit,
    categories: categories.map(c => c.category),
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, rawId));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({
    ...product,
    priceUsd: parseFloat(product.priceUsd ?? "0"),
    profitMargin: parseFloat(product.profitMargin ?? "10"),
    requiredFields: product.requiredFields ?? [],
  });
});

export default router;

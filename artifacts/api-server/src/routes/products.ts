import { Router, type IRouter } from "express";
import { db, productsTable, settingsTable } from "@workspace/db";
import { eq, ilike, and, count, sql, or } from "drizzle-orm";
import { GetProductsQueryParams, GetProductParams } from "@workspace/api-zod";
import { requireAdmin, AuthRequest } from "../lib/auth";

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
  const provider = qp.success ? qp.data.provider : undefined;
  const search = qp.success ? qp.data.search : undefined;
  const offset = (page - 1) * limit;

  const conditions = [eq(productsTable.status, "active")];
  if (category) {
    conditions.push(eq(productsTable.category, category));
  }
  if (provider) {
    conditions.push(eq(productsTable.provider, provider));
  }
  if (search) {
    conditions.push(or(
      ilike(productsTable.name, `%${search}%`),
      ilike(productsTable.nameAr, `%${search}%`),
      ilike(productsTable.description, `%${search}%`),
      ilike(productsTable.category, `%${search}%`),
      ilike(productsTable.provider, `%${search}%`),
    )!);
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

  const providers = await db
    .selectDistinct({ provider: productsTable.provider })
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
    filters: {
      categories: categories.map(c => c.category),
      providers: providers.map(p => p.provider),
    },
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

  const related = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.status, "active"), eq(productsTable.category, product.category), sql`${productsTable.id} <> ${rawId}`))
    .limit(8);

  res.json({
    ...product,
    priceUsd: parseFloat(product.priceUsd ?? "0"),
    unitPriceUsd: parseFloat(product.unitPriceUsd ?? "0"),
    profitMargin: parseFloat(product.profitMargin ?? "10"),
    requiredFields: product.requiredFields ?? [],
    relatedProducts: related.map(p => ({
      ...p,
      priceUsd: parseFloat(p.priceUsd ?? "0"),
      unitPriceUsd: parseFloat(p.unitPriceUsd ?? "0"),
      profitMargin: parseFloat(p.profitMargin ?? "10"),
      requiredFields: p.requiredFields ?? [],
    })),
  });
});

async function getSettingValue(key: string, def: string): Promise<string> {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  return row?.value ?? def;
}

router.post("/admin/products/sync", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { provider } = req.body as { provider?: string };

  const results: { provider: string; imported: number; errors: string[] } = {
    provider: provider ?? "all",
    imported: 0,
    errors: [],
  };

  const CATEGORY_MAP: Record<string, string> = {
    games: "mobile_games",
    mobile_games: "mobile_games",
    pc_games: "pc_games",
    gift_cards: "gift_cards",
    services: "services",
    apps: "services",
    social: "services",
    subscriptions: "services",
    ai: "services",
    design: "services",
    telecom: "general",
    crypto: "general",
    numbers: "general",
    accounts: "general",
    wholesale: "general",
    general: "general",
  };

  async function normalizeCategory(raw: string): Promise<string> {
    const key = (raw ?? "").toLowerCase().replace(/[^a-z_]/g, "_");
    return CATEGORY_MAP[key] ?? "general";
  }

  if (!provider || provider === "ahminix") {
    try {
      const apiKey = await getSettingValue("ahminix_api_key", process.env.AHMINIX_API_KEY ?? "");
      const baseUrl = await getSettingValue("ahminix_base_url", "https://store.ahminix.com/client/api/");
      if (!apiKey) {
        results.errors.push("AHMINIX API key not configured");
      } else {
        const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/products`, {
          headers: { "api-key": apiKey.trim(), Accept: "application/json" },
          signal: AbortSignal.timeout(20000),
        });
        if (!resp.ok) throw new Error(`Ahminix responded ${resp.status}`);
        const data = await resp.json();
        const items: any[] = Array.isArray(data) ? data : (data?.data ?? data?.products ?? []);
        for (const item of items) {
          try {
            const category = await normalizeCategory(item.category ?? item.type ?? "general");
            const priceUsd = parseFloat(item.price ?? item.cost ?? item.priceUsd ?? "0");
            const name = item.name ?? item.title ?? item.product_name ?? String(item.id);
            await db
              .insert(productsTable)
              .values({
                id: `ahminix_${item.id ?? item.product_id}`,
                name,
                nameAr: item.name_ar ?? item.nameAr ?? name,
                description: item.description ?? "",
                priceUsd: String(isFinite(priceUsd) ? priceUsd : 0),
                unitPriceUsd: String(isFinite(priceUsd) ? priceUsd : 0),
                profitMargin: "10",
                category,
                provider: "ahminix",
                providerProductId: String(item.id ?? item.product_id ?? ""),
                status: "active",
                requiredFields: item.required_fields ?? item.requiredFields ?? ["playerId"],
                isTopup: category === "mobile_games" || category === "pc_games",
                isFeatured: false,
                imageUrl: item.image ?? item.logo ?? null,
              })
              .onConflictDoUpdate({
                target: productsTable.id,
                set: {
                  name,
                  nameAr: item.name_ar ?? item.nameAr ?? name,
                  priceUsd: String(isFinite(priceUsd) ? priceUsd : 0),
                  status: "active",
                },
              });
            results.imported++;
          } catch (e: any) {
            results.errors.push(`ahminix item ${item.id}: ${e.message}`);
          }
        }
      }
    } catch (e: any) {
      results.errors.push(`Ahminix sync error: ${e.message}`);
    }
  }

  if (!provider || provider === "shams4store") {
    try {
      const token = await getSettingValue("shams4store_api_token", process.env.SHAMS4STORE_API_TOKEN ?? "");
      const baseUrl = await getSettingValue("shams4store_base_url", "https://api.shams4store.com/client/api/");
      if (!token) {
        results.errors.push("Shams4Store API token not configured");
      } else {
        const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/products`, {
          headers: { "api-token": token.trim(), Accept: "application/json" },
          signal: AbortSignal.timeout(20000),
        });
        if (!resp.ok) throw new Error(`Shams4Store responded ${resp.status}`);
        const data = await resp.json();
        const items: any[] = Array.isArray(data) ? data : (data?.data ?? data?.products ?? []);
        for (const item of items) {
          try {
            const category = await normalizeCategory(item.category ?? item.type ?? "general");
            const priceUsd = parseFloat(item.price ?? item.cost ?? item.priceUsd ?? "0");
            const name = item.name ?? item.title ?? item.product_name ?? String(item.id);
            await db
              .insert(productsTable)
              .values({
                id: `shams4_${item.id ?? item.product_id}`,
                name,
                nameAr: item.name_ar ?? item.nameAr ?? name,
                description: item.description ?? "",
                priceUsd: String(isFinite(priceUsd) ? priceUsd : 0),
                unitPriceUsd: String(isFinite(priceUsd) ? priceUsd : 0),
                profitMargin: "10",
                category,
                provider: "shams4store",
                providerProductId: String(item.id ?? item.product_id ?? ""),
                status: "active",
                requiredFields: item.required_fields ?? item.requiredFields ?? ["playerId"],
                isTopup: category === "mobile_games" || category === "pc_games",
                isFeatured: false,
                imageUrl: item.image ?? item.logo ?? null,
              })
              .onConflictDoUpdate({
                target: productsTable.id,
                set: {
                  name,
                  nameAr: item.name_ar ?? item.nameAr ?? name,
                  priceUsd: String(isFinite(priceUsd) ? priceUsd : 0),
                  status: "active",
                },
              });
            results.imported++;
          } catch (e: any) {
            results.errors.push(`shams4store item ${item.id}: ${e.message}`);
          }
        }
      }
    } catch (e: any) {
      results.errors.push(`Shams4Store sync error: ${e.message}`);
    }
  }

  res.json({ success: true, ...results });
});

export default router;

import { pgTable, text, serial, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  description: text("description"),
  image: text("image"),
  priceUsd: numeric("price_usd", { precision: 18, scale: 6 }).notNull().default("0"),
  unitPriceUsd: numeric("unit_price_usd", { precision: 18, scale: 8 }).default("0"),
  category: text("category").notNull().default("general"),
  provider: text("provider").notNull(),
  providerProductId: text("provider_product_id").notNull(),
  requiredFields: text("required_fields").array().notNull().default([]),
  status: text("status").notNull().default("active"),
  profitMargin: numeric("profit_margin", { precision: 5, scale: 2 }).notNull().default("10"),
  productType: text("product_type").default("package"),
  qtyMin: numeric("qty_min", { precision: 18, scale: 2 }),
  qtyMax: numeric("qty_max", { precision: 18, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

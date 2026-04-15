import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  qty: integer("qty").notNull().default(1),
  playerId: text("player_id"),
  totalPrice: numeric("total_price", { precision: 18, scale: 6 }).notNull().default("0"),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"),
  providerOrderId: text("provider_order_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

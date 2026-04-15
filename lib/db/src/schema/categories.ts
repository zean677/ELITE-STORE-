import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  href: text("href").notNull().default("/products"),
  color: text("color").notNull().default("#6C5CE7"),
  bgGradient: text("bg_gradient").notNull().default("linear-gradient(145deg, #1a0040, #2d0080)"),
  icon1: text("icon1").default(""),
  icon2: text("icon2").default(""),
  icon3: text("icon3").default(""),
  icon4: text("icon4").default(""),
  iconLabel1: text("icon_label1").default(""),
  iconLabel2: text("icon_label2").default(""),
  iconLabel3: text("icon_label3").default(""),
  iconLabel4: text("icon_label4").default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Category = typeof categoriesTable.$inferSelect;
export type InsertCategory = typeof categoriesTable.$inferInsert;

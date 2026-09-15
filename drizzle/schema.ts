import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the Manus auth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** One-row configuration controlled by an authenticated administrator. */
export const appSettings = mysqlTable("appSettings", {
  id: int("id").autoincrement().primaryKey(),
  whatsappNumber: varchar("whatsappNumber", { length: 32 }).notNull().default(""),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Immutable lead snapshot: answers and diagnosis are stored as JSON text for auditability. */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  company: varchar("company", { length: 200 }).notNull(),
  segment: varchar("segment", { length: 160 }),
  role: varchar("role", { length: 120 }),
  whatsapp: varchar("whatsapp", { length: 40 }).notNull(),
  email: varchar("email", { length: 320 }),
  objective: text("objective"),
  challenge: text("challenge"),
  maturity: int("maturity"),
  level: varchar("level", { length: 40 }),
  temperature: varchar("temperature", { length: 40 }),
  priority: varchar("priority", { length: 40 }),
  recommendation: varchar("recommendation", { length: 200 }),
  answersJson: text("answersJson").notNull(),
  diagnosisJson: text("diagnosisJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

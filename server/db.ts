import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { appSettings, InsertLead, InsertUser, leads, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  for (const field of textFields) {
    const value = user[field];
    if (value !== undefined) {
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getAppSettings() {
  const db = await getDb();
  if (!db) return { whatsappNumber: "" };
  const result = await db.select().from(appSettings).limit(1);
  return result[0] ?? { whatsappNumber: "" };
}

export async function saveAppSettings(whatsappNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db.select({ id: appSettings.id }).from(appSettings).limit(1);
  if (existing[0]) {
    await db.update(appSettings).set({ whatsappNumber }).where(eq(appSettings.id, existing[0].id));
  } else {
    await db.insert(appSettings).values({ whatsappNumber });
  }
  return getAppSettings();
}

export async function insertLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(leads).values(lead);
  return { id: Number(result[0].insertId) };
}

export async function listLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(250);
}

// CRITICAL: Set DATABASE_URL before any other module reads it
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:Ai-headshot123@pgm-bp1fjoyt926vgd7c3o.pg.rds.aliyuncs.com:5432/postgres";
  console.log("[DB Init] DATABASE_URL was not set, using fallback value");
}
console.log("[DB Init] DATABASE_URL:", process.env.DATABASE_URL ? "SET (" + process.env.DATABASE_URL.substring(0, 30) + "...)" : "NOT SET");

// Database connection options
const DB_SSL = process.env.DATABASE_SSL !== "false"; // Default to SSL enabled

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, InsertPhoto, photos } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  console.log("[Database] getDb() called");
  console.log("[Database] DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
  console.log("[Database] _db:", _db ? "CONNECTED" : "NOT CONNECTED");
  
  if (!_db && process.env.DATABASE_URL) {
    try {
      console.log("[Database] Attempting to connect to:", process.env.DATABASE_URL.substring(0, 50) + "...");
      console.log("[Database] SSL enabled:", DB_SSL);
      const client = postgres(process.env.DATABASE_URL, {
        ssl: DB_SSL ? { rejectUnauthorized: false } : false,
        connect_timeout: 10,
        max: 5,
      });
      _db = drizzle(client);
      console.log("[Database] Connection successful!");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  } else if (!process.env.DATABASE_URL) {
    console.warn("[Database] DATABASE_URL not set!");
  }
  
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

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

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Use PostgreSQL upsert syntax (ON CONFLICT)
    const query = db.insert(users).values(values);
    // For now, just insert and ignore if exists (simple approach)
    // Full upsert would require raw SQL
    try {
      await query.execute();
    } catch (e) {
      // Ignore unique constraint violations
      if ((e as any)?.code !== '23505') {
        throw e;
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Photo queries
export async function savePhoto(photo: InsertPhoto) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.insert(photos).values(photo).returning();
  return result[0];
}

export async function getPhotoByPhotoId(photoId: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }
  
  const result = await db.select().from(photos).where(eq(photos.photoId, photoId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

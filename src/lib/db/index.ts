import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Turso edge SQLite — free tier supports up to 500 DBs, 9GB storage
// Local development uses a local SQLite file
const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? `file:${process.cwd()}/vowed.db`,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export const db = drizzle(client, { schema });

export type DB = typeof db;

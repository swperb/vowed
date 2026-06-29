import { defineConfig } from "drizzle-kit";

// drizzle-kit 0.30+ (shipped with the drizzle-orm 0.45 upgrade): Turso is a
// dialect, not a driver. `||` so a blank TURSO_DATABASE_URL falls back to the
// local file for dev.
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || "file:./vowed.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});

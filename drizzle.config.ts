// @ts-ignore — drizzle-kit 0.21.4 types are wrong; both dialect + driver are required at runtime
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "file:./vowed.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
};

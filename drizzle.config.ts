import { defineConfig } from "drizzle-kit";

// Make DATABASE_URL optional for development
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using a dummy connection string for development.");
  process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

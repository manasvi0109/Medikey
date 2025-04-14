import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Fix __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("DATABASE_URL from .env:", process.env.DATABASE_URL);


neonConfig.webSocketConstructor = ws;

// Make DATABASE_URL optional for development
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using a dummy connection string for development.");
  process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
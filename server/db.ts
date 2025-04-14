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

console.log("Connecting to database...");
let pool;
let db;

try {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Test the connection
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  db = drizzle(pool, { schema });
  console.log("Database connection established successfully");
} catch (error) {
  console.error("Failed to connect to database:", error);
  throw error;
}

export { pool, db };
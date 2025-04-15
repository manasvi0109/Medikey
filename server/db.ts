import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Fix __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("Environment:", process.env.NODE_ENV);

// Use SQLite for local development
const sqlite = new Database('medivault.db');
const db = drizzle(sqlite, { schema });

console.log("Database connection established successfully using SQLite");

// Export the database connection and the SQLite instance
export { db, sqlite };
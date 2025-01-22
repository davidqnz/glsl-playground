import path from "node:path";
import { drizzle } from "drizzle-orm/libsql";
import { migrate as drizzleMigrate } from "drizzle-orm/libsql/migrator";
import environment from "../environment.js";

export const db = drizzle(`file:${environment.DATABASE_FILE}`, { casing: "snake_case" });

export * as s from "./schema.js";

export async function migrate() {
  const migrationsFolder = path.join(import.meta.dirname, "migrations");
  await drizzleMigrate(db, { migrationsFolder });
}

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from "kysely";
import pg from "pg";
import environment from "../environment.js";
import type { DB } from "./generated.js";

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: environment.DATABASE_URL,
    ssl: environment.PGSSLMODE && { rejectUnauthorized: false },
    max: 10,
  }),
});

export const db = new Kysely<DB>({ dialect });

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
export const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(dirname, "migrations"),
  }),
});

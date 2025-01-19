import { defineConfig } from "drizzle-kit";
import environment from "./environment.js";

export default defineConfig({
  dialect: "sqlite",
  schema: "./database/schema.ts",
  out: "./database/migrations",
  casing: "snake_case",
  migrations: {
    prefix: "unix",
  },
  dbCredentials: {
    url: `file:${environment.DATABASE_FILE}`,
  },
});

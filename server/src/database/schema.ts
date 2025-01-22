import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
});

export const programs = sqliteTable("programs", {
  id: text().primaryKey(),
  userId: text().references(() => users.id, { onUpdate: "cascade", onDelete: "set null" }),
  title: text().notNull().default(""),
  vertexSource: text().notNull().default(""),
  fragmentSource: text().notNull().default(""),
  didCompile: integer({ mode: "boolean" }),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  modifiedAt: integer({ mode: "timestamp" }).$onUpdateFn(() => new Date()),
});

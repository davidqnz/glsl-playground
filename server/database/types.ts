import type { s } from "./db.js";

export type DatabaseUser = typeof s.users.$inferSelect;
export type DatabaseUserInsert = typeof s.users.$inferInsert;

export type DatabaseProgram = typeof s.programs.$inferSelect;
export type DatabaseProgramInsert = typeof s.programs.$inferInsert;

import { eq } from "drizzle-orm";
import { db, s } from "../database/db.js";

export type Program = typeof s.programs.$inferSelect;
export type ProgramUpdate = Partial<typeof s.programs.$inferSelect>;
export type ProgramInsert = typeof s.programs.$inferInsert;

export class ProgramsService {
  static async getById(id: string): Promise<Program | undefined> {
    const [program] = await db.select().from(s.programs).where(eq(s.programs.id, id)).limit(1);
    return program;
  }

  static async getByUserId(userId: string): Promise<Program[]> {
    const programs = await db.select().from(s.programs).where(eq(s.programs.userId, userId));
    return programs;
  }

  static async insert(program: ProgramInsert): Promise<Program | undefined> {
    const [newProgram] = await db.insert(s.programs).values(program).returning();
    return newProgram;
  }

  static async update(id: string, program: ProgramUpdate): Promise<Program | undefined> {
    const [updatedProgram] = await db.update(s.programs).set(program).where(eq(s.programs.id, id)).returning();
    return updatedProgram;
  }

  static async delete(id: string): Promise<void> {
    await db.delete(s.programs).where(eq(s.programs.id, id));
  }
}

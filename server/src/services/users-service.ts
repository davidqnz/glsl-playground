import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import * as EmailValidator from "email-validator";
import { HTTPException } from "hono/http-exception";
import jwt from "jsonwebtoken";
import { db, s } from "../database/db.js";
import environment from "../environment.js";

export type User = typeof s.users.$inferSelect;
export type UserUpdate = Partial<typeof s.users.$inferSelect>;
export type UserInsert = typeof s.users.$inferInsert;

export const SESSION_COOKIE_NAME = "session";
const SALT_ROUNDS = 10;

export class UsersService {
  static async create(email: string, password: string): Promise<User> {
    if (!EmailValidator.validate(email)) {
      throw new HTTPException(400, { message: "Not a valid email" });
    }

    if (password.length < 6) {
      throw new HTTPException(400, { message: "Password too short" });
    }

    const [existingUser] = await db.select().from(s.users).where(eq(s.users.email, email));
    if (existingUser) {
      throw new HTTPException(409, { message: "Username already in use" });
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const [newUser] = await db.insert(s.users).values({ id, email, passwordHash }).returning();
    return newUser;
  }

  static async signIn(email: string, password: string): Promise<[User, string]> {
    const [user] = await db.select().from(s.users).where(eq(s.users.email, email)).limit(1);

    if (!user) throw new HTTPException(401, { message: "Invalid email/password" });

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      throw new HTTPException(401, { message: "Invalid email/password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, environment.JWT_SECRET, { expiresIn: "1 day" });

    return [user, token];
  }
}

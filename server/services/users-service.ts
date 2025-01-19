import environment from "../environment.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as EmailValidator from "email-validator";
import { db } from "../database/db.js";
import type { User } from "../database/types.js";
import crypto from "node:crypto";
import { HTTPException } from "hono/http-exception";

export class UsersService {
  static async create(email: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, environment.SALT_ROUNDS);

    if (!EmailValidator.validate(email)) {
      throw new HTTPException(400, { message: "Not a valid email" });
    }

    if (password.length < 6) {
      throw new HTTPException(400, { message: "Password too short" });
    }

    try {
      const id = crypto.randomUUID();
      const [newUser] = await db.insertInto("users").values({ id, email, passwordHash }).returningAll().execute();
      return newUser;
    } catch (error) {
      if (error instanceof Error && error.message.match(/violates unique constraint "users_email_key"/)) {
        throw new HTTPException(409, { message: "Username already in use" });
      }
      throw error;
    }
  }

  static async signIn(email: string, password: string): Promise<[User, string]> {
    const [user] = await db.selectFrom("users").selectAll().where("email", "=", email).limit(1).execute();

    if (!user) throw new HTTPException(401, { message: "Invalid email/password" });

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      throw new HTTPException(401, { message: "Invalid email/password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, environment.JWT_SECRET, { expiresIn: "1 day" });

    return [user, token];
  }
}

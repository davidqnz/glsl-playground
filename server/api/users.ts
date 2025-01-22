import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import { z } from "zod";

import type { UserToken } from "../../common/api-types.js";
import environment from "../environment.js";
import { SESSION_COOKIE_NAME, UsersService } from "../services/users-service.js";

const ONE_DAY_IN_MS: number = 3600 * 24 * 1000;

export const users = new Hono();

users.post(
  "/",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  ),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const user = await UsersService.create(email, password);
    const [, token] = await UsersService.signIn(email, password);

    const cookieExpiration = new Date(new Date().getTime() + ONE_DAY_IN_MS);
    setCookie(c, SESSION_COOKIE_NAME, token, { httpOnly: true, expires: cookieExpiration });
    return c.json({
      id: user.id,
      email: user.email,
    });
  },
);

users.get("/me", async (c) => {
  const cookie = getCookie(c)[SESSION_COOKIE_NAME] ?? "";

  try {
    const jwtPayload = jwt.verify(cookie, environment.JWT_SECRET) as UserToken;
    const token: UserToken = { id: jwtPayload.id, email: jwtPayload.email };
    return c.json(token);
  } catch (_) {
    return c.json(null);
  }
});

users.post(
  "/sessions",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  ),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const [user, token] = await UsersService.signIn(email, password);

    const cookieExpiration = new Date(new Date().getTime() + ONE_DAY_IN_MS);
    setCookie(c, SESSION_COOKIE_NAME, token, { httpOnly: true, expires: cookieExpiration });
    return c.json({
      id: user.id,
      email: user.email,
    });
  },
);

users.delete("/sessions", async (c) => {
  deleteCookie(c, SESSION_COOKIE_NAME);
  return c.json({ message: "You are now logged out." });
});

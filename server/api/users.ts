import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import jwt from "jsonwebtoken";

import environment from "../environment.js";
import type { UserToken } from "../../common/api-types.js";
import { UsersService } from "../services/users-service.js";
import { authenticate } from "../middleware/authenticate.js";

const ONE_DAY_IN_MS: number = 3600 * 24 * 1000;

export const users = new Hono();

users.post("/", async (c) => {
  const json = await c.req.json();
  const email: unknown = json.email;
  const password: unknown = json.password;

  if (typeof email !== "string") throw new HTTPException(400, { message: "email must be a string" });
  if (typeof password !== "string") throw new HTTPException(400, { message: "password must be a string" });

  const user = await UsersService.create(email, password);
  const [, token] = await UsersService.signIn(email, password);

  const cookieExpiration = new Date(new Date().getTime() + ONE_DAY_IN_MS);
  setCookie(c, environment.SESSION_COOKIE, token, { httpOnly: true, expires: cookieExpiration });
  return c.json({
    id: user.id,
    email: user.email,
  });
});

users.get("/me", async (c) => {
  const cookie = getCookie(c)[environment.SESSION_COOKIE] ?? "";

  try {
    const jwtPayload = jwt.verify(cookie, environment.JWT_SECRET) as UserToken;
    const token: UserToken = { id: jwtPayload.id, email: jwtPayload.email };
    return c.json(token);
  } catch (_) {
    return c.json(null);
  }
});

users.post("/sessions", async (c) => {
  const body = await c.req.json();
  const email: unknown = body.email;
  const password: unknown = body.password;

  if (typeof email !== "string") throw new HTTPException(400, { message: "email must be a string" });
  if (typeof password !== "string") throw new HTTPException(400, { message: "password must be a string" });

  const [user, token] = await UsersService.signIn(email, password);

  const cookieExpiration = new Date(new Date().getTime() + ONE_DAY_IN_MS);
  setCookie(c, environment.SESSION_COOKIE, token, { httpOnly: true, expires: cookieExpiration });
  return c.json({
    id: user.id,
    email: user.email,
  });
});

users.delete("/sessions", async (c) => {
  deleteCookie(c, environment.SESSION_COOKIE);
  return c.json({ message: "You are now logged out." });
});

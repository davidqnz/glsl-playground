import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import jwt from "jsonwebtoken";
import type { UserToken } from "../../common/api-types.js";
import environment from "../environment.js";
import { SESSION_COOKIE_NAME } from "../services/users-service.js";

export const authenticate = createMiddleware<{ Variables: { user: UserToken } }>(async (c, next) => {
  try {
    const cookie = getCookie(c)[SESSION_COOKIE_NAME] ?? "";

    const jwtPayload = jwt.verify(cookie, environment.JWT_SECRET) as UserToken;
    const token: UserToken = { id: jwtPayload.id, email: jwtPayload.email };

    c.set("user", token);

    await next();
  } catch (error) {
    throw new HTTPException(401);
  }
});

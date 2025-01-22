/*******************************************************************************
 * Routes here belong to the API.
 ******************************************************************************/
import { Hono } from "hono";

import { HTTPException } from "hono/http-exception";
import { programs } from "./programs.js";
import { users } from "./users.js";

export const api = new Hono();

api.route("/users", users);
api.route("/programs", programs);

api.use("/health-check", async (c) => {
  return c.json({ message: "healthy" });
});

api.onError((error, c) => {
  if (error instanceof HTTPException) {
    c.status(error.status);
    return c.json({ status: error.status, message: error.message });
  }

  console.error(error);
  c.status(500);
  return c.json({ status: 500, message: "Internal server error " });
});

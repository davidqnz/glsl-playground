import crypto from "node:crypto";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { authenticate } from "../middleware/authenticate.js";
import { ProgramsService } from "../services/programs-service.js";
import type { ProgramInsert, ProgramUpdate } from "../database/types.js";

export const programs = new Hono();

programs.get("/:id", async (c) => {
  const id = c.req.param("id");
  const program = await ProgramsService.getById(id);

  if (!program) throw new HTTPException(404);

  return c.json(program);
});

programs.get("/", authenticate, async (c) => {
  const user = c.var.user;
  const programs = await ProgramsService.getByUserId(user.id);
  return c.json(programs);
});

programs.post("/", authenticate, async (c) => {
  const user = c.var.user;

  const data: ProgramInsert = await c.req.json();
  data.userId = user.id;
  data.id = crypto.randomUUID();
  const program = await ProgramsService.insert(data);

  return c.json(program);
});

programs.patch("/:id", authenticate, async (c) => {
  const id = c.req.param("id");
  const user = c.var.user;

  const originalProgram = await ProgramsService.getById(id);
  if (!originalProgram) throw new HTTPException(404);
  if (originalProgram.userId !== user.id) throw new HTTPException(403);

  const data: ProgramUpdate = await c.req.json();
  data.userId = user.id;
  const updatedProgram = await ProgramsService.update(id, data);

  return c.json(updatedProgram);
});

programs.delete("/:id", authenticate, async (c) => {
  const id = c.req.param("id");
  const user = c.var.user;

  const program = await ProgramsService.getById(id);
  if (!program) throw new HTTPException(404);
  if (program.userId !== user.id) throw new HTTPException(403);

  await ProgramsService.delete(id);

  return c.json(program);
});

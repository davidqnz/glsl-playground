import crypto from "node:crypto";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { type ProgramInsert, type ProgramUpdate, ProgramsService } from "../services/programs-service.js";

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

programs.post(
  "/",
  authenticate,
  zValidator(
    "json",
    z.object({
      title: z.string(),
      vertexSource: z.string(),
      fragmentSource: z.string(),
      didCompile: z.boolean().default(true),
    }),
  ),
  async (c) => {
    const user = c.var.user;

    const data = c.req.valid("json");
    const newProgram: ProgramInsert = {
      ...data,
      id: crypto.randomUUID(),
      userId: user.id,
    };
    const program = await ProgramsService.insert(newProgram);

    return c.json(program);
  },
);

programs.patch(
  "/:id",
  authenticate,
  zValidator(
    "json",
    z.object({
      title: z.string().optional(),
      vertexSource: z.string().optional(),
      fragmentSource: z.string().optional(),
      didComile: z.boolean().optional(),
    }),
  ),
  async (c) => {
    const id = c.req.param("id");
    const user = c.var.user;

    const originalProgram = await ProgramsService.getById(id);
    if (!originalProgram) throw new HTTPException(404);
    if (originalProgram.userId !== user.id) throw new HTTPException(403);

    const data: ProgramUpdate = c.req.valid("json");
    data.userId = user.id;
    const updatedProgram = await ProgramsService.update(id, data);

    return c.json(updatedProgram);
  },
);

programs.delete("/:id", authenticate, async (c) => {
  const id = c.req.param("id");
  const user = c.var.user;

  const program = await ProgramsService.getById(id);
  if (!program) throw new HTTPException(404);
  if (program.userId !== user.id) throw new HTTPException(403);

  await ProgramsService.delete(id);

  return c.json(program);
});

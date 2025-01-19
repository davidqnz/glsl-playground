import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { db, migrate } from "./database/db.js";
import environment from "./environment.js";

async function start() {
  await migrate();

  const server = serve(
    {
      fetch: app.fetch,
      port: environment.PORT,
    },
    ({ address, port }) => {
      console.log(`Server started on ${address}:${port}`);
    },
  );

  async function shutdown() {
    console.log("Server shutting down");
    await new Promise((r) => server.close(r));
    db.$client.close();
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();

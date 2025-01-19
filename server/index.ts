import { serve } from "@hono/node-server";
import "./environment.js";
import { db, migrator } from "./database/db.js";
import { app } from "./app.js";
import environment from "./environment.js";

async function start() {
  const migrationResultSet = await migrator.migrateToLatest();

  for (const result of migrationResultSet.results || []) {
    console.log(`${result.status}: ${result.direction} ${result.migrationName}`);
  }

  if (migrationResultSet.error) {
    const error = migrationResultSet.error as any;
    console.log(`${error.stack || error}`);
    process.exit(1);
  }

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
    console.log("Shutting down server...");
    await new Promise((r) => server.close(r));
    await db.destroy();
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();

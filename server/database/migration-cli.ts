import { db, migrator } from "./db.js";

async function run() {
  const target = process.argv[2];

  let migrationResultSet;
  switch (target) {
    case "up":
      migrationResultSet = await migrator.migrateUp();
      break;
    case "down":
      migrationResultSet = await migrator.migrateDown();
      break;
    case "latest":
      migrationResultSet = await migrator.migrateToLatest();
      break;
    default:
      console.log("Argument must be one of 'up', 'down', or 'latest'");
      process.exit(1);
  }
  await db.destroy();

  for (const result of migrationResultSet.results || []) {
    console.log(`${result.status}: ${result.direction} ${result.migrationName}`);
  }

  if (migrationResultSet.error) {
    const error = migrationResultSet.error as any;
    console.log(`${error.message || error}`);
  }
}
run();

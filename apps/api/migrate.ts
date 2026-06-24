import { Client } from "pg";
import fs from "fs";
import path from "path";

const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "998101Nan---",
  database: "RedfieldGamingDB",
});

async function migrate() {
  // Better argument parsing - check all arguments after the script
  const args = process.argv.slice(2); 
  const shouldDelete = args.includes("1") || args.includes("--delete");
  
  // Debug: see what arguments were passed
  console.log("Arguments received:", args);

  if (shouldDelete) {
    console.log("DELETE MODE ENABLED - Will run delete script");
  } else {
    console.log("Normal migration mode");
  }

  console.log("Migrating now");
  await client.connect();

  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  console.log("migrationsDir:", migrationsDir);

  for (const file of files) {
    // Skip the delete file if not in delete mode
    if (file === "01_delete_whole_schema.sql" && !shouldDelete) {
      console.log(` Skipping: ${file} (delete mode not enabled)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    await client.query(sql);
    console.log(`Ran: ${file}`);
  }

  await client.end();
  console.log(shouldDelete ? "Delete complete." : "Migration complete.");
}

migrate().catch(console.error);

import { Client } from "pg";
import fs from "fs";
import path from "path";

const client = new Client({
  // host: "localhost",
  // user: "postgres",
  // port: 5432,
  // password: "998101Nan---",
  // database: "RedfieldGamingDB",
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "postgres",
  port: Number(process.env.DB_PORT) || 5432,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "RedfieldGamingDB",
});

async function migrate() {
  const args = process.argv.slice(2);
  const shouldDelete = args.includes("1") || args.includes("--delete");
  
  console.log("Arguments received:", args);
  console.log(shouldDelete ? "DELETE MODE ENABLED" : "Normal migration mode");

  await client.connect();

  const migrationsDir = path.join(__dirname, "..", "migrations");
  const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
  
  // Filter to only .sql files
  const files = entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.sql'))
    .map(entry => entry.name)
    .sort();

  console.log("migrationsDir:", migrationsDir);
  console.log("Files found:", files);

  for (const file of files) {
    if (file === "01_delete_whole_schema.sql" && !shouldDelete) {
      console.log(`Skipping: ${file} (delete mode not enabled)`);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");
    await client.query(sql);
    console.log(`Ran: ${file}`);
  }

  await client.end();
  console.log(shouldDelete ? "Delete complete." : "Migration complete.");
}

migrate().catch(console.error);
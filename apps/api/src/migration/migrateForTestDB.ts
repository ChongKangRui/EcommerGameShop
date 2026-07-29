import { Client } from "pg";
import fs from "fs";
import path from "path";
import "dotenv/config";

const client = new Client({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "postgres",
  port: Number(process.env.DB_PORT) || 5432,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "testDB",
});

async function runSqlFilesInDir(dir: string, label: string) {
  if (!fs.existsSync(dir)) {
    console.log(`No directory at ${dir}, skipping ${label}`);
    return;
  }
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();

  console.log(`${label} files found:`, files);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf-8");
    await client.query(sql);
    console.log(`Ran (${label}): ${file}`);
  }
}

async function migrate() {
  const dbName = process.env.DB_NAME ?? "testDB";
  if (!dbName.toLowerCase().includes("test")) {
    console.error(`Refusing to run: "${dbName}" doesn't look like a test database.`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const shouldDelete = args.includes("1") || args.includes("--delete");
  const shouldSeed = args.includes("seed") || args.includes("--seed");

  console.log("Arguments received:", args);
  console.log(shouldDelete ? "DELETE MODE ENABLED" : "Normal migration mode");
  console.log(shouldSeed ? "SEED MODE ENABLED" : "Seed mode disabled");

  await client.connect();

  const migrationsDir = path.join(__dirname, "..", "..", "migrations");
  const files = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();

  console.log("migrationsDir:", migrationsDir);
  console.log("Files found:", files);

  for (const file of files) {
    if (file === "01_delete_whole_schema.sql" && !shouldDelete) {
      console.log(`Skipping: ${file} (delete mode not enabled)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    await client.query(sql);
    console.log(`Ran: ${file}`);
  }

  if (shouldSeed) {
    await runSqlFilesInDir(path.join(migrationsDir, "testInsertion"), "seed");
  }

  await client.end();
  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error(err);
  client.end();
  process.exit(1);
});
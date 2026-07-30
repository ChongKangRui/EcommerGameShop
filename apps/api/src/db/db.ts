import "dotenv/config";
import { Pool } from "pg";

const env = process.env.NODE_ENV;

const poolConfig =
  env === "production"
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
      }
    : {
        host: process.env.DB_HOST ?? "localhost",
        user: process.env.DB_USER ?? "postgres",
        port: Number(process.env.DB_PORT) || 5432,
        password: process.env.DB_PASSWORD,
        database:
          env === "test"
            ? (process.env.TEST_DB_NAME ?? "testDB")
            : (process.env.DB_NAME ?? "RedfieldGamingDB"),
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
      };

export const pool = new Pool(poolConfig);


if (process.env.NODE_ENV !== "test") {
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.log("DB connection failed:", err.message);
    } else {
      console.log(`DB connected at:`, res.rows[0].now);
    }
  });
}
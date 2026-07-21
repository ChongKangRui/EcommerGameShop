import { Pool } from "pg";
export const pool = new Pool(
  process.env.NODE_ENV === "production"
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: "localhost",
        user: "postgres",
        port: 5432,
        password: "998101Nan---",
        database: "RedfieldGamingDB",
      }
);

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log("DB connection failed:", err.message);
  } else {
    console.log("DB connected at:", res.rows[0].now);
  }
});
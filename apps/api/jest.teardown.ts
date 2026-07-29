import { pool } from "./src/db/db";




export default async function () {
    console.log("Hi there tear down");
  await pool.end();
}
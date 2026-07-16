import cron from "node-cron";
import { pool } from "src/db";

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("Checking for expired orders...");

  const expired = await pool.query(
    `UPDATE orders SET status = 'expired' 
     WHERE status = 'pending' AND expires_at < NOW()
     RETURNING order_id`
  );

  for (const order of expired.rows) {
    await pool.query(
      `UPDATE product_variations pv
       SET stock = stock + oi.quantity
       FROM order_items oi
       WHERE oi.order_id = $1 AND pv.variation_id = oi.variation_id`,
      [order.order_id]
    );
  }

  if (expired.rows.length > 0) {
    console.log(`Expired ${expired.rows.length} orders, stock restored`);
  }
});
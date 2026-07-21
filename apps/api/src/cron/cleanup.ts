

import cron from "node-cron";
import { pool } from "src/db/db";
import { logger } from "src/utils/loggerHelper";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Run every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  const candidates = await pool.query(
    `SELECT order_id, payment_ref FROM orders
     WHERE status = 'pending' AND expires_at < NOW()`,
  );

  let expiredCount = 0;

  for (const order of candidates.rows) {
    try {
      if (order.payment_ref) {
        const pi = await stripe.paymentIntents.retrieve(order.payment_ref);

        logger.info(pi.status);
        if (pi.status === "succeeded" || pi.status === "processing") {
          logger.warn(`Order ${order.order_id} near-expiry but PI is ${pi.status} — skipping`);
          continue;
        }
        if (pi.status !== "canceled") {
          await stripe.paymentIntents.cancel(pi.id, { cancellation_reason: "abandoned" });
        }
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const result = await client.query(
          `UPDATE orders SET status = 'expired', updated_at = NOW()
           WHERE order_id = $1 AND status = 'pending'
           RETURNING order_id`,
          [order.order_id],
        );

        if (result.rowCount === 0) {
          // status changed may change while talking to Stripe
          await client.query("ROLLBACK");
          logger.warn(`Order ${order.order_id} changed mid-check — skipping stock restore`);
          continue;
        }

        await client.query(
          `UPDATE product_variations pv
           SET stock = stock + oi.quantity
           FROM order_items oi
           WHERE oi.order_id = $1 AND pv.variation_id = oi.variation_id`,
          [order.order_id],
        );

        await client.query("COMMIT");
        expiredCount++;
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    } catch (e) {
      logger.error(`Failed to expire order ${order.order_id}`, e);
    }
  }

  if (expiredCount > 0) {
    logger.info(`Expired ${expiredCount} orders, stock restored`);
  }
});
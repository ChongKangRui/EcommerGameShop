import cron from "node-cron";
import { withTransaction } from "src/db/withTransaction";
import { stripeGateway } from "src/gateways/stripeGateway";
import { orderRepository } from "src/repositories/orderRepository";
import { orderService } from "src/services/orderService";
import { logger } from "src/utils/loggerHelper";

let isRunning = false; // guard against overlapping runs

if (process.env.NODE_ENV !== "test") {
  cron.schedule("*/1 * * * *", async () => {
    if (isRunning) {
      logger.warn("Previous cron run still in progress — skipping this tick");
      return;
    }
    isRunning = true;
    logger.info(
      "--------------------------------CRON JOB CLEAN UP-----------------------------------",
    );
    logger.info(`Cron job STARTED at ${new Date().toISOString()}`);
    try {
      const candidates = await orderRepository.getPendingOrder();
      let expiredCount = 0;
      logger.info(`Candidate length`, { length: candidates.rows.length });

      for (const order of candidates.rows) {
        //try {
        if (order.payment_ref) {
          logger.info(`stripe gateway`);
          const pi = await stripeGateway.retrievePaymentIntent(
            order.payment_ref,
          );
          if (pi) {
            logger.info(pi.status);

            if (pi.status === "processing") {
              logger.warn(
                `Order ${order.order_id} near-expiry but PI is ${pi.status} — skipping`,
              );
              continue;
            } else if (pi.status === "succeeded") {
              logger.warn(
                `Order ${order.order_id} already paid but status still pending in db. Thus mark order as paid`,
              );
              await orderService.markOrderAsPaid(order.payment_ref, logger);
              continue;
            }

            if (pi.status !== "canceled") {
              await stripeGateway.cancelPaymemtIntent(pi.id);
            }
          }
        }

        // fresh client + transaction, scoped to just this order
        const succeed = await withTransaction((client) =>
          orderService.markOrderAsExpired(client, order.order_id),
        );
        if (succeed) expiredCount++;
        // } catch (e) {
        //   logger.error(`Failed to expire order ${order.order_id}`, e);
        // }
      }

      if (expiredCount > 0) {
        logger.info(`Expired ${expiredCount} orders, stock restored`);
      }
      logger.info(
        "--------------------------------CRON FINISHED CLEAN UP-----------------------------------",
      );
    } catch (e) {
      logger.error(`Cron job crashed critically: `, e);
    } finally {
      isRunning = false;
    }
  });
}

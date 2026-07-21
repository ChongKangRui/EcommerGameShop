import { logger } from "src/utils/loggerHelper";
import { orderRepository } from "src/repositories/orderRepository";
import { stripeGateway } from "src/gateways/stripeGateway";
import { cartRepository } from "src/repositories/cartRepository";

const MAX_WAIT_MS = 10_000;
const POLL_INTERVAL_MS = 1000;

export const orderService = {
  async confirmOrder(orderId: string, userId: string, requestId: string) {
    const deadline = Date.now() + MAX_WAIT_MS;
    let pollCount = 0;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    while (true) {
      pollCount++;
      const order = await orderRepository.findByIdForUser(orderId, userId);
      if (!order) return { notFound: true } as const;

      if (order.status === "paid") {
        logger.info(`[${requestId}] Order confirmed`, { orderId, pollCount });
        return { status: "paid" } as const;
      }

      if (Date.now() >= deadline) {
        logger.warn(`[${requestId}] Confirmation timeout`, { orderId, pollCount });
        return { status: order.status } as const;
      }

      const pi = await stripeGateway.getPaymentIntent(order.payment_ref);
      if (pi.status === "succeeded") {
        logger.warn(`[${requestId}] Stripe succeeded but webhook may have missed`, { orderId });
        await orderRepository.markPaid(order.payment_ref);
        await cartRepository.clearCart(userId);
        return { status: "paid" } as const;
      }

      await sleep(POLL_INTERVAL_MS);
    }
  },
};
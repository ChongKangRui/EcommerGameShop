import Stripe from "stripe";
import { stripeGateway } from "src/gateways/stripeGateway";
import { type Logger } from "src/utils/loggerHelper";
import { orderService } from "./orderService";

export const webHookService = {
  async handleStripeWebhook(
    rawBody: Buffer,
    signature: string,
    log: Logger,
  ): Promise<{ status: number; body: Record<string, any> }> {
    let event: Stripe.Event;

    try {
      log.info("Debug raw body", {
        isBuffer: Buffer.isBuffer(rawBody),
        length: rawBody?.length,
        preview: rawBody?.toString("utf8").slice(0, 100),
      });

      event = stripeGateway.constructWebhookEvent(
        rawBody,
        signature,
        process.env.STRIPE_SECRET_KEY ?? "",
      );
    } catch (err) {
      log.error("Webhook signature verification failed", err);
      return { status: 400, body: { error: "Payment verification fail" } };
    }

    log.info(`Stripe webhook event constructed`, {
      eventId: event.id,
      eventType: event.type,
    });

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      log.info(`Processing payment_intent.succeeded`, {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
      });

      // const userId = await orderRepository.markPaid(paymentIntent.id);

      // if (userId) {
      //   log.info(`Order marked paid for user ${userId}`, { paymentIntentId: paymentIntent.id });
      //   await cartRepository.clearCart(userId);
      //   log.debug(`Cart cleared for user ${userId}`);
      // } else {
      //   log.warn(`No pending order found for payment_ref: ${paymentIntent.id}`);
      // }

      orderService.markOrderAsPaid(paymentIntent.id, log);
    } else {
      log.debug(`Ignoring webhook event type: ${event.type}`);
    }

    return { status: 200, body: { received: true } };
  },
};

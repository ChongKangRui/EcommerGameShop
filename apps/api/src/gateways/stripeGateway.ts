
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export const stripeGateway = {
  async retrievePaymentIntent(paymentRef: string) {
    return stripe.paymentIntents.retrieve(paymentRef);
  },
  async updatePaymentIntentAmount(paymentIntentId: string, amount: number) {
    return stripe.paymentIntents.update(paymentIntentId, { amount });
  },

  async cancelPaymemtIntent(paymentIntentId: string){
      return stripe.paymentIntents.cancel(paymentIntentId, { cancellation_reason: "abandoned" });
  },

  constructWebhookEvent(payload: Buffer | string, signature: string, secret: string) {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  },

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
    idempotencyKey: string,
  ) {
    return stripe.paymentIntents.create(
      { amount, currency, payment_method_types: ["card"], metadata },
      { idempotencyKey },
    );
  },
  async createRefundIntent(
    amount: number,
    payment_intent: string,
    idempotencyKey: string,
  ) {
    return stripe.refunds.create(
      { amount, payment_intent},
      { idempotencyKey },
    );
  },
};


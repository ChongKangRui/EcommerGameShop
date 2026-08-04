
import Stripe from "stripe";
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}


export const stripeGateway = {
  async retrievePaymentIntent(paymentRef: string) {
    return getStripe().paymentIntents.retrieve(paymentRef);
  },
  async updatePaymentIntentAmount(paymentIntentId: string, amount: number) {
    return getStripe().paymentIntents.update(paymentIntentId, { amount });
  },

  async cancelPaymemtIntent(paymentIntentId: string){
      return getStripe().paymentIntents.cancel(paymentIntentId, { cancellation_reason: "abandoned" });
  },

  constructWebhookEvent(payload: Buffer | string, signature: string, secret: string) {
    return getStripe().webhooks.constructEvent(payload, signature, secret);
  },

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
    idempotencyKey: string,
  ) {
    return getStripe().paymentIntents.create(
      { amount, currency, payment_method_types: ["card"], metadata },
      { idempotencyKey },
    );
  },
  async createRefundIntent(
    amount: number,
    payment_intent: string,
    idempotencyKey: string,
  ) {
    return getStripe().refunds.create(
      { amount, payment_intent},
      { idempotencyKey },
    );
  },
};


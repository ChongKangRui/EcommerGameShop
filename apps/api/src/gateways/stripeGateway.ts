
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export const stripeGateway = {
  async getPaymentIntent(paymentRef: string) {
    return stripe.paymentIntents.retrieve(paymentRef);
  },
};
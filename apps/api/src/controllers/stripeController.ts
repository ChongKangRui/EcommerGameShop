import type { Request, Response, NextFunction } from "express";
import { pool } from "../db";
import { AuthRequest } from "src/middleWare/auth";
import { Product, ProductVariation } from "@ecom/shared/src/type/product";
// single product

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  try {
    //console.log("Receive stripe req.body ", process.env.STRIPE_WEBHOOK_KEY);
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_KEY ?? "",
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      // Update order status in DB
      const userIdResult = await pool.query(
        `UPDATE orders SET status = 'paid' 
        WHERE payment_ref = $1
        RETURNING user_id`,
        [paymentIntent.id],
      );

    
      if (userIdResult.rows.length > 0) {
        // clear out the order from customer
        await pool.query(
          `DELETE from cart 
            where user_id = $1`,
          [userIdResult.rows[0].user_id],
        );
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err);
    res.status(400).json({ error: "Payment verification fail" });
  }
};

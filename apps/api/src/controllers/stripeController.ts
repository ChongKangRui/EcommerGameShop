import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/db";

import { generateLogId, logger } from "src/utils/loggerHelper";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export const stripeWebhook = async (req: Request, res: Response) => {
  const requestId = generateLogId();
  
  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Stripe webhook request received`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    headers: {
      'stripe-signature': req.headers["stripe-signature"] ? 'present' : 'missing'
    }
  });

  const sig = req.headers["stripe-signature"] as string;

  try {
    logger.debug(`[${requestId}] Constructing Stripe webhook event with signature`);
    //console.log("Receive stripe req.body ", process.env.STRIPE_WEBHOOK_KEY);
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_KEY ?? "",
    );

    logger.info(`[${requestId}] Stripe webhook event constructed successfully`, {
      eventId: event.id,
      eventType: event.type,
      created: new Date(event.created * 1000).toISOString()
    });

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      
      logger.info(`[${requestId}] Processing payment_intent.succeeded event`, {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      });
      
      logger.debug(`[${requestId}] Updating order status to 'paid' for payment_ref: ${paymentIntent.id}`);
      
      // Update order status in DB
      const userIdResult = await pool.query(
        `UPDATE orders 
        SET status = 'paid',
        updated_at = NOW()
        WHERE payment_ref = $1
        RETURNING user_id`,
        [paymentIntent.id],
      );

      if (userIdResult.rows.length > 0) {
        const userId = userIdResult.rows[0].user_id;
        logger.info(`[${requestId}] Order updated to 'paid' for user: ${userId}`, {
          paymentIntentId: paymentIntent.id,
          userId: userId
        });
        
        // clear out the order from customer
        logger.debug(`[${requestId}] Clearing cart for user: ${userId}`);
        await pool.query(
          `DELETE from cart 
            where user_id = $1`,
          [userIdResult.rows[0].user_id],
        );
        logger.debug(`[${requestId}] Cart cleared successfully for user: ${userId}`);
      } else {
        logger.warn(`[${requestId}] No order found with payment_ref: ${paymentIntent.id}`);
      }
    } else {
      logger.debug(`[${requestId}] Ignoring webhook event type: ${event.type}`);
    }

    logger.info(`[${requestId}] Webhook processed successfully, sending 200 response`);
    res.json({ received: true });
    
  } catch (err) {
    logger.error(`[${requestId}] Webhook signature verification failed`, err);
    console.log(`⚠️  Webhook signature verification failed.`, err);
    res.status(400).json({ error: "Payment verification fail" });
  }
};
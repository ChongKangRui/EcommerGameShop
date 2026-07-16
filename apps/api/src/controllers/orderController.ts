import { Request, Response, NextFunction } from "express";
import { pool } from "../db"; // adjust to your actual pool import
import Stripe from "stripe";
import { AuthRequest } from "src/middleWare/auth";
import { CartItemResponse } from "@ecom/shared/src/type/cart";
import {
  OrderConfirmResponse,
  OrderItemResponse,
} from "@ecom/shared/src/type/order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const CHECKOUT_TTL_MINUTES = 15;

export const orderConfirm = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {

try{
  const { orderId } = req.params;
  const userId = req.userId;

  const MAX_WAIT_MS = 10_000;
  const POLL_INTERVAL_MS = 1000;
  const deadline = Date.now() + MAX_WAIT_MS;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // usind while loop to confirm order, ensure that 
  while (true) {
    const result = await pool.query<{ status: string }>(
      `SELECT status FROM orders WHERE order_id = $1 AND user_id = $2`,
      [orderId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (result.rows[0].status !== "pending" || Date.now() >= deadline) {
      return res.status(200).json({ status: result.rows[0].status });
    }

    await sleep(POLL_INTERVAL_MS);
  }
 
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Unable to confirm order" });
  }
};

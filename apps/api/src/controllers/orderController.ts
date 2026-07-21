import { Request, Response, NextFunction } from "express";
import { pool } from "../db/db"; // adjust to your actual pool import
import Stripe from "stripe";
import { AuthRequest } from "src/middleWare/auth";
import { CartItemResponse } from "@ecom/shared/src/type/cart";
import {
  Order,
  OrderConfirmResponse,
  OrderItemResponse,
} from "@ecom/shared/src/type/order";
import { generateLogId } from "src/utils/loggerHelper";
import { logger } from "src/utils/loggerHelper";
import { orderService } from "src/services/orderService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const orderConfirm = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const requestId = generateLogId();

  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Order confirm request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.userId,
    orderId: req.params.orderId,
  });

  
    const { orderId } = req.params;
    const userId = req.userId;

   logger.info(`[${requestId}] Order confirm request received`, {
    ip: req.ip, userAgent: req.headers["user-agent"], userId: userId, orderId: orderId})
 
  try {
    const result = await orderService.confirmOrder(String(orderId), String(userId), requestId);
    if (result.notFound) return res.status(404).json({ error: "Order not found" });
    return res.status(200).json({ status: result.status });
  } catch (e) {
    logger.error(`[${requestId}] Error in order confirmation`, e);
    res.status(500).json({ error: "Unable to confirm order" });
  }
};

export const orderRefundCreate = async (req: AuthRequest, res: Response) => {
  const requestId = generateLogId();

  logger.info(`-------------------------------------------------------`);
  logger.info(`[${requestId}] Order refund request received`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    userId: req.userId,
    orderId: req.params.orderId,
  });

  try {
    const { orderId } = req.params;
    const userId = req.userId;

  

    
    return res.status(200).json({ });
     
  } catch (e) {
    logger.error(`[${requestId}] Error in order confirmation`, e);
    console.log(e);
    res.status(500).json({ error: "Unable to confirm order" });
  }
};

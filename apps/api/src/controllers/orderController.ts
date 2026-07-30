import type {Response } from "express";
import { AuthRequest } from "src/middleWare/auth";

import { orderService } from "src/services/orderService";

// use by customer.
export const getUserOrderTable = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    return res
      .status(200)
      .json(await orderService.getAllOrders(req.query, req.log, userId));
  } catch (e) {
    req.log.error(` Error in get customer orders`, e);
    return res.status(500).json({ error: "Invalid action" });
  }
};

export const getUserOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;
    return res
      .status(200)
      .json(await orderService.getCustomerOrder(String(orderId), String(userId), req.log));
  } catch (e) {
    
    req.log.error(` Error in get order`, e);
    return res.status(403).json({ error: "Invalid action" });
  }
};

export const orderConfirm = async (req: AuthRequest, res: Response) => {
  req.log.info(`-------------------------------------------------------`);
  req.log.info(`Order confirm request received`);

  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const result = await orderService.confirmOrder(
      String(orderId),
      String(userId),
      req.log,
    );
    // if (result.status === 'notFound')
    //   return res.status(404).json({ error: "Order not found" });
    return res.status(200).json({ status: result.status });
  } catch (e) {
    req.log.error(`Error in order confirmation`, e);
    return res.status(500).json({ error: "Unable to confirm order" });
  }
};

export const orderValidation = async (req: AuthRequest, res: Response) => {
  req.log.info(`-------------------------------------------------------`);
  req.log.info(`Order validation request received`);

  try {
    const { orderId } = req.params;

    const result = await orderService.validatePendingOrder(String(orderId));
    console.log(result);
    if (!result)
      return res.status(200).json({ message: "order invalid", valid: false });
    else {
      return res.status(200).json({ message: "order invalid", valid: true });
    }
  } catch (e) {
    req.log.error(`Error in order validation`, e);
    res.status(500).json({ error: "Unable to confirm order" });
  }
};

export const createRefund = async (req: AuthRequest, res: Response) => {
  req.log.info(`-------------------------------------------------------`);
  req.log.info(`Order refund request received`);

  try {
    const { orderId } = req.params;
    const userId = req.userId;
    const {reason} = req.body;

    await orderService.createRefundRequest(String(orderId), reason, String(userId));

    return res.status(200).json({message: "Refund request success"});
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    req.log.error(`Error in update refund status`, message);
    return res.status(403).json({ error: message });
  }
};

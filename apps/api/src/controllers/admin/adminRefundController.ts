import { RefundTypeEnum } from "@ecom/shared/src/type/refund";
import type { Request, Response } from "express";

import { AuthRequest } from "src/middleWare/auth";
import { adminRefundService } from "src/services/admin/adminRefundService";

export const getRefundTable = async (req: AuthRequest, res: Response) => {
  req.log.debug("Get refunds table request received", {
    query: req.query,
  });

  try {
    const result = await adminRefundService.getRefundRequestTable(
      req.query,
      req.log,
    );
    req.log.info("Get refunds table request completed successfully");
    return res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    req.log.error(`Error in update refund status`, message);
    return res.status(500).json({ error: message });
  }
};
export const getRefund = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const refundData = await adminRefundService.getRefund(
      String(orderId),
      req.log,
    );

    return res.status(200).json(refundData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    req.log.error(`Error in update refund status`, message);
    return res.status(500).json({ error: message });
  }
};

export const updateRefundStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { refundId } = req.params;
    const { newStatus, refundAmount } = req.body;

    const userId = req.userId;

    if (!userId) {
      throw Error(
        "Invalid user operation. Unable to identify who the operator is",
      );
    }

    await adminRefundService.updateRefundStatus(
      String(refundId),
      newStatus as RefundTypeEnum,
      refundAmount,
      String(userId),
      req.log,
    );

    console.log(refundId, newStatus, refundAmount);

    return res.status(200).json({ message: "update success" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    req.log.error(`Error in update refund status`, message);
    return res.status(500).json({ error: message });
  }
};

export const massRejectRefundRequest = async (
  req: AuthRequest,
  res: Response,
) => {
  const refundIds = req.body.data;

  const userId = req.userId;
  try {
    console.log(refundIds);
    if (!Array.isArray(refundIds) || refundIds.length === 0) {
      req.log.error("Invalid refund ID array ");
      return res.status(400).json({ error: "Invalid refund Id array" });
    }
    const amountOfUpdateSuccess =
      await adminRefundService.massRejectRefundRequest(
        refundIds,
        String(userId),
        req.log,
      );
    return res.status(200).json({ amount: amountOfUpdateSuccess });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    req.log.error("Error: ", message);
    return res.status(500).json({ error: "Update refund status failed" });
  }
};

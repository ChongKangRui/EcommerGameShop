import type { Request, Response } from "express";
import { adminOrderService } from "src/services/admin/adminOrderService";
import { orderService } from "src/services/orderService";


export const getAllCustomerOrderTable = async (req: Request, res: Response) => {
  try {
    return res
      .status(200)
      .json(await orderService.getAllOrders(req.query, req.log));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({ error: message });
  }
};


export const getOrderAndCustomerInfo = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    return res
      .status(200)
      .json(
        await adminOrderService.getOrderAndCustomerInfo(
          String(orderId),
          req.log,
        ),
      );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({ error: message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const result = await adminOrderService.updateOrderStatus(
      String(orderId),
      req.body.data.newStatus,
      req.log,
    );
    if (!result.ok) {
      req.log.error("Update order status failed: ", result.error);
      return res.status(result.status).json({ error: result.error });
    }
    res.status(200).json(result.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({ error: message });
  }
};

export const updateOrdersStatus = async (req: Request, res: Response) => {
  try {
    const { orderIds, newStatus } = req.body.data;
    const result = await adminOrderService.updateOrdersStatus(
      orderIds,
      newStatus,
      req.log,
    );
    if (!result.ok) {
      req.log.error("Update orders status failed: ", result.error);
      return res.status(result.status).json({ error: result.error });
    }
    res.status(200).json(result.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({ error: message });
  }
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const startYear = req.query.startYear ? Number(req.query.startYear) : 1900;
    const endYear = req.query.endYear ? Number(req.query.endYear) : 2200;
    const startMonth = req.query.startMonth ? Number(req.query.startMonth) : 1;
    const endMonth = req.query.endMonth ? Number(req.query.endMonth) : 12;

    req.log.info("Get monthly sales data request received");
    req.log.info(
      `Request from ${startYear} ${startMonth} - ${endYear} ${endMonth}`,
    );

    const {
      salesData,
      activeProductCount,
      customerGrowthStat,
      orderGrowthStat,
    } = await adminOrderService.getDashboardStatus(
      startYear,
      endYear,
      startMonth,
      endMonth,
    );

    res.status(200).json({
      salesData,
      activeProductCount,
      customerGrowthStat,
      orderGrowthStat,
    });
  } catch (e) {
    req.log.error(`Error in get monthly sale data`, e);
    res.status(500).json({ error: "Invalid action" });
  }
};

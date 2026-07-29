// admin-order.service.ts
import {
  AdminOrderTypeEnum,
  adminOrderTypeOptions,
  DashboardDataResponse,
  getOrderStatusAvailableUpdateOptions,
  
} from "@ecom/shared/src/type/order";
import { adminOrderRepository } from "../../repositories/admin/adminOrderRepository";
import { type ServiceResult } from "@ecom/shared/src/type/service";
import { type Logger } from "src/utils/loggerHelper";
import { orderRepository } from "src/repositories/orderRepository";
import { orderService } from "../orderService";
import { adminProductRepository } from "src/repositories/admin/adminProductRepository";

export const adminOrderService = {
  async getOrderAndCustomerInfo(orderId: string, log: Logger) {
    log.debug(`Fetching customer order ${orderId} by admin`);
    const { customer, items } =
      await adminOrderRepository.getOrderItemWithCustomerInfo(orderId);

    if (!customer) {
      log.warn(`No order found for orderId ${orderId}`);
    } else {
      log.info(`Fetched order ${orderId} with ${items.length} items`);
    }

    return {
      orderCustomerInfo: customer,
      orderItems: items,
      message: "get order Success",
    };
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    log: Logger,
  ): Promise<ServiceResult<{ message: string }>> {
    const validated = adminOrderTypeOptions.safeParse(
      newStatus as AdminOrderTypeEnum,
    );
    if (!validated.success) {
      log.warn(
        `Rejected status update for order ${orderId}: invalid status value`,
        { newStatus },
      );
      return { ok: false, status: 400, error: "Invalid order status" };
    }

    const order = await orderRepository.getOrderStatusAndPaymentRef(orderId);
    if (!order) {
      log.warn(`Order ${orderId} not found`);
      return { ok: false, status: 400, error: "Invalid order confirmation" };
    }

    const allowed = getOrderStatusAvailableUpdateOptions(
      order.status as AdminOrderTypeEnum,
    );
    if (!allowed?.some((s) => s === validated.data)) {
      log.warn(
        `Rejected transition ${order.status} → ${newStatus} for order ${orderId}`,
      );
      return {
        ok: false,
        status: 400,
        error: "Invalid order status update action",
      };
    }
    if (newStatus === "paid") {
      await orderService.markOrderAsPaid(order.payment_ref, log);
    } else {
      await adminOrderRepository.updateStatus(orderId, newStatus);
    }

    log.info(`Order ${orderId} transitioned ${order.status} → ${newStatus}`);
    return { ok: true, data: { message: "Update order status success" } };
  },

  async updateOrdersStatus(
    orderIds: string[],
    newStatus: string,
    log: Logger,
  ): Promise<ServiceResult<{ message: string }>> {
    const validated = adminOrderTypeOptions.safeParse(
      newStatus as AdminOrderTypeEnum,
    );
    if (!validated.success) {
      log.warn("Rejected bulk status update: invalid status value", {
        newStatus,
      });
      return { ok: false, status: 400, error: "Invalid order status" };
    }

    const rows = await adminOrderRepository.getStatusByIds(orderIds);
    if (rows.length === 0) {
      log.warn("Bulk status update found no matching orders", {
        requestedIds: orderIds,
      });
      return { ok: false, status: 400, error: "Invalid orders" };
    }

    log.debug(`Attempting to transition ${rows.length} orders to ${newStatus}`);

    let successCount = 0;
    const skipped: string[] = [];

    for (const row of rows) {
      const allowed = getOrderStatusAvailableUpdateOptions(
        row.status as AdminOrderTypeEnum,
      );
      if (!allowed?.some((s) => s === validated.data)) {
        skipped.push(row.order_id);
        continue;
      }
      if (newStatus === "paid") {
        await orderService.markOrderAsPaid(row.payment_ref, log);
      } else {
        await adminOrderRepository.updateStatus(row.order_id, newStatus);
      }

      successCount++;
    }

    if (skipped.length > 0) {
      log.warn(`Skipped ${skipped.length} orders due to invalid transitions`, {
        skippedIds: skipped,
      });
    }
    log.info(
      `Bulk status update: ${successCount}/${rows.length} orders transitioned to ${newStatus}`,
    );

    return {
      ok: true,
      data: {
        message: `Total ${successCount} order status update successfully`,
      },
    };
  },
  async getDashboardStatus(
    startYear = 1999,
    endYear = 2200,
    startMonth = 1,
    endMonth = 12,
  ): Promise<DashboardDataResponse> {
    const date = new Date();
    const [salesData, activeProductCount, customerGrowthStat, orderGrowthStat] =
      await Promise.all([
        adminOrderRepository.getMonthlySalesRecord({
          startYear,
          endYear,
          startMonth,
          endMonth,
        }),

        adminProductRepository.getActiveProductCount(),
        adminProductRepository.getNewCustomerStats(date),
        adminOrderRepository.getOrderCount(date),
      ]);
    return {
      salesData,
      activeProductCount,
      customerGrowthStat,
      orderGrowthStat,
    };
  },
 
};

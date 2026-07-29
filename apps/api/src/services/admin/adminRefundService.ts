// admin-order.service.ts
import { Request } from "express";
import { type Logger } from "src/utils/loggerHelper";

import {
  refundFilterOptions,
  refundUpdateEnum,
  sortRefundTableOptions,
  type RefundTypeEnum,
} from "@ecom/shared/src/type/refund";
import { adminRefundRepository } from "src/repositories/admin/adminRefundRepository";
import { stripeGateway } from "src/gateways/stripeGateway";
import { orderRepository } from "src/repositories/orderRepository";

export const adminRefundService = {
  async getRefundRequestTable(query: Request["query"], log: Logger) {
    const limit = parseInt(String(query.limit ?? "")) || 5;
    const offset = parseInt(String(query.offset ?? "")) || 0;

    const sortBy = String(query.sortBy);
    const filterBy = String(query.filterBy ?? "all");
    const search = query.search ? String(query.search) : "";

    if (!sortRefundTableOptions.some((option) => option.value === sortBy)) {
      throw new Error(`Invalid sort parameter ${sortBy}}`);
    }

    if (!refundFilterOptions.some((option) => option === filterBy)) {
      throw new Error(`Invalid filter parameter ${filterBy}}`);
    }

    if (limit > 100) {
      throw new Error(`Limit more than 100`);
    }

    log.debug("Fetching refunds table", {
      limit,
      offset,
      sortBy,
      filterBy,
      search,
    });

    const { refunds, total } = await adminRefundRepository.getRefundTable({
      limit,
      offset,
      sortBy,
      filterBy,
      search,
    });

    log.info(`Returned ${refunds.length} refund requests`);
    return {
      refunds,
      count: total,
      message: "Refund table retrieved successfully",
    };
  },
  async getRefund(orderId: string, log: Logger) {
    log.debug(`Fetching refund details for order ${orderId}`);

    const { refundInfo } =
      await adminRefundRepository.getRefundByOrderId(orderId);

    if (!refundInfo) {
      log.warn(`No order found for refund request on order ${orderId}`);
    } else {
      log.info(`Fetched refund details for order ${orderId}`);
    }

    return {
      ...refundInfo,
    };
  },
  async updateRefundStatus(
    refundId: string,
    newStatus: RefundTypeEnum,
    paymentAmount: number,
    processed_by: string,
    log: Logger,
  ) {
    log.info(`Update refund detail for ${refundId} with status ${newStatus}`);

    const result = refundUpdateEnum.safeParse(newStatus);

    if (!result.success) {
      throw Error("Invalid enum type for newStatus");
    }

    const existing = await adminRefundRepository.getRefundByRefundId(refundId);
    if (!existing) {
      throw Error(`Invalid refund Id ${refundId}`);
    }

    if (existing.refundInfo.status !== "pending") {
      throw Error(`Refund status is not pending anymore`);
    }

    if (result.data === "pending") {
      throw Error(`New refund status is pending instead of rejected/approved`);
    }

    let updateResult;
    // reject route, just simply update the status to reject
    if (result.data === "rejected") {
      updateResult = await adminRefundRepository.updateRefundStatus(
        refundId,
        newStatus,
        "",
        1,
        processed_by,
      );
    } else {
      const { customer } = await orderRepository.getCustomerOrder(
        existing.refundInfo.order_id,
      );

      if (paymentAmount > customer.total_amount) {
        throw new Error(
          `Refund amount RM ${paymentAmount} exceeds order total RM ${customer.total_amount}`,
        );
      }

      const refund = await stripeGateway.createRefundIntent(
        Math.round(paymentAmount * 100),
        customer.payment_ref,
        `refund_${existing.refundInfo.order_id}`,
      );

      updateResult = await adminRefundRepository.updateRefundStatus(
        refundId,
        newStatus,
        refund.id,
        paymentAmount,
        processed_by,
      );
    }

    if (!updateResult) {
      throw Error("Update status failed");
    }
  },

  async massRejectRefundRequest(
    refundIds: string[],
    processed_by: string,
    log: Logger,
  ) {
    log.info(`Reject for ${refundIds.length} amount of refund request`);

    const amountOfUpdateSuccess = await adminRefundRepository.massRejectRefund(
      refundIds,
      processed_by,
    );

    return amountOfUpdateSuccess;
  },
};

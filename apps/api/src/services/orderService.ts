import { orderRepository } from "src/repositories/orderRepository";
import { stripeGateway } from "src/gateways/stripeGateway";
import { cartRepository } from "src/repositories/cartRepository";
import { logger, Logger } from "../utils/loggerHelper";
import { Request } from "express";
import { PoolClient } from "pg";
import { checkoutRepository } from "src/repositories/checkoutRepository";
import {
  adminOrderSortOptions,
  orderFilterOptions,
} from "@ecom/shared/type/order";

const MAX_CONFIRM_ORDER_WAIT_MS = 10_000;
const POLL_INTERVAL_MS = 1000;

export const orderService = {


  async getCustomerOrder(orderId: string, userId: string, log: Logger) {
    log.debug(`Fetching single order ${orderId}`);
    const { customer, items } = await orderRepository.getCustomerOrder(orderId, userId);

    if (!customer) {
      log.warn(`No order found for orderId ${orderId} for userId ${userId}`);
      throw new Error("Invalid customer info. Maybe user trying to access another user order");
    } else {
      log.info(`Fetched order ${orderId} with ${items.length} items`);
    }

    return {
      orderCustomerInfo: customer,
      orderItems: items,
      message: "get order Success",
    };
  },

  async getAllOrders(query: Request["query"], log: Logger, userId?: string) {
    const limit = parseInt(String(query.limit ?? "")) || 5;
    const offset = parseInt(String(query.offset ?? "")) || 0;
    
    const sortBy = String(query.sortBy);
    const filterBy = String(query.filterBy ?? "all");
    const search = query.search ? String(query.search) : "";

    if (!adminOrderSortOptions.some((option) => option.value === sortBy)) {
      throw new Error(`Invalid sort parameter ${sortBy}}`);
    }

    if (!orderFilterOptions.some((option) => option === filterBy)) {
      throw new Error(`Invalid filter parameter ${filterBy}}`);
    }

    if (limit > 100) {
      throw new Error(`Limit mote than 100`);
    }

    log.debug("Fetching orders table", {
      limit,
      offset,
      sortBy,
      filterBy,
      search,
    });

    const { orders, total } = await orderRepository.getOrderTable(
      {
        limit,
        offset,
        sortBy,
        filterBy,
        search,
      },
      userId,
    );

    log.info(`Returned ${orders.length} orders (${total} total matching)`);
    return { orders, orderCount: total, message: "get order Success" };
  },

  async confirmOrder(orderId: string, userId: string, log: Logger) {
    const deadline = Date.now() + MAX_CONFIRM_ORDER_WAIT_MS;
    let pollCount = 0;

    //confirm order will confirm the payment intent of stripe. 
    // waiting the most for 10 seconds(MAX_CONFIRM_ORDER_WAIT_MS)
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    while (true) {
      pollCount++;

      // order expired cases
      const order = await orderRepository.getOrderStatusAndPaymentRef(orderId);
      if (!order) return { status: "notFound" } as const;

      if (order.status === "paid") {
        log.info(`Order confirmed ${orderId}, ${pollCount}`);
        return { status: "paid" } as const;
      }

      // timeout can be due to processing for too long
      // next time either they check again 
      // or cron will do the job to set order status as 'paid'
      if (Date.now() >= deadline) {
        log.warn(` Confirmation timeout${orderId}, ${pollCount}`);
        return { status: order.status } as const;
      }

      const pi = await stripeGateway.retrievePaymentIntent(order.payment_ref);

      switch (pi.status) {
        case "succeeded": {
          log.info(`Stripe succeeded but webhook may have missed ${orderId}`);
          await orderService.markOrderAsPaid(order.payment_ref, log);
          return { status: "paid" } as const;
        }
        case "requires_payment_method":
          return { status: "failed" } as const;
        case "requires_confirmation":
        case "requires_action":
        case "processing":
          break;
        case "canceled":
          return { status: "failed" } as const;
        case "requires_capture":
        default:
          break;
      }

      await sleep(POLL_INTERVAL_MS);
    }
  },

  // check if pending order still exist
  async validatePendingOrder(orderId: string): Promise<boolean> {
    const result = await orderRepository.validateIfOrderPending(orderId);
    return (result?.rowCount ?? 0) > 0;
  },

  async markOrderAsPaid(payment_ref: string, log: Logger) {
    const order = await orderRepository.markPaid(payment_ref);
    if (order) {
      log.info(`Order marked paid for user ${order.user_id}`, {
        paymentIntentId: payment_ref,
      });

      const { items } = await orderRepository.getCustomerOrder(
        order.order_id,
        order.user_id
      );

      const now = new Date();
      const year = now.getFullYear(); // 2026
      const month = now.getMonth() + 1;

      console.log(items);
      log.debug(
        `Monthly sales insertion for ${order.order_id}, total ${items.length} had been updated`,
      );

      // once order mark as paid, insert monthly sales record
      await Promise.all([
        ...items.map((i) => 
           orderRepository.updateMonthlySalesRecord({
            productId: i.product_id,
            year,
            month,
            units_sold: i.quantity,
            revenue: i.item_total_price,
          })
        ),
         cartRepository.clearCart(order.user_id),
      ]);

      log.debug(`Cart cleared for user ${order.order_id}`);
    }
  },
  async markOrderAsExpired(
    client: PoolClient,
    orderId: string,
  ): Promise<boolean> {
    const result = await orderRepository.markExpired(client, orderId);

    if (result.rowCount === 0) {
      logger.warn(
        `Order ${orderId} changed mid-check — skipping stock restore`,
      );
      return false;
    }

    await checkoutRepository.incrementStockFromOrderItem(client, orderId); // await added, from before

    return true;
  },

  async createRefundRequest(
    orderId: string,
    reason: string,
    requestedBy: string,
  ) {
    const {customer} = await orderRepository.getCustomerOrder(orderId, requestedBy);

    if (!customer) {
      throw new Error("Order not found");
    }

    // status that not allow to create refund request
    if(customer.status === 'pending' || customer.status === 'expired' || customer.status === 'canceled' || customer.status === 'refunded'){
      throw new Error("Unable to request refund");
      
    }

    logger.info("Start adding refund request");
    const refundRequestResult = await orderRepository.createNewRefundRequest(
      orderId,
      reason,
      customer.total_amount,
      requestedBy,
    );
    if (refundRequestResult.rows.length <= 0) {
      logger.error("Invalid refund request as refund request already exist");
      throw new Error("Invalid refund request as refund request already exist");
    }
  },
 
};

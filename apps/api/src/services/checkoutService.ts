import { PoolClient } from "pg";
import { withTransaction } from "src/db/withTransaction";
import { checkoutRepository } from "src/repositories/checkoutRepository";
import { stripeGateway } from "src/gateways/stripeGateway";
import { useridToLockKey } from "src/utils/lockKey";
import { logger, type Logger } from "src/utils/loggerHelper";
import { CartItemResponse } from "@ecom/shared/type/cart";
import type { ReconcileResult } from "@ecom/shared/type/checkout";

const env = process.env.NODE_ENV;

const CHECKOUT_EXPIRED_MINUTES = 10;

/** Thrown to unwind the transaction (ROLLBACK) with a response already decided — success or error alike. */
class CheckoutHalt extends Error {
  constructor(
    public status: number,
    public body: Record<string, any>,
  ) {
    super(`checkout-halt:${status}`);
  }
}

async function createNewOrder(
  client: PoolClient,
  userId: string,
  cartRows: CartItemResponse[],
  log: Logger,
) {
  let totalAmount = 0;

  // first check about the stock availability for reserved
  for (const row of cartRows) {
    const reserved = await checkoutRepository.decrementStock(
      client,
      row.variation_id,
      row.quantity,
    );
    if (!reserved) {
      log.warn(`Stock reservation failed for variation ${row.variation_id}`);
      throw new CheckoutHalt(409, {
        error: "Some items no longer have enough stock",
        variation_id: row.variation_id,
      });
    }
    totalAmount += row.quantity * row.final_price;
  }

  // if all cart items allow to reserve, insert order items and set the expire time of order
  const expiresAt = new Date(Date.now() + CHECKOUT_EXPIRED_MINUTES * 60 * 1000);
  const orderId = await checkoutRepository.insertOrder(
    client,
    userId,
    totalAmount,
    expiresAt,
  );

  for (const row of cartRows) {
    await checkoutRepository.insertOrderItem(
      client,
      orderId,
      row.product_id,
      row.variation_id,
      row.quantity,
      row.final_price,
    );
  }

  log.info(`New order ${orderId} created for user ${userId}`, {
    itemCount: cartRows.length,
    totalAmount,
  });
  return { orderId, totalAmount };
}

async function syncExistingOrder(
  client: PoolClient,
  orderId: string,
  cartRows: CartItemResponse[],
  log: Logger,
) {
  // fetch the previous orderItems from db
  const orderItems = await checkoutRepository.getOrderItems(client, orderId);

  if (orderItems.length <= 0) {
    throw new CheckoutHalt(400, { error: "Invalid checkout items" });
  }
  console.log("Sync ORDER ITEM PROBLEM CHECKING",orderItems);
  // get the items to remove
  const removedItems = orderItems.filter(
    (oi) => !cartRows.some((ci) => ci.variation_id === oi.variation_id),
  );

  // delete order items and going back to stock
  for (const ri of removedItems) {
    await checkoutRepository.deleteOrderItem(client, ri.order_item_id);
    await checkoutRepository.incrementStock(
      client,
      ri.variation_id,
      ri.quantity,
    );
  }
  if (removedItems.length > 0) {
    log.debug(
      `Removed ${removedItems.length} items no longer in cart from order ${orderId}`,
    );
  }

  let totalAmount = 0;

  // recalculate the total amount
  // adjusting old order items and add new order items
  for (const cartItem of cartRows) {
    const oldOrderItem = orderItems.find(
      (oi) => cartItem.variation_id === oi.variation_id,
    );

    // adjusting the existing order
    if (oldOrderItem) {
      await checkoutRepository.updateOrderItemQuantity(
        client,
        orderId,
        cartItem.variation_id,
        cartItem.quantity,
      );

      const delta = oldOrderItem.quantity - cartItem.quantity;
      const ok = await checkoutRepository.adjustStock(
        client,
        cartItem.variation_id,
        delta,
      );
      // failed which could happen due to stock went negative after adjustment
      if (!ok) {
        log.warn(
          `Stock adjustment failed for variation ${cartItem.variation_id}`,
        );
        throw new CheckoutHalt(409, {
          error: "Some items no longer have enough stock",
          variation_id: cartItem.variation_id,
        });
      }
    } else {
      // adding new item and reserve it
      const reserved = await checkoutRepository.decrementStock(
        client,
        cartItem.variation_id,
        cartItem.quantity,
      );
      if (!reserved) {
        log.warn(
          `Stock reservation failed for new variation ${cartItem.variation_id}`,
        );
        throw new CheckoutHalt(409, {
          error: "Some items no longer have enough stock",
          variation_id: cartItem.variation_id,
        });
      }
      await checkoutRepository.insertOrderItem(
        client,
        orderId,
        cartItem.product_id,
        cartItem.variation_id,
        cartItem.quantity,
        cartItem.final_price,
      );
    }

    totalAmount += cartItem.quantity * cartItem.final_price;
  }

  await checkoutRepository.updateOrderTotal(client, orderId, totalAmount);
  log.info(`Order ${orderId} synced with current cart`, {
    itemCount: cartRows.length,
    totalAmount,
  });

  return { orderId, totalAmount };
}

interface ReconcilableOrder {
  order_id: string | null;
  payment_ref: string | null;
}

// return if should create new order or use back the existing order
async function reconcileOrderWithStripe(
  order: ReconcilableOrder,
): Promise<ReconcileResult> {
  if (!order.payment_ref || !order.order_id) {
    logger.info("Invalid payment_ref or order_id. Require createNewOrder");
    return "createNewOrder";
  }

  let pi;
  try {
    pi = await stripeGateway.retrievePaymentIntent(order.payment_ref);
  } catch (e) {
    logger.error(
      `Failed to retrieve PaymentIntent for payment_ref ${order.order_id}`,
      e,
    );
    return "paymentUnresolved";
  }

  logger.info(`Order Id ${order.order_id} PI status: ${pi.status}`);

  if (pi.status === "succeeded" || pi.status === "processing") {
    return "paymentUnresolved";
  }

  if (pi.status === "canceled") {
    return "createNewOrder";
  }

  return "reusePendingOrder";
}

async function resolvePaymentIntent(
  client: PoolClient,
  orderId: string,
  totalAmount: number,
  existingPaymentRef: string | null | undefined,
  log: Logger,
): Promise<string> {
  //let createNewOrder = false;
  if (existingPaymentRef) {
    const existingPI =
      await stripeGateway.retrievePaymentIntent(existingPaymentRef);
    log.debug(
      `Existing PaymentIntent ${existingPI.id} status: ${existingPI.status}`,
    );

    switch (existingPI.status) {
      case "requires_payment_method":
      case "requires_confirmation":
      case "requires_action": {
        const newAmount = Math.round(totalAmount * 100);
        log.info(`Stripe payment update for total amount ${newAmount} in ${orderId}`);
        if (existingPI.amount !== newAmount) {
          const updatedPI = await stripeGateway.updatePaymentIntentAmount(
            existingPI.id,
            newAmount,
          );
          return updatedPI.client_secret!;
        }
        return existingPI.client_secret!;
      }

      case "succeeded":
        log.info(`Order ${orderId} already paid`);
        throw new CheckoutHalt(200, { orderId, status: "succeeded" });
      case "processing":
        throw new CheckoutHalt(409, {
          error: "Payment already in progress, please wait",
          status: "processing",
        });
      case "canceled":
        //leave the canceled order for cron to clean
        break;
      case "requires_capture":
      default:
        log.error(
          `Unexpected PaymentIntent status for order ${orderId}: ${existingPI.status}`,
        );
        throw new CheckoutHalt(409, {
          error: "Unable to resume checkout, please try again",
        });
    }
  }

  // only when payment status === cancel or no existing payment ref
  const newPI = await stripeGateway.createPaymentIntent(
    Math.round(totalAmount * 100),
    "myr",
    { order_id: orderId },
    `checkout_${orderId}`,
  );
  await checkoutRepository.updateOrderPaymentRef(client, orderId, newPI.id);
  log.info(`Created new PaymentIntent ${newPI.id} for order ${orderId}`);
  return newPI.client_secret!;
}

export const checkoutService = {
  async initCheckout(
    userId: string,
    log: Logger,
  ): Promise<{ status: number; body: Record<string, any> }> {
    try {
      // return status and body from withTransaction.
      // At the end of try was the real return that return the actual status and body
      const {status, body} = await withTransaction(async (client) => {
        await checkoutRepository.acquireUserLock(
          client,
          useridToLockKey(userId),
        );

        const cartRows = await checkoutRepository.getCartItems(client, userId);
        if (cartRows.length === 0) {
          throw new CheckoutHalt(400, { error: "Cart is empty" });
        }
        if (cartRows.some((cr) => !cr.variation_id)) {
          throw new CheckoutHalt(400, { error: "Invalid cart item" });
        }

        const existingOrder = await checkoutRepository.getActivePendingOrder(
          client,
          userId,
        );

        // reconcileOrderWithStripe will ensure to check any existing pending order
        // in case multiple edge case happen which could result user paid but database not yet update
        let action = "createNewOrder";
        console.log(existingOrder);
        if (existingOrder) {
          action = await reconcileOrderWithStripe({
            order_id: existingOrder.order_id,
            payment_ref: existingOrder.payment_ref,
          });

          if (action === "paymentUnresolved") {
            return {
              status: 303,
              body: {
                orderId: existingOrder.order_id,
                clientSecret: "",
                ReconcileResult: action,
              },
            };
          }
        }
        logger.info(`Action = ${action} after reconcileOrder checking `);
        const { orderId, totalAmount } =
          action === "reusePendingOrder"
            ? await syncExistingOrder(
                client,
                existingOrder.order_id,
                cartRows,
                log,
              )
            : await createNewOrder(client, userId, cartRows, log);
            
        const clientSecret = env === 'test' ? "p-test" : await resolvePaymentIntent(
          client,
          orderId,
          totalAmount,
          existingOrder?.payment_ref,
          log,
        );
      
        return {status:202,body:{orderId, clientSecret, ReconcileResult: action} };
      });


      return { status, body };
    } catch (e) {
      if (e instanceof CheckoutHalt) {
        return { status: e.status, body: e.body };
      }
      throw e;
    }
  },
};

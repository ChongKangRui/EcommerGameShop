import { Request, Response, NextFunction } from "express";
import { pool } from "../db/db"; // adjust to your actual pool import
import Stripe from "stripe";
import { AuthRequest } from "src/middleWare/auth";
import { CartItemResponse } from "@ecom/shared/src/type/cart";
import { OrderItemResponse } from "@ecom/shared/src/type/order";
import { createHash } from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const CHECKOUT_TTL_MINUTES = 1;

function useridToLockKey(userId: string): bigint {
  const hash = createHash("sha256").update(userId).digest();
  return hash.readBigInt64BE(0);
}

export const initCheckout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const client = await pool.connect();
  
  try {
    // two case when client click checkout
    // 1. client make a new order, no existing order before(or old order was expired)
    // 2. client have existing order, existing order need to be updated

    // three cases when client have existing order and
    // they goes back change their item OR refresh page:
    // 1. items quantity change
    // 2. items getting remove from cart completely
    // 3. new item added

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized action",
      });
    }

    console.log("Start init checkout");

    await client.query("BEGIN");

    // make an advisory lock, ensure that if any new request accessing to the same userId
    // it could wait and ensure all the update were finish,
    // preventing having stale query or non idempotency issue.
    await client.query("SELECT pg_advisory_xact_lock($1)", [
      useridToLockKey(userId),
    ]);

    const cartResult = await client.query<CartItemResponse>(
      `SELECT ci.*, pv.*, p.name,
           (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
          FROM cart ci
          JOIN product_variations pv ON ci.variation_id = pv.variation_id
          JOIN products p ON pv.product_id = p.product_id
          WHERE ci.user_id = $1`,
      [userId],
    );



    if (cartResult.rows.length === 0 ) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cart is empty" });
    }

     let invalidProductExist = cartResult.rows.some((cr)=>!cr.variation_id);

    if(invalidProductExist){
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid cart item" });
    }

    // get the existing order
    const existing = await client.query(
      `SELECT order_id, payment_ref
        FROM orders
        WHERE user_id = $1 AND status = 'pending' AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId],
    );

    let totalAmount = 0;
    let orderId =
      existing.rows.length > 0 ? existing.rows[0].order_id : undefined;

    if (!orderId) {
      for (const row of cartResult.rows) {
        const result = await client.query(
          `UPDATE product_variations
         SET stock = stock - $1
         WHERE variation_id = $2 AND stock >= $1
         RETURNING variation_id`,
          [row.quantity, row.variation_id],
        );

        if (result.rowCount === 0) {
          await client.query("ROLLBACK");
          return res.status(409).json({
            error: "Some items no longer have enough stock",
            variation_id: row.variation_id,
          });
        }

        totalAmount += row.quantity * row.final_price;
      }

      const expiresAt = new Date(Date.now() + CHECKOUT_TTL_MINUTES * 60 * 1000);

      const orderResult = await client.query(
        `INSERT INTO orders (user_id, status, total_amount, expires_at)
       VALUES ($1, 'pending', $2, $3)
       RETURNING order_id`,
        [userId, totalAmount, expiresAt],
      );
      orderId = orderResult.rows[0].order_id;

      for (const row of cartResult.rows) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, variation_id, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
          [
            orderId,
            row.product_id,
            row.variation_id,
            row.quantity,
            row.final_price,
          ],
        );
      }
    } else {
      const orderItemsResult = await client.query<OrderItemResponse>(
        `SELECT *
        FROM order_items
        WHERE order_id = $1
        ORDER BY created_at DESC`,
        [orderId],
      );

      const orderItems = orderItemsResult.rows;

      if (orderItems.length <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid checkout items" });
      }

      // get removedItems
      const removedItems = orderItems.filter((oi) => {
        return !cartResult.rows.some(
          (ci) => ci.variation_id === oi.variation_id,
        );
      });

      
      // update product variation and delete order_items
      for (const ri of removedItems) {
        await client.query(`DELETE FROM order_items WHERE order_item_id = $1`, [
          ri.order_item_id,
        ]);
        await client.query(
          `UPDATE product_variations SET stock = stock + $1 WHERE variation_id = $2`,
          [ri.quantity, ri.variation_id],
        );
      }

      // update or add new order item, sync the order item with the current cart item
      for (const cartItem of cartResult.rows) {
        const oldOrderItems = orderItems.find(
          (oi) => cartItem.variation_id === oi.variation_id,
        );
        if (oldOrderItems) {
          await client.query(
            `UPDATE order_items
            SET quantity = $1
          WHERE variation_id = $2
          `,
            [cartItem.quantity, cartItem.variation_id],
          );
          
          // ensure stock never went negative
          const result = await client.query(
            `UPDATE product_variations SET stock = stock + $1 
            WHERE variation_id = $2 AND stock + $1 >= 0
            RETURNING variation_id`,
            [oldOrderItems.quantity - cartItem.quantity, cartItem.variation_id],
          );

          if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({
              error: "Some items no longer have enough stock",
              variation_id: cartItem.variation_id,
            });
          }
        } else {
          const result = await client.query(
            `UPDATE product_variations
         SET stock = stock - $1
         WHERE variation_id = $2 AND stock >= $1
         RETURNING variation_id`,
            [cartItem.quantity, cartItem.variation_id],
          );

          if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({
              error: "Some items no longer have enough stock",
              variation_id: cartItem.variation_id,
            });
          }
          await client.query(
            `INSERT INTO order_items (order_id, product_id, variation_id, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
            [
              orderId,
              cartItem.product_id,
              cartItem.variation_id,
              cartItem.quantity,
              cartItem.final_price,
            ],
          );
        }
        totalAmount += cartItem.quantity * cartItem.final_price;

        await client.query(
        `Update orders SET
        total_amount = $2
       where order_id = $1
       `,
        [orderId, totalAmount],
      );
      }
    }

    let clientSecret: string;
    // Ensure idempotency in term of payment reference.
    // if payment already exist, reuse back the payment ref, otherwise
    // create the new one, assuming the old one already processed
    if (existing.rows.length > 0 && existing.rows[0].payment_ref) {
      const existingPI = await stripe.paymentIntents.retrieve(
        existing.rows[0].payment_ref,
      );

      console.log("EEEEEEEEEEEEEEEEEEEE ",existingPI.status);

      switch (existingPI.status) {
        case "requires_payment_method":
        case "requires_confirmation":
        case "requires_action": {
          const newAmount = Math.round(totalAmount * 100);
          if (existingPI.amount !== newAmount) {
            const updatedPI = await stripe.paymentIntents.update(
              existingPI.id,
              {
                amount: newAmount,
              },
            );
            clientSecret = updatedPI.client_secret!;
          } else {
            clientSecret = existingPI.client_secret!;
          }
          break;
        }
        case "succeeded":
          await client.query("ROLLBACK");
          console.log("Successd");
          return res.status(200).json({ orderId, alreadyPaid: true });
        case "processing":
          await client.query("ROLLBACK");
          return res
            .status(409)
            .json({ error: "Payment already in progress, please wait" });
        // case "canceled": {
        //   const newPI = await stripe.paymentIntents.create(
        //     {
        //       amount: Math.round(totalAmount * 100),
        //       currency: "myr",
        //       payment_method_types: ["card"],
        //       metadata: { order_id: orderId },
        //     },
        //     { idempotencyKey: `checkout_${orderId}` },
        //   );
        //   await client.query(
        //     `UPDATE orders SET payment_ref = $1 WHERE order_id = $2`,
        //     [newPI.id, orderId],
        //   );
        //   clientSecret = newPI.client_secret!;
        //   break;
        // }
        case "requires_capture":
        default:
          // shouldn't normally happen for a card-only, auto-capture flow —
          // but don't leave the request hanging if it does
          await client.query("ROLLBACK");
          console.error(
            `Unexpected PaymentIntent status: ${existingPI.status}`,
          );
          return res
            .status(409)
            .json({ error: "Unable to resume checkout, please try again" });
      }
    } else {
      const newPI = await stripe.paymentIntents.create(
        {
          amount: Math.round(totalAmount * 100),
          currency: "myr",
          payment_method_types: ["card"],
          metadata: { order_id: orderId },
        },
        { idempotencyKey: `checkout_${orderId}` },
      );
      await client.query(
        `UPDATE orders SET payment_ref = $1 WHERE order_id = $2`,
        [newPI.id, orderId],
      );
      clientSecret = newPI.client_secret!;
    }

    await client.query("COMMIT");

    res.status(200).json({
      orderId,
      clientSecret,
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.log(e);
    res.status(500).json({ error: "Unable to start checkout" });
  } finally {
    client.release();
  }
};

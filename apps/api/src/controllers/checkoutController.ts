import { Request, Response, NextFunction } from "express";
import { pool } from "../db"; // adjust to your actual pool import
import Stripe from "stripe";
import { AuthRequest } from "src/middleWare/auth";
import { CartItemResponse } from "@ecom/shared/src/type/cart";
import { OrderItemResponse } from "@ecom/shared/src/type/order";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const CHECKOUT_TTL_MINUTES = 15;

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

    console.log("Start init checkout");

    await client.query("BEGIN");

    const cartResult = await client.query<CartItemResponse>(
      `SELECT ci.*, pv.*, p.name,
           (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
          FROM cart ci
          JOIN product_variations pv ON ci.variation_id = pv.variation_id
          JOIN products p ON pv.product_id = p.product_id
          WHERE ci.user_id = $1`,
      [userId],
    );

    if (cartResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cart is empty" });
    }

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

      // ensure atomic update one at a tinme
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

      // ensure atomic update one at a tinme
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

          const result = await client.query(
            `UPDATE product_variations SET stock = stock + $1 
            WHERE variation_id = $2 AND stock >= $1
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
      }

    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "myr",
      payment_method_types: ["card"],
      metadata: { order_id: orderId },
    });

    await client.query(
      `UPDATE orders SET payment_ref = $1 WHERE order_id = $2`,
      [paymentIntent.id, orderId],
    );

    await client.query("COMMIT");

    res.status(200).json({
      orderId,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.log(e);
    res.status(500).json({ error: "Unable to start checkout" });
  } finally {
    client.release();
  }
};

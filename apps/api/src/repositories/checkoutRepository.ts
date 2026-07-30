import { PoolClient } from "pg";
import { CartItemResponse } from "@ecom/shared/type/cart";
import { OrderItemResponse } from "@ecom/shared/type/order";

export const checkoutRepository = {
  async acquireUserLock(client: PoolClient, lockKey: bigint) {
    await client.query("SELECT pg_advisory_xact_lock($1)", [lockKey]);
  },

  async getCartItems(client: PoolClient, userId: string) {
    const result = await client.query<CartItemResponse>(
      `SELECT ci.*, pv.*, p.name,
         (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1`,
      [userId],
    );
    return result.rows;
  },

  async getActivePendingOrder(client: PoolClient, userId: string) {
    const result = await client.query<{ order_id: string; payment_ref: string | null }>(
      `SELECT order_id, payment_ref
       FROM orders
       WHERE user_id = $1 AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    );
    return result.rows[0] ?? null;
  },

  async getOrderItems(client: PoolClient, orderId: string) {
    const result = await client.query<OrderItemResponse>(
      `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at DESC`,
      [orderId],
    );
    return result.rows;
  },

  async insertOrder(client: PoolClient, userId: string, totalAmount: number, expiresAt: Date) {
    const result = await client.query(
      `INSERT INTO orders (user_id, status, total_amount, expires_at)
       VALUES ($1, 'pending', $2, $3) RETURNING order_id`,
      [userId, totalAmount, expiresAt],
    );
    return result.rows[0].order_id as string;
  },

  async insertOrderItem(
    client: PoolClient,
    orderId: string,
    productId: number,
    variationId: string,
    quantity: number,
    price: number,
  ) {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, variation_id, quantity, price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, productId, variationId, quantity, price],
    );
  },

  async deleteOrderItem(client: PoolClient, orderItemId: string) {
    await client.query(`DELETE FROM order_items WHERE order_item_id = $1`, [orderItemId]);
  },

  async updateOrderItemQuantity(client: PoolClient, variationId: string, order_id: string, quantity: number) {
    await client.query(`UPDATE order_items SET quantity = $1 WHERE order_id = $2 AND variation_id = $3`, [quantity, order_id,variationId]);
  },

  async updateOrderTotal(client: PoolClient, orderId: string, totalAmount: number) {
    await client.query(`UPDATE orders SET total_amount = $2 WHERE order_id = $1`, [orderId, totalAmount]);
  },

  async updateOrderPaymentRef(client: PoolClient, orderId: string, paymentRef: string) {
    await client.query(`UPDATE orders SET payment_ref = $1 WHERE order_id = $2`, [paymentRef, orderId]);
  },

  async decrementStock(client: PoolClient, variationId: string, quantity: number) {
    const result = await client.query(
      `UPDATE product_variations SET stock = stock - $1 WHERE variation_id = $2 AND stock >= $1 RETURNING variation_id`,
      [quantity, variationId],
    );
    return (result.rowCount ?? 0) > 0;
  },

  async incrementStock(client: PoolClient, variationId: string, quantity: number) {
    await client.query(`UPDATE product_variations SET stock = stock + $1 WHERE variation_id = $2`, [quantity, variationId]);
  },
  async incrementStockFromOrderItem(client: PoolClient, orderId: string) {
    await client.query(`UPDATE product_variations pv
            SET stock = stock + oi.quantity
            FROM order_items oi
            WHERE oi.order_id = $1 AND pv.variation_id = oi.variation_id`, [orderId]);
  },

  async adjustStock(client: PoolClient, variationId: string, delta: number) {
    const result = await client.query(
      `UPDATE product_variations SET stock = stock + $1 WHERE variation_id = $2 AND stock + $1 >= 0 RETURNING variation_id`,
      [delta, variationId],
    );
    return (result.rowCount ?? 0) > 0;
  },
};
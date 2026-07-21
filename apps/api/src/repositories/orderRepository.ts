import { pool } from "src/db/db";

export const orderRepository = {
  async findByIdForUser(orderId: string, userId: string) {
    const result = await pool.query<{ status: string; payment_ref: string }>(
      `SELECT status, payment_ref FROM orders WHERE order_id = $1 AND user_id = $2`,
      [orderId, userId],
    );
    return result.rows[0] ?? null;
  },

  async markPaid(paymentRef: string) {
    await pool.query(
      `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE payment_ref = $1`,
      [paymentRef],
    );
  },

//   async clearCart(userId: string) {
//     await pool.query(`DELETE FROM cart WHERE user_id = $1`, [userId]);
//   },
};
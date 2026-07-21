import { pool } from "src/db/db";

export const cartRepository = {
  async clearCart(userId: string) {
    await pool.query(`DELETE FROM cart WHERE user_id = $1`, [userId]);
  },
};
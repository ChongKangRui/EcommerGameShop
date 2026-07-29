import { pool } from "src/db/db";
import { CartItemResponse } from "@ecom/shared/src/type/cart";

export const cartRepository = {
  async clearCart(userId: string) {
    await pool.query(`DELETE FROM cart WHERE user_id = $1`, [userId]);
  },

  async findVariationsForGuestCart(variationIds: string[]) {
    const result = await pool.query<CartItemResponse>(
      `SELECT pv.*,
         p.name,
         (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
       FROM product_variations pv
       JOIN products p ON pv.product_id = p.product_id
       WHERE pv.variation_id = ANY($1)
       ORDER BY pv.created_at ASC`,
      [variationIds],
    );
    return result.rows;
  },

  async findStockByVariationIds(variationIds: string[]) {
    const result = await pool.query<{ variation_id: string; stock: number }>(
      `SELECT variation_id, stock FROM product_variations WHERE variation_id = ANY($1)`,
      [variationIds],
    );
    return result.rows;
  },

  async insertCartItem(userId: string, variationId: string, quantity: number) {
    await pool.query(
      `INSERT INTO cart (user_id, variation_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, variation_id)
       DO UPDATE SET quantity = $3`,
      [userId, variationId, quantity],
    );
  },

  // async findCartItemsForUser(userId: string) {
  //   const result = await pool.query<CartItemResponse>(
  //     `SELECT ci.*, pv.*, p.name,
  //        (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
  //      FROM cart ci
  //      JOIN product_variations pv ON ci.variation_id = pv.variation_id
  //      JOIN products p ON pv.product_id = p.product_id
  //      WHERE ci.user_id = $1`,
  //     [userId],
  //   );
  //   return result.rows;
  // },

  async findCartItemsForUser(userId: string) {
    const result = await pool.query<CartItemResponse>(
      `SELECT ci.*, pv.*, pv.stock + COALESCE((
         SELECT oi.quantity
         FROM order_items oi
         JOIN orders o ON o.order_id = oi.order_id
         WHERE oi.variation_id = pv.variation_id
           AND o.user_id = $1
           AND o.status = 'pending'
           AND o.expires_at > NOW()
         LIMIT 1
       ), 0) AS stock, p.name, p.is_active,
         (p.price + pv.price_offset) * (1 - p.discount_percentage / 100.0) AS final_price
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1`,
      [userId],
    );
    return result.rows;
  },

  async findAvailableStock(variationId: string, userId?:string) {
  
    
    const result = await pool.query<{ product_id: number; stock: number }>(
    `SELECT pv.product_id,
       pv.stock + COALESCE((
         SELECT oi.quantity
         FROM order_items oi
         JOIN orders o ON o.order_id = oi.order_id
         WHERE oi.variation_id = pv.variation_id
           AND o.user_id = $2
           AND o.status = 'pending'
           AND o.expires_at > NOW()
         LIMIT 1
       ), 0) AS stock
     FROM product_variations pv
     JOIN products p ON pv.product_id = p.product_id
     WHERE pv.variation_id = $1 AND p.is_active = true`,
    [variationId, userId ?? null],
  );
  

  return result.rows[0] ?? null;
    
  },

  async updateCartItemQuantity(
    userId: string,
    variationId: string,
    quantity: number,
  ) {
    await pool.query(
      `UPDATE cart SET quantity = $1 WHERE variation_id = $2 AND user_id = $3`,
      [quantity, variationId, userId],
    );
  },

  async deleteCartItem(userId: string, variationId: string) {
    await pool.query(
      `DELETE FROM cart WHERE variation_id = $1 AND user_id = $2`,
      [variationId, userId],
    );
  },

  async findCartValidationItems(userId: string) {
    const result = await pool.query<{ quantity: number; stock: number;variation_id: string }>(
      `SELECT ci.quantity, pv.stock, pv.variation_id
       FROM cart ci
       JOIN product_variations pv ON ci.variation_id = pv.variation_id
       JOIN products p ON pv.product_id = p.product_id
       WHERE ci.user_id = $1 AND p.is_active`,
      [userId],
    );
    return result.rows;
  },
};

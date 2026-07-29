import {
  OrderItem,
  OrderWithCustomer,
} from "@ecom/shared/src/type/order";
import { SearchQueryParams } from "@ecom/shared/src/type/search";
import { PoolClient, QueryResult } from "pg";
import { pool } from "src/db/db";
import { Order } from "stripe/cjs/resources/Climate";

export const orderRepository = {
  async getOrderTable(f: SearchQueryParams, user_id?: string) {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    const [sortColumn, sortDirection] = (f.sortBy ?? "").split(":");

    if (f.search) {
      conditions.push(`o.order_id::text ILIKE $${i}`);
      values.push(`%${f.search}%`);
      i++;
    }
    if (f.filterBy !== "all") {
      conditions.push(`status = $${i}`);
      values.push(f.filterBy);
      i++;
    }

    if (user_id) {
      conditions.push(`o.user_id = $${i}`);
      values.push(user_id);
      i++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [orders, count] = await Promise.all([
      pool.query<Order>(
        `SELECT o.order_id, o.status, o.total_amount, o.expires_at, o.updated_at, o.created_at,
           CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS name, u.email
         FROM orders o LEFT JOIN users u ON o.user_id = u.user_id
         ${whereClause} ORDER BY ${sortColumn} ${sortDirection}
         LIMIT $${i} OFFSET $${i + 1}`,
        [...values, f.limit, f.offset],
      ),
      pool.query(`SELECT COUNT(*) FROM orders o ${whereClause}`, values),
    ]);

    return { orders: orders.rows, total: parseInt(count.rows[0].count) };
  },

  async getCustomerOrder(orderId: string) {
    const [orderRef, items] = await Promise.all([
      pool.query<OrderWithCustomer>(
        `SELECT o.*,
         COALESCE(
         (SELECT r.status::text FROM refunds r WHERE r.order_id = o.order_id),
         ''
       ) AS refund_status,
         COALESCE(
         (SELECT r.amount FROM refunds r WHERE r.order_id = o.order_id),
         0
       ) AS refund_amount
         FROM public.orders o 
         LEFT JOIN users u ON o.user_id = u.user_id 
         WHERE o.order_id = $1`,
        [orderId],
      ),
      pool.query<OrderItem>(
        `SELECT p.name, oi.order_item_id, oi.quantity, oi.price * oi.quantity AS item_total_price, pv.variation_id, pv.label, pv.image_url, p.product_id
         FROM order_items oi
         LEFT JOIN product_variations pv ON oi.variation_id = pv.variation_id
         LEFT JOIN products p ON pv.product_id = p.product_id
         WHERE oi.order_id = $1 ORDER BY order_item_id ASC`,
        [orderId],
      ),
    ]);
    return { customer: orderRef.rows[0], items: items.rows };
  },
  async getCustomerPendingOrderItems(user_id: string) {
    const orderItems = await pool.query<{
      quantity: number;
      variation_id: string;
    }>(
      `SELECT oi.quantity, pv.variation_id
         FROM orders o 
        JOIN order_items oi ON oi.order_id = o.order_id
         JOIN product_variations pv ON oi.variation_id = pv.variation_id
         WHERE o.user_id = $1 AND o.status = 'pending'`,
      [user_id],
    );
    return orderItems;
  },

  async getOrderStatusAndPaymentRef(orderId: string) {
    const result = await pool.query<{ status: string; payment_ref: string }>(
      `SELECT status, payment_ref FROM orders WHERE order_id = $1`,
      [orderId],
    );
    return result.rows[0] ?? null;
  },
  async getOrderAmount(orderId: string, userId: string) {
    const result = await pool.query<{ total_amount: number }>(
      "SELECT total_amount FROM orders WHERE order_id = $1 AND user_id = $2",
      [orderId, userId],
    );
    return result;
  },

  async getPendingOrder() {
    return await pool.query(
      `SELECT order_id, payment_ref FROM orders
     WHERE status = 'pending' AND expires_at < NOW()`,
    );
  },

  async validateIfOrderPending(order_id: string) {
    return await pool.query(
      `SELECT 1 FROM orders
     WHERE status = 'pending' AND order_id = $1`,
      [order_id],
    );
  },

  async updateMonthlySalesRecord({
    productId,
    year,
    month,
    units_sold,
    revenue,
  }: {
    productId: string;
    year: number;
    month: number;
    units_sold: number;
    revenue: number;
  }) {
    await pool.query(
      `INSERT INTO monthly_product_sales (product_id, year, month, units_sold, revenue)
       VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (product_id, year, month)
       DO UPDATE SET units_sold = monthly_product_sales.units_sold + $4, revenue = monthly_product_sales.revenue + $5
       `,
      [productId, year, month, units_sold, revenue],
    );
    //return result.rows[0] ?? null;
  },
  async deductMonthlySalesRecord({
    productId,
    date,
    units_sold,
    revenue,
  }: {
    productId: string;
    date: string;
    units_sold: number;
    revenue: number;
  }) {
    await pool.query(
      `UPDATE monthly_product_sales msp SET 
      units_sold = msp.units_sold - $3, revenue = msp.revenue - $4
       where product_id = $1 AND  DATE(updated_at) = DATE $2
       `,
      [productId, date, units_sold, revenue],
    );
    //return result.rows[0] ?? null;
  },

  async markPaid(
    paymentRef: string,
  ): Promise<{ order_id: string; user_id: string } | null> {
    const result = await pool.query(
      `UPDATE orders SET status = 'paid', updated_at = NOW() 
      WHERE payment_ref = $1 AND status = 'pending'
      RETURNING order_id, user_id`,
      [paymentRef],
    );
    return result.rows[0] ?? null;
  },

  async markExpired(
    client: PoolClient,
    order_id: string,
  ): Promise<QueryResult<any>> {
    return client.query(
      `UPDATE orders SET status = 'expired', updated_at = NOW()
     WHERE order_id = $1 AND status = 'pending'
     RETURNING order_id`,
      [order_id],
    );
  },

  async createNewRefundRequest(
    orderId: string,
    reason: string,
    amount: number,
    requestedBy: string,
  ) {
    return await pool.query(
      `INSERT INTO refunds (order_id, reason, amount, requested_by)
   SELECT $1, $2, $3, $4
   WHERE NOT EXISTS (
     SELECT 1 FROM refunds WHERE order_id = $1
   )
     RETURNING refund_id`,
      [orderId, reason, amount, requestedBy],
    );
  },
};

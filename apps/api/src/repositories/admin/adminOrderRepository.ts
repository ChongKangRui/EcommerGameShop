import { pool } from "src/db/db";
import {
  GrowthStatus,
  MonthlySalesData,
  MonthlySalesDataRequestInput,
  OrderItem,
  OrderWithCustomer,
} from "@ecom/shared/type/order";


export const adminOrderRepository = {
  async getStatusByIds(orderIds: string[]) {
    const r = await pool.query(
      `SELECT o.status, o.order_id, o.payment_ref FROM orders o WHERE o.order_id = ANY($1)`,
      [orderIds],
    );
    return r.rows as {
      status: string;
      order_id: string;
      payment_ref: string;
    }[];
  },

  
  async getOrderItemWithCustomerInfo(orderId: string) {
    const [customer, items] = await Promise.all([
      pool.query<OrderWithCustomer>(
        `SELECT o.*, u.email, u.address,
           CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS name
         FROM public.orders o LEFT JOIN users u ON o.user_id = u.user_id WHERE o.order_id = $1`,
        [orderId],
      ),
      pool.query<OrderItem>(
        `SELECT p.name, oi.order_item_id, oi.quantity, oi.price * oi.quantity AS item_total_price, pv.label, pv.image_url, p.product_id
         FROM order_items oi
         LEFT JOIN product_variations pv ON oi.variation_id = pv.variation_id
         LEFT JOIN products p ON pv.product_id = p.product_id
         WHERE oi.order_id = $1 ORDER BY order_item_id ASC`,
        [orderId],
      ),
    ]);
    return { customer: customer.rows[0], items: items.rows };
  },

  async updateStatus(orderId: string, status: string) {
    await pool.query(`UPDATE orders SET status = $1 WHERE order_id = $2`, [
      status,
      orderId,
    ]);
  },
  async getMonthlySalesRecord({
    startYear = 1999,
    endYear = 2200,
    startMonth = 1,
    endMonth = 12,
  }: MonthlySalesDataRequestInput) {
    const result = await pool.query<MonthlySalesData>(
      `SELECT 
      sum(revenue) as revenue, 
      sum(units_sold) as units_sold, 
        year,
        month
        from monthly_product_sales
  WHERE (year > $1 OR (year = $1 AND month >= $2))
  AND (year < $3 OR (year = $3 AND month <= $4))
  GROUP BY year, month
  ORDER BY year ASC, month ASC`,
      [startYear, startMonth, endYear, endMonth],
    );

    return result.rows;
    //return result.rows[0] ?? null;
  },
  async getOrderCount(now: Date): Promise<GrowthStatus> {
    const result = await pool.query(
      `SELECT 
       COUNT(*) FILTER (
         WHERE created_at >= date_trunc('month', $1::timestamptz)
           AND status NOT IN ('pending', 'canceled', 'refunded', 'expired')
       ) AS this_month,
       COUNT(*) FILTER (
         WHERE created_at >= date_trunc('month', $1::timestamptz) - INTERVAL '1 month'
           AND created_at < date_trunc('month', $1::timestamptz)
           AND status NOT IN ('pending', 'canceled', 'refunded', 'expired')
       ) AS last_month
     FROM orders`,
      [now],
    );

    const { this_month, last_month } = result.rows[0];
    const thisMonth = Number(this_month);
    const lastMonth = Number(last_month);

    const percentageIncrease =
      lastMonth === 0
        ? thisMonth > 0
          ? 100
          : 0
        : ((thisMonth - lastMonth) / lastMonth) * 100;

    return { count: thisMonth, percentageIncrease };
  },
};

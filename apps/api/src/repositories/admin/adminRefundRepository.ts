import { pool } from "src/db/db";

import { SearchQueryParams } from "@ecom/shared/src/type/search";
import { RefundRow } from "@ecom/shared/src/type/refund";

export const adminRefundRepository = {
  async getRefundTable(f: SearchQueryParams) {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    const [sortColumn, sortDirection] = (f.sortBy ?? "r.created_at:desc").split(
      ":",
    );

    if (f.search) {
      conditions.push(`r.order_id::text ILIKE $${i}`);
      values.push(`%${f.search}%`);
      i++;
    }
    if (f.filterBy && f.filterBy !== "all") {
      conditions.push(`r.status = $${i}`);
      values.push(f.filterBy);
      i++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [refunds, count] = await Promise.all([
      pool.query<RefundRow>(
        `SELECT r.refund_id, r.order_id, r.amount, r.reason, r.status,
              r.created_at,
              CONCAT(COALESCE(req.first_name, ''), ' ', COALESCE(req.last_name, '')) AS requested_by,
              CONCAT(COALESCE(proc.first_name, ''), ' ', COALESCE(proc.last_name, '')) AS processed_by
       FROM refunds r
       LEFT JOIN users req ON r.requested_by = req.user_id
       LEFT JOIN users proc ON r.processed_by = proc.user_id
       ${whereClause}
       ORDER BY ${sortColumn} ${sortDirection}
       LIMIT $${i} OFFSET $${i + 1}`,
        [...values, f.limit, f.offset],
      ),
      pool.query(`SELECT COUNT(*) FROM refunds r ${whereClause}`, values),
    ]);

    return { refunds: refunds.rows, total: parseInt(count.rows[0].count) };
  },

  async getRefundByRefundId(refundId: string) {
    return this.getRefundInfo("refund_id", refundId);
  },

  async getRefundByOrderId(orderId: string) {
    return this.getRefundInfo("order_id", orderId);
  },

  async getRefundInfo(field: string, value: string) {
    const result = await pool.query<RefundRow>(
      `SELECT * FROM refunds WHERE ${field} = $1`,
      [value],
    );
    return { refundInfo: result.rows[0] ?? null };
  },

  async updateRefundStatus(
    refundId: string,
    newStatus: string,
    refund_ref: string,
    refundAmount: number,
    processed_by: string,
  ) {
    const result = await pool.query(
      `Update refunds SET status = $1, processed_by = $2, refund_ref=$3, amount = $4, 
      processed_at = NOW(),
    updated_at = NOW()
    where refund_id = $5
      RETURNING refund_id`,
      [newStatus, processed_by, refund_ref, refundAmount, refundId],
    );
    return result.rows[0] ?? null;
  },

  async massRejectRefund(refundId: string[], processed_by: string) {
    const result = await pool.query(
      `Update refunds SET status = 'rejected', processed_by = $2, processed_at = NOW(),
    updated_at = NOW()
    where refund_id = any($1) AND status = 'pending'
    RETURNING refund_id`,
      [refundId, processed_by],
    );
    return result.rows.length;
  },
};

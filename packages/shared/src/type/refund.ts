import z from "zod";

export const sortRefundTableOptions = [
  { value: "created_at:desc", label: "Newest First" },
  { value: "created_at:asc", label: "Oldest First" },
  { value: "total_amount:asc", label: "Total: Low–High" },
  { value: "total_amount:desc", label: "Total: High–Low" },
  { value: "status:asc", label: "Status A–Z" },
  { value: "status:desc", label: "Status Z–A" },
  { value: "requested_by:asc", label: "Requested By A–Z" },
  { value: "requested_by:desc", label: "Requested By Z–A" },
  { value: "processed_by:asc", label: "Processed By A–Z" },
  { value: "processed_by:desc", label: "Processed By Z–A" },
] as const;

export type RefundRow = {
  refund_id: string;
  order_id: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
  requested_by: string;
  processed_by: string | null;
};

export const refundUpdateOptions: string[] = [
  "pending",
  "rejected",
  "approved",
] as const;

export type RefundsResponse = {
  refunds: RefundRow[];
  count: number;
  message: string;
};


export const refundFilterOptions = ["all", ...refundUpdateOptions] as const;

export const refundUpdateEnum = z.enum(refundUpdateOptions);
export type RefundTypeEnum = z.infer<typeof refundUpdateEnum>;
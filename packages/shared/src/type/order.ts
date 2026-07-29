import { type CartItem } from "./cart";
import { z } from "zod";

export interface OrderItemResponse extends CartItem {
  order_item_id: string;
}

export interface OrderConfirmResponse {
  status: string;
  payment_ref: string;
}

export const orderAdminStatusUpdateOptions: string[] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "refunded",
  "expired",
  "partially_refunded",
] as const;

export const orderFilterOptions = [
  "all",
  ...orderAdminStatusUpdateOptions,
] as const;

export const adminOrderTypeOptions = z.enum(orderAdminStatusUpdateOptions);

export const sortOrderOptions = [
  { value: "created_at:desc", label: "Newest First" },
  { value: "created_at:asc", label: "Oldest First" },
  { value: "total_amount:asc", label: "Total: Low–High" },
  { value: "total_amount:desc", label: "Total: High–Low" },
  { value: "status:asc", label: "Status A–Z" },
  { value: "status:desc", label: "Status Z–A" },
] as const;

// Extended options for admin
export const adminOrderSortOptions = [
  ...sortOrderOptions,
  { value: "expires_at:asc", label: "Expires Soonest" },
  { value: "expires_at:desc", label: "Expires Latest" },
  { value: "updated_at:desc", label: "Recently Updated" },
  { value: "updated_at:asc", label: "Oldest Updated" },
] as const;

export interface Order {
  order_id: string;
  name: string;
  total_amount: number;
  status: string;
  email: string;
  refund_status: string | null;
  refund_amount: string | null;
  payment_ref: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface OrderWithCustomer extends Order {
  user_id: string;
  address: string;
}

export type OrderItem = {
  order_item_id: string;
  name: string;
  quantity: number;
  item_total_price: number;
  label: string;
  image_url: string;
  product_id: string;
};

export type OrderInfoRespawn = {
  orderCustomerInfo: OrderWithCustomer;
  orderItems: OrderItem[];
  message: string;
};

export type OrdersResponse = {
  orders: Order[];
  orderCount: number;
  message: string;
};

//////////////////////////////////////////////////////////////

export type MonthlySalesDataRequestInput = {
  startYear?: number;
  endYear?: number;
  startMonth?: number;
  endMonth?: number;
};

export type MonthlySalesData = {
  revenue: number;
  year: number;
  month: number;
  units_sold: number;
};

export type GrowthStatus = {
  count: number;
  percentageIncrease: number;
};

export type DashboardDataResponse = {
  salesData: MonthlySalesData[];
  activeProductCount: number;
  customerGrowthStat: GrowthStatus;
  orderGrowthStat: GrowthStatus;
};

//////////////////////////////////////////////////////////////

export type AdminOrderTypeEnum = z.infer<typeof adminOrderTypeOptions>;

export const getOrderStatusAvailableUpdateOptions = (
  status: AdminOrderTypeEnum,
): AdminOrderTypeEnum[] | null => {
  switch (status) {
    case "pending":
      return ["paid", "shipped", "cancelled"]; // Can mark as paid, ship directly, or cancel

    case "paid":
      return ["shipped", "refunded", "partially_refunded"]; // Can ship or refund (but NOT back to pending)

    case "shipped":
      return ["delivered", "refunded", "partially_refunded"]; // Can mark delivered or refund

    case "delivered":
      return ["refunded","partially_refunded"]; // Only refund is possible (maybe also return/refund)

    case "cancelled":
      return null; // No actions - terminal state

    case "refunded":
      return null; // No actions - terminal state

    case "expired":
      return ["paid"]; // allow set to paid if somehow cron job OR other source of set paid having issue which technically shoudn't happen
    case "partially_refunded":
      return null; // No actions - terminal state

    default:
      return null;
  }
};

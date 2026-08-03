import type { RefundRow, RefundsResponse } from "@ecom/shared/type/refund";
import {
  buildTableQueryParams,
  type SearchQueryParams,
} from "@ecom/shared/type/search";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useAdminRefundsQuery({
  limit = 20,
  offset = 0,
  sortBy,
  filterBy,
  search,
  enabled = true,
}: SearchQueryParams) {
  return useQuery({
    queryKey: ["admin", "refunds", limit, offset, sortBy, filterBy, search],
    queryFn: async () => {
      const params = buildTableQueryParams({
        limit,
        offset,
        sortBy,
        filterBy,
        search,
      });

      const { data } = await api.get<RefundsResponse>(
        `/admin/refunds?${params.toString()}`,
      );
      //console.log(data);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}

export function useAdminRefundQuery(orderId: string) {
  return useQuery({
    queryKey: ["admin", "refund", orderId],
    queryFn: async () => {
      const { data } = await api.get<RefundRow>(`/admin/refund/${orderId}`);
      //console.log("Is refund data valid", data);
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
export function useAdminRefundUpdate() {
  return useMutation({
    mutationFn: async ({refundId, refundAmount, newStatus}:{refundId: string, refundAmount: number, newStatus: string} ) => {
      const res = await api.put(`/admin/refund/${refundId}`, {newStatus, refundAmount});
      return res.data;
    },
  });
}

export function useRefundRequest(orderId: string) {
  return useMutation({
    mutationFn: async (reason: string) => {
      const res = await api.post(`/order/refund/${orderId}`, { reason });
      return res.data;
    },
  });
}

export function useAdminBulkRejectRefund() {
  return useMutation({
    mutationFn: async (refundIds: string[]) => {
      const res = await api.post(`/admin/refunds/reject`, { data: refundIds });
      return res.data;
    },
  });
}


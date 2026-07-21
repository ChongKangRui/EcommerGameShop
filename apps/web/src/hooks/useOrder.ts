import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

import type {
  OrderConfirmResponse,
  OrderInfoRespawn,
  OrdersResponse,
} from "@ecom/shared/src/type/order";
import { type SearchQueryParams } from "@ecom/shared/src/type/search";

export function useOrderConfirm() {
  return useMutation({
    mutationFn: (orderId: string) => {
      return api.get<OrderConfirmResponse>(`/order/${orderId}/confirm`).then((r) => r.data);
    },
  });
}

export function useAdminOrdersQuery({
  limit = 20,
  offset = 0,
  sortBy,
  filterBy,
  search,
}: SearchQueryParams){
  return useQuery({
    queryKey: ["admin","orders", limit, offset, sortBy, filterBy, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset ?? ""));
      if (sortBy) params.set("sortBy", sortBy);
      if (filterBy) params.set("filterBy", filterBy);
      if (search) params.set("search", search);

      const { data } = await api.get<OrdersResponse>(
        `/admin/orders?${params.toString()}`,
      );
      //console.log(data);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes — admin sees fresh data
  });
};

export function useAdminOrderQuery(orderId: string) {
  return useQuery({
    queryKey: ["admin", "order", orderId],
    queryFn: async () => {
      const { data } = await api.get<OrderInfoRespawn>(`/admin/orders/${orderId}`);
    
      return { order: data.orderCustomerInfo, orderItems: data.orderItems };
    },
    enabled: !!orderId,
  });
}

export function useAdminOrderUpdate(orderId : string) {
  return useMutation({
    mutationFn: ( newStatus : string) => {
      return api.patch(`/admin/order/${orderId}/status`, {data: {newStatus}}).then((r) => r.data);
    },
  });
}

export function useAdminOrdersUpdate() {
  return useMutation({
    mutationFn: ({ orderIds, newStatus }: { orderIds: string[]; newStatus: string }) => {
      return api.patch(`/admin/orders/status`, {data: {orderIds,newStatus}}).then((r) => r.data);
    },
  });
}

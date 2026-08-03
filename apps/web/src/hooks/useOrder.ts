import {  useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

import type {
  DashboardDataResponse,
  MonthlySalesDataRequestInput,
  OrderConfirmResponse,
  OrderInfoRespawn,
  OrdersResponse,
} from "@ecom/shared/type/order";
import { buildTableQueryParams, type SearchQueryParams } from "@ecom/shared/type/search";

export function useOrderConfirm() {
  return useMutation({
    mutationFn: (orderId: string) => {
      return api.get<OrderConfirmResponse>(`/order/${orderId}/confirm`).then((r) => r.data);
    },
  });
}

export function useOrderStatusValidation(){
 return useMutation({
    mutationFn: (orderId: string) => {
      return api.get(`/order/validate/${orderId}`).then((r) => r.data);
    },
  });
}

export function useAdminOrdersQuery({
  limit = 20,
  offset = 0,
  sortBy,
  filterBy,
  search,
  enabled = true
}: SearchQueryParams){
  return useQuery({
    queryKey: ["admin","orders", limit, offset, sortBy, filterBy, search],
    queryFn: async () => {
      const params = buildTableQueryParams({limit, offset, sortBy, filterBy, search});

      const { data } = await api.get<OrdersResponse>(
        `/admin/orders?${params.toString()}`,
      );
      //console.log(data);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled
  });
};


export function useCustomerOrdersQuery({
  limit = 20,
  offset = 0,
  sortBy,
  filterBy,
  search,
   enabled = true
}: SearchQueryParams){
  return useQuery({
    queryKey: ["me","order", limit, offset, sortBy, filterBy, search],
    queryFn: async () => {
      const params = buildTableQueryParams({limit, offset, sortBy, filterBy, search});

      const { data } = await api.get<OrdersResponse>(
        `/order/me?${params.toString()}`,
      );
      //console.log(data);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled
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


export function useAdminFetchDashboardData( {startYear, endYear, startMonth, endMonth} : MonthlySalesDataRequestInput) {
  return useQuery({
    queryKey: ["admin", "dashboard", startYear, endYear, startMonth, endMonth],

    queryFn: async () => {
      const params = new URLSearchParams();
      if (startYear) params.set("startYear", String(startYear));
      if (endYear) params.set("endYear", String(endYear));
      if (startMonth) params.set("startMonth", String(startMonth));
      if (endMonth) params.set("endMonth", String(endMonth));

      const { data } = await api.get<DashboardDataResponse>(`/admin/dashboard-report?${params}`);
      //console.log(data);
      return data;
    },
  });
}

export function useCustomerOrderQuery(orderId: string) {
  return useQuery({
    queryKey: ["me", "order", orderId],
    queryFn: async () => {
      const { data } = await api.get<OrderInfoRespawn>(`/order/me/${orderId}`);
    
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

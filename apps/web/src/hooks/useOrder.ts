import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

import type { OrderConfirmResponse } from "@ecom/shared/src/type/order";

export const useOrder = () => {
 

  const orderConfirm = useMutation({
     mutationFn: (orderId: string) => {
      const data = api
        .get<OrderConfirmResponse>(`/order/${orderId}/confirm`)
        .then((r) => r.data);
      return data;
    },
  })

  
  return {
    orderConfirm,
   
  };
};

import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { flashMessage_Failed } from "@/lib/flash";
import type { CartValidateResult } from "@ecom/shared/src/type/checkout";
import type { CheckoutResponse } from "@ecom/shared/src/type/checkout";

export const useCheckout = () => {

  // Validate cart (called when entering checkout page)
  const validateMutation = useMutation({
    mutationFn: () => {
      const data = api
        .get<CartValidateResult>("/cart/validate")
        .then((r) => r.data);

      return data;
    },
    onError: (e) => {
      console.log(e);
    },
  });

  const initCheckout = useMutation({
    mutationFn: () => {
      const data = api
        .post<CheckoutResponse>("/checkout/init")
        .then((r) => r.data);
      return data;
    },
  });

 
  
  return {
    validate: validateMutation,
    initCheckout,
   
  };
};

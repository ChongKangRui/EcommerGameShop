import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

import type { CartValidateResult } from "@ecom/shared/src/type/checkout";
import type { CheckoutResponse } from "@ecom/shared/src/type/checkout";

export function useCartValidate() {
  return useMutation({
    mutationFn: () => {
      return api.get<CartValidateResult>("/cart/validate").then((r) => r.data);
    },
    onError: (e) => {
      console.log(e);
    },
  });
}

export function useInitCheckout() {
  return useMutation({
    mutationFn: () => {
      return api.post<CheckoutResponse>("/checkout/init").then((r) => r.data);
    },
  });
}
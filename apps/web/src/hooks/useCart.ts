import {
  useQueryClient,
  useMutation,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useGuestCartStore } from "./useGuestCartStore";
import { useAuth } from "@/context/AuthProvider";
import type {
  CartItem,
  CartItemResponse,
  CartItemsResponse,
} from "@ecom/shared/src/type/cart";
import api from "@/lib/api";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";

export interface CartApi {
  items: CartItemResponse[];
  //adjusted: boolean;
  addItem: (item: CartItem) => void;
  //clearAdjustedNotification: () => void;
  migrateItem: (item: CartItem[]) => void;
  updateItem: (item: CartItem) => void;
  removeItem: (variation_id: string) => void;
  totalItems: number;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

// useCart will be the interface for all the cart feature, no matter it is guest or user
export const useCart = (): CartApi => {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const { items: guestItems, setItems } = useGuestCartStore();
  //const debounceValue = useDebounce(, 700);

  // update the local storage cart with new one
  const updateLocalCartstorage = (cartItems: CartItemsResponse) => {
    const newLocalCartItems = cartItems.cartItems.map((i) => {
      return { variation_id: i.variation_id, quantity: i.quantity };
    });
    setItems(newLocalCartItems);
  };

  // Guest: enrich local thin items via server lookup
  const guestQuery = useQuery({
    queryKey: ["cart", "guest"],
    queryFn: async () => {
      console.log(isAuthenticated);
      const { data } = await api.post<CartItemsResponse>("/cart/guest", {
        cartItems: guestItems,
      });
      if (data.adjusted) {
        updateLocalCartstorage(data);
      }

      return data;
    },
    enabled: !isAuthenticated && guestItems.length > 0 && !isAuthLoading,
  });

  // Logged in: fetch cart from server
  const serverQuery = useQuery({
    queryKey: ["cart", "user"],
    queryFn: async () => {
      const { data } = await api.get<CartItemsResponse>("/cart/me");

      //if (data.adjusted) {
      updateLocalCartstorage(data);
      // }
      
      return data;
    },

    enabled: isAuthenticated && !!user && !isAuthLoading,
  });

  // const clearAdjustedNotification = () => {
  //   if (isAuthenticated) {
  //     queryClient.setQueryData(["cart", "user"], (old: CartItemsResponse) => ({
  //       ...old,
  //       adjusted: false,
  //     }));
  //   } else {
  //     queryClient.setQueryData(["cart", "guest"], (old: CartItemsResponse) => ({
  //       ...old,
  //       adjusted: false,
  //     }));
  //   }
  // };

  // migrate guest cart to user cart db
  const migrateLocalCartMutation = useMutation({
    mutationFn: (items: CartItem[]) =>
      api
        .post<CartItemsResponse>("/cart/migrate", { cartItems: items })
        .then((r) => r.data),
    onSuccess: (updated: CartItemsResponse) => {
      console.log("Migrate success");
      updateLocalCartstorage(updated);
      queryClient.setQueryData(["cart", "user"], updated);
    },
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: (item: CartItem) =>
      api.post<CartItemsResponse>("/cart/me", item).then((r) => r.data),
    onSuccess: (updated: CartItemsResponse) => {
      queryClient.setQueryData(["cart", "user"], updated);
      flashMessage_Success("Add item success");
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: (item: CartItem) =>
      api.patch<CartItemsResponse>("/cart/me", item).then((r) => r.data),
    onSuccess: (updated: CartItemsResponse) => {
      queryClient.setQueryData(["cart", "user"], updated);
    },
    onError: (err)=>{
      queryClient.invalidateQueries({queryKey: ["cart"]});
      flashMessage_Failed(err.message);
    }
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: (variationId: string) => api.delete(`/cart/me/${variationId}`),
    onMutate: async (variationId) => {
      await queryClient.cancelQueries({ queryKey: ["cart", "user"] });
      const previous = queryClient.getQueryData<CartItemsResponse>([
        "cart",
        "user",
      ]);
      queryClient.setQueryData<CartItemsResponse>(["cart", "user"], (old) => ({
        cartItems:
          old?.cartItems.filter((i) => i.variation_id !== variationId) ?? [],
        adjusted: old?.adjusted ?? false,
      }));
      return { previous };
    },
    onError: (e, _v, ctx) => {
      queryClient.setQueryData(["cart", "user"], ctx?.previous);
      flashMessage_Failed(e.message);
    },
  });

  // Determine which items to use
  const items = isAuthenticated
    ? (serverQuery.data?.cartItems ?? [])
    : (guestQuery.data?.cartItems ?? []);

  // const adjusted = isAuthenticated
  //   ? (serverQuery.data?.adjusted ?? false)
  //   : (guestQuery.data?.adjusted ?? false);

  // Combined states
  const isLoading =
    guestQuery.isLoading ||
    serverQuery.isLoading ||
    addItemMutation.isPending ||
    //updateItemMutation.isPending ||
    removeItemMutation.isPending;

  const isError = guestQuery.isError || serverQuery.isError;

  const isSuccess = isAuthenticated
    ? serverQuery.isSuccess
    : guestQuery.isSuccess;

  const getTotalItem = (): number => {
    return isAuthenticated
      ? items.reduce((sum, i) => sum + i.quantity, 0)
      : useGuestCartStore.getState().totalItems();
  };

  ////////////////////////////////////////////////////////////
  const addItem = (item: CartItem) => {
    useGuestCartStore.getState().addItem(item);
    if (isAuthenticated) {
      addItemMutation.mutate(item);
    } else {
      queryClient.invalidateQueries({ queryKey: ["cart", "guest"] });
      flashMessage_Success("Add item success");
    }
  };

  const updateItem = (item: CartItem) => {
    useGuestCartStore.getState().updateItem(item);
    if (isAuthenticated) {
      updateItemMutation.mutate(item);
    } else {
      queryClient.setQueryData(["cart", "guest"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          cartItems: old.cartItems.map((i: any) =>
            i.variation_id === item.variation_id
              ? { ...i, quantity: Math.min(item.quantity, parseInt(i.stock)) }
              : i,
          ),
        };
      });
    }
  };

  const removeItem = (variation_id: string) => {
    useGuestCartStore.getState().removeItem(variation_id);
    console.log(variation_id);
    if (isAuthenticated) {
      removeItemMutation.mutate(variation_id);
    } else {
      queryClient.setQueryData(["cart", "guest"], (old: any) => ({
        ...old,
        cartItems:
          old?.cartItems.filter((i: any) => i.variation_id !== variation_id) ??
          [],
      }));
      flashMessage_Success("Remove item success");
    }
  };

  return {
    items,
    //adjusted,
    //clearAdjustedNotification,
    addItem,
    updateItem,
    removeItem,
    migrateItem: (items: CartItem[]) => migrateLocalCartMutation.mutate(items),
    totalItems: getTotalItem(),
    isLoading,
    isError,
    isSuccess,
  };
};

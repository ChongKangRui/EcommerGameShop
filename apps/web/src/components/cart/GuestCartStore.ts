import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CartItem } from "@ecom/shared/src/type/cart";

export interface CartStore {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (item: CartItem) => void;
  removeItem: (variation_id: string) => void;
  totalItems: () => number;
}

export const useGuestCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items: CartItem[]) =>
        set(() => {
          console.log(items);
          return {
            items: items,
          };
        }),
      addItem: (item: CartItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variation_id === item.variation_id,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variation_id === item.variation_id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      updateItem: (item: CartItem) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variation_id === item.variation_id ? item : i,
          ),
        })),

      removeItem: (variation_id) =>
        set((state) => ({
          items: state.items.filter((i) => i.variation_id !== variation_id),
        })),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "redfield-cart" },
  ),
);

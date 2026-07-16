import { z } from "zod";

export const cartItemSchema = z.object({
  variation_id: z.string(),
  quantity: z.number().int().min(1),
});


export const cartItemsSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1),
});

// export const updateCartItemsSchema = z.object({
//   cartItems: z.array(updateCartItemSchema).min(1),
// });
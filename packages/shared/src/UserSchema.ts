import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  price: z.number().positive(),
 
});

// export type Product = z.infer<typeof productSchema>;
// export const createProductSchema = productSchema.omit({ id: true });
// export type CreateProduct = z.infer<typeof createProductSchema>;

export type User = z.infer<typeof userSchema>;
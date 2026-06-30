import { z } from "zod";

// Match your PostgreSQL product_type enum
const productTypeEnum = z.enum(["switch", "switch_2", "ps4", "ps5", "xbox"]);

// Single variation schema
export const productVariationSchema = z.object({
  label: z
    .string()
    .min(0)
    .max(100, "Label must be under 100 characters"),
    //imageRefIndex: z.int(),
  image: z.instanceof(File, { message: "Image is required" })
                 .refine(file => file.size > 0, "Image is required")
                 .refine(file => file.size <= 5 * 1024 * 1024, "Image must be under 5MB")
                 .refine(
                   file => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
                   "Image must be JPG, PNG or WebP"
                 ),
  image_url: z.string().optional(),
  is_cover: z.boolean(),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  price_offset: z.number().min(0, "Price offset cannot be negative"),
});

// Full product schema
export const productSchema = z
  .object({
    name: z
      .string()
      .min(1, "Product name is required")
      .max(255, "Product name must be under 255 characters"),
    price: z.number().min(0, "Price cannot be less than 1"),
    type: productTypeEnum,
    release_date: z.string().min(1, "Release date is required"), // string from date input
    discount_percentage: z
      .number()
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%"),
    variations: z
      .array(productVariationSchema)
      .min(1, "At least one variation is required"),
  })
  .refine((data) => data.variations.filter((v) => v.is_cover).length === 1, {
    message: "Exactly one variation must be set as cover",
    path: ["variations"],
  });

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductVariationData = z.infer<typeof productVariationSchema>;

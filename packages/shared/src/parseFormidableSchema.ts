import { z } from "zod";
import { productTypeEnum } from "./type/product";

const formidableFileSchema = z.object({
  filepath: z.string(),
  originalFilename: z.string().nullable(),
  mimetype: z
    .string()
    .nullable()
    .refine(
      (type) => ["image/jpeg", "image/png", "image/webp"].includes(type ?? ""),
      "Image must be JPG, PNG or WebP"
    ),
  size: z
    .number()
    .gt(0, "Image is required")
    .max(5 * 1024 * 1024, "Image must be under 5MB"),
});

export const productVariationServerSchema = z
  .object({
    variation_id: z.string().optional().nullable(),
    label: z.string().min(0).max(100, "Label must be under 100 characters"),
    image: formidableFileSchema.optional().nullable(),
    image_url: z.url("Image URL must be valid").optional().nullable(),
    is_cover: z.boolean(),
    
    stock: z
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),
    price_offset: z.number().min(0, "Price offset cannot be negative"),
  })
  .refine(
    (data) => {
      const hasImage = !!data.image;
      const hasImageUrl = typeof data.image_url === "string" && data.image_url.trim().length > 0;
  
      return hasImage || hasImageUrl;
    },
    {
      message: "Either an image file or pre-existing valid image URL is required",
      path: ["image"],
    }
  );

export const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required").max(255, "Product name must be under 255 characters"),
    price: z.number().min(0, "Price cannot be less than 1"),
    type: productTypeEnum,
    release_date: z.string().min(1, "Release date is required"),
    discount_percentage: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%"),
    push_home_page: z.boolean(),
     description: z.string().max(2000, "Description too long").optional(),
    variations: z.array(productVariationServerSchema).min(1, "At least one variation is required"),
  })
  .refine((data) => data.variations.filter((v) => v.is_cover).length === 1, {
    message: "Exactly one variation must be set as cover",
    path: ["variations"],
  });

// Base variation schema — image optional (for update)
// export const productVariationServerSchema = z.object({
//   variation_id: z.string().uuid().optional().nullable(),
//   label: z.string().min(0).max(100, "Label must be under 100 characters"),
//   image: z.object({
//     filepath: z.string(),
//     originalFilename: z.string().nullable(),
//     mimetype: z.string().nullable().refine(
//       (type) => ["image/jpeg", "image/png", "image/webp"].includes(type ?? ""),
//       "Image must be JPG, PNG or WebP"
//     ),
//     size: z.number().max(5 * 1024 * 1024, "Image must be under 5MB"),
//   }).optional().nullable(),               // optional for update
//   is_cover: z.boolean(),
//   stock: z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
//   price_offset: z.number().min(0, "Price offset cannot be negative"),
// });

// // Strict variation schema — image required (for add)
// export const addProductVariationServerSchema = productVariationServerSchema.safeExtend({
//   image: z.object({
//     filepath: z.string(),
//     originalFilename: z.string().nullable(),
//     mimetype: z.string().nullable().refine(
//       (type) => ["image/jpeg", "image/png", "image/webp"].includes(type ?? ""),
//       "Image must be JPG, PNG or WebP"
//     ),
//     size: z.number().gt(0, "Image is required").max(5 * 1024 * 1024, "Image must be under 5MB"),
//   }),                                    
// });

// // Base product schema — for update
// export const productServerSchema = z.object({
//   name: z.string().min(1, "Product name is required").max(255),
//   price: z.number().min(0, "Price cannot be less than 1"),
//   type: productTypeEnum,
//   release_date: z.string().min(1, "Release date is required"),
//   discount_percentage: z.number().min(0).max(100),
//   variations: z.array(productVariationServerSchema).min(1, "At least one variation is required"),
// }).refine(
//   (data) => data.variations.filter((v) => v.is_cover).length === 1,
//   { message: "Exactly one variation must be set as cover", path: ["variations"] }
// );

// // Strict product schema — for add
// export const addProductServerSchema = productServerSchema.safeExtend({
//   variations: z.array(addProductVariationServerSchema).min(1, "At least one variation is required"),
// }).refine(
//   (data) => data.variations.filter((v) => v.is_cover).length === 1,
//   { message: "Exactly one variation must be set as cover", path: ["variations"] }
// );

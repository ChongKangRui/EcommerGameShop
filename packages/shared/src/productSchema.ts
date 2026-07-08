 import { z } from "zod";
import { productTypeEnum } from "./type/product";


 // Single variation schema
export const productVariationSchema = z
  .object({
    variation_id: z.string().optional().nullable(),
    label: z.string().min(0).max(100, "Label must be under 100 characters"),
    image: z
      .instanceof(File)
      .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be under 5MB")
      .refine(
        (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        "Image must be JPG, PNG or WebP"
      )
      .optional()
      .nullable(),
    image_url: z.url().optional().nullable(),
    is_cover: z.boolean(),
    
    stock: z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
    price_offset: z.number().min(0, "Price offset cannot be negative"),
  })
  .refine(
    (data) => {
      const hasImage = data.image instanceof File && data.image.size > 0;
      const hasImageUrl = typeof data.image_url === "string" && data.image_url.trim().length > 0;
      return hasImage || hasImageUrl;
    },
    {
      message: "Either an image file or pre-existing valid image URL is required",
      path: ["image"],
    }
  );
 // Full product schema
 export const productSchema = z
   .object({
     name: z
       .string()
       .min(1, "Product name is required")
       .max(255, "Product name must be under 255 characters"),
     price: z.number().min(0, "Price cannot be less than 1"),
     type: productTypeEnum,
     release_date: z.string().min(1, "Release date is required"), 
     push_home_page: z.boolean(),
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

// import { z } from "zod";

// const productTypeEnum = z.enum(["switch", "switch_2", "ps4", "ps5", "xbox"]);

// // Base variation schema — used for update (image optional, variation_id optional)
// export const productVariationSchema = z.object({
//   variation_id: z.string().uuid().optional().nullable(),
//   label: z.string().min(0).max(100, "Label must be under 100 characters"),
//   image: z
//     .instanceof(File)
//     .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be under 5MB")
//     .refine(
//       (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
//       "Image must be JPG, PNG or WebP"
//     )
//     .optional()
//     .nullable(),
//   image_url: z.string().optional().nullable(),
//   is_cover: z.boolean(),
//   stock: z
//     .number()
//     .int("Stock must be a whole number")
//     .min(0, "Stock cannot be negative"),
//   price_offset: z.number().min(0, "Price offset cannot be negative"),
// });

// // Stricter variation schema for add, image is required
// export const addProductVariationSchema = productVariationSchema.safeExtend({
//   image: z
//     .instanceof(File, { message: "Image is required" })
//     .refine((file) => file.size > 0, "Image is required")
//     .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be under 5MB")
//     .refine(
//       (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
//       "Image must be JPG, PNG or WebP"
//     ),
// });

// // Base product schema — used for update
// export const productSchema = z
//   .object({
//     name: z
//       .string()
//       .min(1, "Product name is required")
//       .max(255, "Product name must be under 255 characters"),
//     price: z.number().min(0, "Price cannot be less than 1"),
//     type: productTypeEnum,
//     release_date: z.string().min(1, "Release date is required"),
//     discount_percentage: z
//       .number()
//       .min(0, "Discount cannot be negative")
//       .max(100, "Discount cannot exceed 100%"),
//     variations: z
//       .array(productVariationSchema)
//       .min(1, "At least one variation is required"),
//   })
//   .refine(
//     (data) => data.variations.filter((v) => v.is_cover).length === 1,
//     {
//       message: "Exactly one variation must be set as cover",
//       path: ["variations"],
//     }
//   );

// // Stricter product schema for add, enforces image required on all variations
// export const addProductSchema = productSchema.safeExtend({
//   variations: z
//     .array(addProductVariationSchema)
//     .min(1, "At least one variation is required"),
// }).refine(
//   (data) => data.variations.filter((v) => v.is_cover).length === 1,
//   {
//     message: "Exactly one variation must be set as cover",
//     path: ["variations"],
//   }
// );

// export type ProductFormData = z.infer<typeof productSchema>;
// export type ProductVariationData = z.infer<typeof productVariationSchema>;
// export type AddProductFormData = z.infer<typeof addProductSchema>;
// export type AddProductVariationData = z.infer<typeof addProductVariationSchema>;
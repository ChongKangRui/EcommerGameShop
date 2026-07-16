import { z } from "zod";

export const productTypeEnum = z.enum(["switch", "switch_2", "ps4", "ps5", "xbox"]);
export const sortOptions = [
  { value: "release_date:desc", label: "Newest First" },
  { value: "release_date:asc", label: "Oldest First" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "name:desc", label: "Name Z–A" },
  { value: "discounted_price:asc", label: "Price Low–High" },
  { value: "discounted_price:desc", label: "Price High–Low" },
  { value: "sales:desc", label: "Best Selling" },
] as const;

export const adminSortOptions = [
  ...sortOptions,
  { value: "sales:asc", label: "Sales Low–High" },
  { value: "created_at:desc", label: "Latest Created at" },
  { value: "created_at:asc", label: "Oldest Created at" },
  { value: "total_stock:asc", label: "Lower Stock" },
  { value: "total_stock:desc", label: "Higer Stock" },
] as const;

export const productFilterOptions = ["all","switch", "switch_2", "ps4", "ps5", "xbox"] as const;

export type Product = {
  product_id: number;
  name: string;
  cover_image_url: string;
  price: string;           
  discount_percentage: string; 
  push_home_page: boolean;
  release_date: string;
  type: string;
  description:string;
  created_at: string;
  discounted_price: string;
  total_stock:string;
  sales?:string;
  
  
}

export type ProductVariation = {
  variation_id: string;     
  label: string;
  image_url: string;
  stock: number;
  price_offset: string;
  created_at: Date;
  updated_at: Date;
  final_price: number;
};

// export type ProductVariation = {
//   variation_id: string;
//   label: string;
//   cover_image_url: string;
//   price: string;           
//   discount_percentage: string; 
//   is_sold_out: boolean;
//   push_home_page: boolean;
//   release_date: string;
//   type: string;
//   created_at: string;
//   updated_at: string;
//   sales?:string;
// }

export type SingleProductResponse = {
   products: Product;
  
  message: string;
}


export type ProductsResponse = {
  products: Product[];
  productCount: number;
  message: string;
};

export type ProductResponse = {
  product: Product;
  variations: ProductVariation[];
  productCount: number;
  message: string;
};


export type SortByValue = typeof sortOptions[number]["value"];
export type AdminSortByValue = typeof adminSortOptions[number]["value"];
export type ProductFilterOptionsByValue = typeof productFilterOptions[number];
export type ProductTypeEnum = z.infer<typeof productTypeEnum>;

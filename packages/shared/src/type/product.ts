import { z } from "zod";

export const productTypeEnum = z.enum(["switch", "switch_2", "ps4", "ps5", "xbox"]);
export const sortOptions = [
  { value: "release_date:desc", label: "Newest First" },
  { value: "release_date:asc", label: "Oldest First" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "name:desc", label: "Name Z–A" },
  { value: "price:asc", label: "Price Low–High" },
  { value: "price:desc", label: "Price High–Low" },
  { value: "sales:desc", label: "Best Selling" },
] as const;

export const adminSortOptions = [
  ...sortOptions,
  { value: "sales:asc", label: "Sales Low–High" },
  { value: "created_at:desc", label: "Latest Created at" },
  { value: "created_at:asc", label: "Oldest Created at" },

] as const;

export const productFilterOptions = ["all","switch", "switch_2", "ps4", "ps5", "xbox"] as const;

export type SortByValue = typeof sortOptions[number]["value"];
export type AdminSortByValue = typeof adminSortOptions[number]["value"];
export type ProductFilterOptionsByValue = typeof productFilterOptions[number];
export type ProductTypeEnum = z.infer<typeof productTypeEnum>;

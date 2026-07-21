import { useMutation, useQuery } from "@tanstack/react-query";
import { type FieldValues } from "react-hook-form";
import api from "@/lib/api";

import {
  type ProductsResponse,
  type ProductResponse,
} from "@ecom/shared/src/type/product";
import {type SearchQueryParams}from "@ecom/shared/src/type/search";
import { useAuth } from "@/context/AuthProvider";


function getFormData(data: FieldValues): FormData {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("price", data.price.toString());
  formData.append("type", data.type);
  console.log(data.type);
  formData.append("release_date", data.release_date);
  formData.append("push_home_page", data.push_home_page.toString());
  formData.append("discount_percentage", data.discount_percentage.toString());
  formData.append("description", data.description);

  // Variations — append text fields and image together, keeping same structure
  console.log(data.variations);
  data.variations.forEach((variation: any, index: number) => {
    formData.append(`variations[${index}][label]`, variation.label);
    formData.append(
      `variations[${index}][variation_id]`,
      variation.variation_id,
    );
    formData.append(
      `variations[${index}][is_cover]`,
      String(variation.is_cover),
    );

    formData.append(`variations[${index}][stock]`, String(variation.stock));
    formData.append(
      `variations[${index}][price_offset]`,
      String(variation.price_offset),
    );
    formData.append(
      `variations[${index}][image_url]`,
      String(variation.image_url),
    );

    formData.append(`variations[${index}]`, variation.image); // ← image inside variation
  });

  return formData;
}

export function useAddProductMutation() {
  return useMutation({
    mutationFn: async (data: FieldValues) => {
      // we need to use form data because backend only accept form data when it contain image file
      const formData = getFormData(data);

      const res = await api.post("/admin/products", formData);
      return res.data;
    },
  });
}

export function useProductsQuery({
  limit = 20,
  offset = 0,
  sortBy,
  filterBy,
  search,
  showNonActive
}: SearchQueryParams) {
  const {user} = useAuth();
  return useQuery({
    queryKey: ["products", limit, offset, sortBy, filterBy, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));
      if (sortBy) params.set("sortBy", sortBy);
      if (filterBy) params.set("filterBy", filterBy);
      if (search) params.set("search", search);
      params.set("showNonActive", showNonActive ? "true" : "false");

      console.log(params.toString());
      const { data } = await api.get<ProductsResponse>(
        user?.role === 'admin' ? `/admin/products?${params.toString()}`  : `/products?${params.toString()}`,
      );
      //console.log(data);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes — admin sees fresh data
  });
}

export function useProductQuery(productId: string) {
  return useQuery({
    queryKey: ["products", productId],
    queryFn: async () => {
      const { data } = await api.get<ProductResponse>(`/products/${productId}`);
      console.log(data);
      return { product: data.product, variations: data.variations };
    },
    enabled: !!productId,
  });
}

export function useUpdateProductMutation(productId: string) {
  return useMutation({
    mutationFn: async (data: FieldValues) => {
      const formData = getFormData(data);
      const res = await api.put(`/admin/products/${productId}`, formData);
      return res.data;
    },
  });
}

export function useDeleteProductMutation(productId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/admin/product/${productId}`);
      return res.data;
    },
  });
}

export function useDeleteProductsMutation() {
  return useMutation({
    mutationFn: async (productIds: number[]) => {
      const res = await api.delete(`/admin/products/`, { data: productIds });
      return res.data;
    },
  });
}

export function useBulkProductDiscountMutation() {
  return useMutation({
    mutationFn: async (params: {
      productIds: number[];
      discountPercentage: number;
    }) => {
      const res = await api.patch(`/admin/products/discount`, {
        data: { productIds: params.productIds, discountPercentage: params.discountPercentage },
      });
      return res.data;
    },
  });
}

export function useBulkProductPromoteMutation() {
  return useMutation({
    mutationFn: async (params: {
      productIds: number[];
      promote: boolean;
    }) => {
      const res = await api.patch(`/admin/products/promote`, {
        data: { productIds: params.productIds, promote: params.promote },
      });
      return res.data;
    },
  });
}


export function useBulkProductActiveMutation() {
  return useMutation({
    mutationFn: async (params: {
      productIds: number[];
      active: boolean;
    }) => {
      const res = await api.patch(`/admin/products/active`, {
        data: { productIds: params.productIds, active: params.active },
      });
      return res.data;
    },
  });
}
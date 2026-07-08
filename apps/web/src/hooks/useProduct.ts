import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { type FieldValues } from "react-hook-form";
import api from "@/lib/api";
import axios from "axios";

export function useAddProduct() {
  return useMutation({
    mutationFn: async (data: FieldValues) => {
      try {
        // we need to use form data because backend only accept form data when it contain image file
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("price", data.price.toString());
        formData.append("type", data.type);
        formData.append("release_date", data.release_date);
        formData.append(
          "push_home_page",
          data.push_home_page.toString(),
        );
        formData.append(
          "discount_percentage",
          data.discount_percentage.toString(),
        );
        


        // Variations — append text fields and image together, keeping same structure
        data.variations.forEach((variation: any, index: number) => {
          formData.append(`variations[${index}][label]`, variation.label);
          formData.append(
            `variations[${index}][is_cover]`,
            String(variation.is_cover),
          );
          formData.append(
            `variations[${index}][stock]`,
            String(variation.stock),
          );
          formData.append(
            `variations[${index}][price_offset]`,
            String(variation.price_offset),
          );
          

          formData.append(`variations[${index}]`, variation.image); // ← image inside variation
        });

        const res = await api.post("/admin/products", formData);
        return res.data;
      } catch (err: any) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response?.data?.error
            : "Unknown error";
        throw new Error(message);
      }
    },
  });
}

type GetProductsParams = {
  limit?: number;
  offset?: number;
  sortBy?: string;
  filterBy?: string;
  search?: string;
};

export function useGetProducts({limit = 20, offset = 0, sortBy, filterBy, search} : GetProductsParams) {
  return useQuery({
    queryKey: [ "products", limit, offset, sortBy, filterBy,search],
    queryFn: async () => {
      try {

        const params = new URLSearchParams();
        params.set("limit", String(limit));
        params.set("offset", String(offset));
        if (sortBy) params.set("sortBy", sortBy);
        if(filterBy) params.set("filterBy", filterBy);
        if (search) params.set("search", search);
        

       

        const { data } = await api.get(`/products?${params.toString()}`);
        console.log(data);
        return data;
      } catch (err: any) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response?.data?.error
            : "Unknown error";
        throw new Error(message);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes — admin sees fresh data
  });
}

export function useGetProduct(productId: string) {
  return useQuery({
    queryKey: [ "products", productId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        return {product: data.product, variations: data.variations};
      } catch (err: any) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response?.data?.error
            : "Unknown error";
        throw new Error(message);
      }
    },
    enabled: !!productId,
  });
}

export function useAdminUpdateProduct(productId: string){
  return useMutation({
    mutationFn: async (data: FieldValues) => {
      try {
        // we need to use form data because backend only accept form data when it contain image file
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("price", data.price.toString());
        formData.append("type", data.type);
        console.log(data.type);
        formData.append("release_date", data.release_date);
        formData.append(
          "push_home_page",
          data.push_home_page.toString(),
        );
        formData.append(
          "discount_percentage",
          data.discount_percentage.toString(),
        );

        // Variations — append text fields and image together, keeping same structure
        console.log(data.variations);
        data.variations.forEach((variation: any, index: number) => {
          formData.append(`variations[${index}][label]`, variation.label);
          formData.append(`variations[${index}][variation_id]`, variation.variation_id);
          formData.append(
            `variations[${index}][is_cover]`,
            String(variation.is_cover),
          );
          
          formData.append(
            `variations[${index}][stock]`,
            String(variation.stock),
          );
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

        const res = await api.put(`/admin/products/${productId}`, formData);
        return res.data;
      } catch (err: any) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response?.data?.error
            : "Unknown error";
        throw new Error(message);
      }
    },
  });
}

export function useAdminDeleteProduct(productId: string){
  return useMutation({
    mutationFn: async () => {
      try {
        const res = await api.delete(`/admin/products/${productId}`);
        return res.data;
      } catch (err: any) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response?.data?.error
            : "Unknown error";
        throw new Error(message);
      }
    },
  });


}


export function useAdminDeleteProducts(){
  return useMutation({
    mutationFn: async (productIds: string[]) => {
      try {
       
        const res = await api.delete(`/admin/products/`, {data: productIds});
        return res.data;
      } catch (err: any) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response?.data?.error
            : "Unknown error";
        throw new Error(message);
      }
    },
  });

  
}
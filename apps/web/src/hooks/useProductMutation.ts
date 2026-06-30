import { useMutation } from "@tanstack/react-query";
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

        const res = await api.post("/admin/addProduct", formData);
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

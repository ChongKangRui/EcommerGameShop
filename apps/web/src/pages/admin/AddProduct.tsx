import { useForm, type FieldValues, useFieldArray } from "react-hook-form";

import { Button } from "../../components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAddProduct } from "@/hooks/useProduct";

import { useState, useEffect } from "react";
import ProductInfo from "@/components/admin/product/add/ProductInfo";
import ProductVariations from "@/components/admin/product/add/ProductVariations";
import {
  productSchema,
  type ProductFormData,
} from "@ecom/shared/src/productSchema";
import { flashMessage_Success } from "@/lib/flash";

import ProductForm from "@/components/admin/product/add/ProductForm";
import { useQueryClient } from "@tanstack/react-query";

export default function AddProduct() {
  const mutation = useAddProduct();
const queryClient = useQueryClient();

  return (
    <div>
      <ProductForm
        title="Add Product"
       
        isPending={mutation.isPending}
        isError={mutation.isError}
        resetForm={mutation.isSuccess}
        errorMessage={mutation.error?.message}
        onSubmit={(data) =>
          mutation.mutate(data, {
            onSuccess: (res) => {
              //invalidate the product list queries
             queryClient.invalidateQueries({queryKey: ["admin", "products"]})
              flashMessage_Success(res.message);
            },
          })
        }
      ></ProductForm>
    </div>
  );
}

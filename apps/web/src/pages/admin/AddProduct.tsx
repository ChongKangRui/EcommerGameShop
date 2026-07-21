import { useForm, type FieldValues, useFieldArray } from "react-hook-form";

import { Button } from "../../components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAddProductMutation } from "@/hooks/useProduct";

import { useState, useEffect } from "react";
import ProductInfoForm from "@/components/admin/product/ProductInfoForm";
import ProductVariations from "@/components/admin/product/ProductVariations";
import {
  productSchema,
  type ProductFormData,
} from "@ecom/shared/src/productSchema";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";

import ProductForm from "@/components/admin/product/ProductForm";
import { useQueryClient } from "@tanstack/react-query";

export default function AddProduct() {
  const mutation = useAddProductMutation();
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
             queryClient.invalidateQueries({queryKey: ["products"]})
              flashMessage_Success(res.message);
            },
            onError: (err)=>{
              flashMessage_Failed("Invalid action");
                
            }
          })
        }
      ></ProductForm>
    </div>
  );
}

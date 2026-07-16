import {
  useDeleteProductMutation,
  useProductQuery,
  useUpdateProductMutation,
} from "@/hooks/useProduct";

import ProductForm from "@/components/admin/product/add/ProductForm";
import { useNavigate, useParams } from "react-router-dom";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import {
  productSchema,
  type ProductFormData,
  type ProductVariationData,
} from "@ecom/shared/src/productSchema";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import type { ProductTypeEnum } from "@ecom/shared/src/type/product";
import { useState } from "react";

export default function UpdateProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: isGetProductLoading,
    isError: isGetProductError,
  } = useProductQuery(id ? id : "");

  const deleteMutation = useDeleteProductMutation(id ? id : "");
  const updateMutation = useUpdateProductMutation(id ? id : "");

  const formatDateForAPI = (dateString: string): string => {
    // Input: "12/25/2024"

    const dateOnly = dateString.split("T")[0];
    const parts = dateOnly.split("-");
    // parts = ["12", "25", "2024"]

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    console.log(parts);

    return `${year}-${month}-${day}`;
  };

  if (isGetProductLoading) return <Loading></Loading>;

  if (isGetProductError || !data?.product) {
    navigate("/admin/products/");
    flashMessage_Failed("Invalid product");
    return;
  }

  const product = data.product;
  const variations: ProductVariationData[] = [];

  data?.variations.forEach((element: any) => {
    const variation: ProductVariationData = {
      label: element.label,
      variation_id: element.variation_id,
      image: undefined as unknown as File,
      image_url: element.image_url,
      is_cover: data?.product?.cover_image_url === element.image_url,
      stock: element.stock,
      price_offset: element.price_offset,
    };
    variations.push(variation);
  });

  const value: ProductFormData = {
    name: product.name,
    price: parseFloat(product.price),
    type: product.type as ProductTypeEnum,
    push_home_page: data?.product?.push_home_page,
    discount_percentage: parseFloat(product.discount_percentage),
    description: product.description ?? "",
    release_date: formatDateForAPI(data?.product?.release_date ?? ""),
    variations: variations,
  };
 

  return (
    <div>
      <ProductForm
        title="Update Product"
        defaultValues={value}
        isPending={updateMutation.isPending}
        isError={updateMutation.isError}
        resetForm={false}
        errorMessage={"mutation.error?.message"}
        showDeleteButton={true}
        onSubmit={(data) => {
          updateMutation.mutate(data, {
            onSuccess: (res) => {
              console.log("Hello success");
              flashMessage_Success(res.message);
            },
            onError: (error) => {
              flashMessage_Failed(error.message);
            },
          });
        }}
        onDeleteMutation={deleteMutation.mutate}
        onDeleteCallback={(message) => {
          flashMessage_Success(message);
          navigate("/admin/products/");
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }}
      ></ProductForm>
    </div>
  );
}

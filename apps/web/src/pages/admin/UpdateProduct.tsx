import { useAdminDeleteProduct, useGetProduct, useAdminUpdateProduct } from "@/hooks/useProduct";
import { Loader2 } from "lucide-react";

import ProductForm from "@/components/admin/product/add/ProductForm";
import { useNavigate, useParams } from "react-router-dom";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import {
  productSchema,
  type ProductFormData,
  type ProductVariationData
} from "@ecom/shared/src/productSchema";
import { useQueryClient } from "@tanstack/react-query";

export default function UpdateProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading: isGetProductLoading, isError: isGetProductError } = useGetProduct(id ? id : "");
  const deleteMutation = useAdminDeleteProduct(id ? id : "");
  const updateMutation = useAdminUpdateProduct(id ? id : "");

  const formatDateForAPI = (dateString: string): string => {
  // Input: "12/25/2024"
  
  const dateOnly = dateString.split('T')[0];
  const parts = dateOnly.split('-');
  // parts = ["12", "25", "2024"]
  
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
    console.log(parts);
  
  return `${year}-${month}-${day}`; 
};

  if (isGetProductLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  if (isGetProductError) {

    navigate("/admin/products/");
    flashMessage_Failed("Invalid product");
    return;
  }

  const variations : ProductVariationData[] = [];

  data?.variations.forEach((element: any) => {
    const variation : ProductVariationData = {
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
    name: data?.product?.name,
    price: data?.product?.price,
    type: data?.product?.type,
    release_date: formatDateForAPI(data?.product?.release_date),
    push_home_page: data?.product?.push_home_page,
    discount_percentage: data?.product?.discount_percentage,
    variations:variations,
  };
  console.log(value);

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
              onSubmit={(data) =>{
                console.log("What happen");
                 updateMutation.mutate(data, {
                   onSuccess: (res) => {
                    console.log("Hello success");
                     flashMessage_Success(res.message);
                   },
                    onError:(error)=>{
                    flashMessage_Failed(error.message);
                  }
                 })
                }
               
              }
              onDelete={()=>{
                deleteMutation.mutate(undefined, {
                  onSuccess: (res) => {
                    flashMessage_Success(res.message);
                    queryClient.invalidateQueries({queryKey: ["admin", "products"]})
                    navigate("/admin/products/");
                  },
                  onError:(error)=>{
                    flashMessage_Failed(error.message);
                  }
                })
              }}
            ></ProductForm> 
    </div>
  );
}

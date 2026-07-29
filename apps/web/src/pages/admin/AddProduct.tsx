
import { useAddProductMutation } from "@/hooks/useProduct";

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
            // invalidate admin dashboard data.
             queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"]});
              flashMessage_Success(res.message);
            },
            onError: ()=>{
              flashMessage_Failed("Invalid action");
                
            }
          })
        }
      ></ProductForm>
    </div>
  );
}

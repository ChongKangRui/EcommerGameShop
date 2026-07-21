import { useForm, type FieldValues, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import ProductInfoForm from "@/components/admin/product/ProductInfoForm";
import ProductVariations from "@/components/admin/product/ProductVariations";
import { PopupDialogue } from "@/components/PopupDialogue";
import {
  productSchema,
  type ProductFormData,
} from "@ecom/shared/src/productSchema";

import { type ProductTypeEnum } from "@ecom/shared/src/type/product";
import { useQueryClient, type UseMutateFunction } from "@tanstack/react-query";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import { useNavigate, useParams } from "react-router";
import { useAdminOrderQuery, useAdminOrderUpdate } from "@/hooks/useOrder";
import Loading from "@/components/Loading";
import CustomerInfo from "./CustomerInfo";
import OrderItemList from "./OrderItemList";

export default function OrderInfo({orderId}: {orderId: string}) {
  
   const orderQuery =  useAdminOrderQuery(orderId);
   const orderUpdate = useAdminOrderUpdate(orderId);

  const data = orderQuery.data;
  
  const [status, setStatus] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(()=>{
    setStatus(data?.order.status ?? "");
    console.log("effect came in");
  }, [orderQuery.isSuccess])

  const onUpdateStatusConfirm=()=>{
    orderUpdate.mutate(status, {
      onSuccess:()=>{
        queryClient.invalidateQueries({ queryKey: ["admin", "order"]});
        flashMessage_Success("Update order status success");
      },
      onError: (err)=>{
        console.log(err);
         queryClient.invalidateQueries({ queryKey: ["admin", "order"]});
        flashMessage_Failed(err.message);
      }
    });
    
  }

  if(orderQuery.isPending){
    return <Loading/>
  }


  if(orderQuery.isError  || !data){
    flashMessage_Failed("Invalid order");
    navigate("/admin/orders", {replace: true});
    return;
  }


 
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-5xl">
        <div className="block text-center mb-5">
          <h2 className="text-2xl">Order</h2>
        </div>
        
          <div className="flex flex-col md:flex-col md:gap-12 justify-center items-center">
            <div className="w-5/6 ms-auto md:ms-0 md:w-7/12 lg:w-8/12">
              <CustomerInfo
                orderInfo={data.order}
                status={status}
                onStatusChange={setStatus}
              />
            </div>
            <div className=""> 
              <OrderItemList items={data.orderItems}></OrderItemList>
            </div>
          </div>
          <div className="text-center mt-10 flex flex-col justify-center items-center md:flex-row md:gap-5">
            <Button
              type="button"
              className="cursor-pointer max-w-50"
              disabled={orderUpdate.isPending}
              onClick={()=>onUpdateStatusConfirm()}
            >
              UpdateStatus
            </Button>
            
          </div>
        
       
      </div>
    </div>
  );
}

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
import type { UseMutateFunction } from "@tanstack/react-query";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import { useNavigate, useParams } from "react-router";
import { useAdminOrderQuery } from "@/hooks/useOrder";
import Loading from "@/components/Loading";
import OrderInfo from "@/components/admin/order/OrderInfo";




export default function AdminOrder() {
  const { orderId } = useParams<{ orderId: string }>();

  const navigate =  useNavigate();

  if(!orderId){
    flashMessage_Failed("Invalid order");
    navigate("/admin/orders", {replace: true});
    return;
  }

 
  return (
    <OrderInfo orderId={orderId}/>
  );
}

//import CartContent from "@/components/checkout/CartContent";
import { Button } from "../../components/ui/button";
import { useEffect } from "react";
import CartProduct from "../../components/cart/CartProduct";

import type { CartItem, CartItemsResponse } from "@ecom/shared/src/type/cart";
import { useCart } from "@/hooks/useCart";
import Loading from "@/components/Loading";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthProvider";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";
import { useQueryClient } from "@tanstack/react-query";
import { useCheckout } from "@/hooks/useCheckout";
import {type CartValidateResult} from "@ecom/shared/src/type/checkout"
import type { ValidateResult } from "react-hook-form";


export default function Cart() {
  //const [totalPrice, setTotalPrice] = useState(0);

  const { items, isLoading, adjusted, clearAdjustedNotification } = useCart();
  const queryClient = useQueryClient();

  const navigation = useNavigate();
  const {isAuthenticated} = useAuth();
  const {validate}= useCheckout();

   useEffect(() => {
    if(isAuthenticated){
       queryClient.invalidateQueries({ queryKey: ["cart", "user"] });
    }
    else{
      queryClient.invalidateQueries({ queryKey: ["cart", "guest"] });
    }

  }, []);


  useEffect(() => {
  if (adjusted) {
    flashMessage_Failed("Some items were adjusted due to stock changes");

    clearAdjustedNotification();
    
  }
}, [adjusted]);

const onCheckout = ()=>{
  console.log("Checkout")
  validate.mutate(undefined, {
    onSuccess: (result: CartValidateResult)=>{
     
      const {validationPass, message} = result;
      console.log(result);
      if(validationPass){
        navigation("/checkout");
       
      }
      else{
         queryClient.invalidateQueries({ queryKey: ["cart", "user"] });
        flashMessage_Failed(message);

      }
    }
  });


}
 

  const registerRequire = ()=>{
    navigation("/Register");
    flashMessage_Failed("Please register before process");
  }
  

  const totalPrice = items.reduce(
    (sum, i) => sum + i.quantity * i.final_price,
    0,
  );

  if (isLoading && items.length <= 0) {
    return <Loading></Loading>;
  }

  return (
    <div className="ms-10 md:mx-10 md:ms-40">

    

      {items.length === 0 && (
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <h1 className="text-4xl">Your cart is empty</h1>
        </div>
      )}

      {/* cart category */}
      {items.length !== 0 && (
        <div>
          <h1 className="text-5xl py-5">Your cart</h1>
          <div className="grid grid-cols-8 mb-10">
            <h1 className="col-span-6 md:col-span-4">Product</h1>
            <h1 className="hidden md:block md:col-span-3 lg:col-span-2">Quantity</h1>
            <h1 className="md:col-span-1 lg:col-span-2">Total</h1>
          </div>

          {/* cart product items */}
          <div className="">
            {items.map((i) => {
              
              return (
                <div key={i.variation_id}>
                  <CartProduct
                    product_id={i.product_id}
                    variation_id={i.variation_id}
                    price={i.final_price}
                    disabled={validate.isPending}
                    quantity={i.quantity}
                    maxQuantity={i.stock}
                    productName={i.name}
                    label={i.label}
                    imageUrl={i.image_url}
                  ></CartProduct>
                  <hr className="mt-5" />
                </div>
              );
            })}
          </div>

          {/* Estimated total */}
          <div className="text-center md:text-end md:w-8/10">
            <div className="flex justify-center md:justify-end items-center gap-4 ">
              <h1 className="text-sm md:text-md">Estimated total </h1>
              {!isLoading && (
                <h1 className="text-md md:text-xl">
                  RM {totalPrice.toFixed(2)}
                </h1>
              )}
        
            </div>

            <p className="text-sm text-gray-600">
              Taxes and shipping calculated at checkout
            </p>
            <Button className="rounded-2xl my-2" disabled={validate.isPending} onClick={()=>isAuthenticated ? onCheckout() : registerRequire()}>Checkout</Button>
          </div>
        </div>
      )}
    </div>
  );
}

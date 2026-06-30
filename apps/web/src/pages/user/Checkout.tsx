import CartContent from "@/components/checkout/CartContent";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import CartProduct from "../../components/checkout/CartProduct";
import { useCartStore } from "../../components/checkout/CartStore";

export default function Cart() {
  const [totalPrice, setTotalPrice] = useState(0);

  const addTotalPrice = (n: number)=>{
    setTotalPrice(totalPrice + n);
  }

  return (
    <div className="ms-10 md:mx-10 md:ms-40">
      <h1 className="text-5xl py-5">Your cart</h1>

      {/* cart category */}
      <div className="grid grid-cols-8 mb-10">
        <h1 className="col-span-6 md:col-span-4">Product</h1>
        <h1 className="hidden md:block md:col-span-2">Quantity</h1>
        <h1 className="col-span-2">Total</h1>
      </div>

      {/* cart category, later replace with actual product array mapping */}
      <div className="">
        <CartProduct
          price={1500}
          addTotalPrice={addTotalPrice}
          q={1}
          productName="Productdsasdas"
        ></CartProduct>
        <hr className="mt-5" />
        <CartProduct
          price={1500}
           addTotalPrice={addTotalPrice}
          q={1}
          productName=" Product "
        ></CartProduct>
        <hr className="mt-5" />
        <CartProduct
          price={1500}
           addTotalPrice={addTotalPrice}
          q={1}
          productName=" Product "
        ></CartProduct>
        <hr className="mt-5" />
        <CartProduct
          price={1500}
           addTotalPrice={addTotalPrice}
          q={1}
          productName=" Product titl dsad ae "
        ></CartProduct>
        <hr className="mt-5" />
        <CartProduct
          price={1500}
           addTotalPrice={addTotalPrice}
          q={1}
          productName="Product titl dsad ae ssadasssssssss sassssssssss "
        ></CartProduct>
        <hr className="mt-5" />
      </div>

      <div className="text-center md:text-end md:w-8/10">
        <div className="flex justify-center md:justify-end items-center gap-4 ">
          <h1 className="text-sm md:text-md">Estimated total </h1>
          <h1 className="text-md md:text-xl">RM{totalPrice}</h1>
        </div>

        <p className="text-sm text-gray-600">Taxes and shipping calculated at checkout</p>
        <Button className="rounded-2xl my-2">Checkout</Button>
      </div>
    </div>
  );
}

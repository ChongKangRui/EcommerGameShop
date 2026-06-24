import { useEffect, useState } from "react";
import QuantitySelector from "../shop/QuantitySelector";

type CartItemProps = {
  productName: string;
  price: number;
  q: number;
  addTotalPrice: (n: number) => void;
};

export default function CartProduct({
  productName,
  price,
  q,
  addTotalPrice,
}: CartItemProps) {
  const [quantity, setQuantity] = useState(q);

  const handleQuantityChange = (q: number) => {
    setQuantity(q);
    addTotalPrice(price * q);
  };

  //   <h1 className="col-span-6 md:col-span-4" >Product</h1>
  //         <h1 className="hidden md:col-span-2">Quantity</h1>
  //         <h1 className="col-span-2">Total</h1>
  return (
    <div className="grid grid-cols-8">
      <div className="col-span-6 md:col-span-4 flex min-w-0">
        {/* product image */}
        <img
          src="/ps5_testingonly.jpg"
          alt=""
          className="w-20 h-20 md:w-40 md:h-40"
        />

        <div className="flex flex-col">
          {/* product title */}
          <h1 className=" text-sm line-clamp-3 w-3/4 md:text-xl md:line-clamp-3 md:wrap-break-word md:w-7/10 xl:w-full">
            {productName}
          </h1>
          <div className="flex">
            <h2 className="mt-5">RM {price}</h2>
            <div className="block ms-8 md:hidden">
              <QuantitySelector
                initialQuantity={1}
                cartCount={1}
                max={99}
                currentQuantity={quantity}
                setQuantity={handleQuantityChange}
              ></QuantitySelector>
            </div>
          </div>
        </div>

      </div>

      {/* Quantity */}
      <div className="hidden md:block md:col-span-2">
        <QuantitySelector
          initialQuantity={1}
          cartCount={1}
          max={99}
          currentQuantity={quantity}
          setQuantity={handleQuantityChange}
        ></QuantitySelector>
      </div>

      {/* Total */}
      <div className="col-span-2">RM {price * quantity} </div>
    </div>
  );
}

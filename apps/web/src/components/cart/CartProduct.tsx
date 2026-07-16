import { useEffect, useState } from "react";
import QuantitySelector from "../shop/QuantitySelector";
import { useCart } from "@/hooks/useCart";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useDebounce } from "@/hooks/useDebounce";

type CartItemProps = {
  product_id: number;
  variation_id: string;
  productName: string;
  disabled?: boolean;
  price: number;
  quantity: number;
  maxQuantity: number;
  label: string;
  imageUrl: string;

};

export default function CartProduct({
  product_id,
  variation_id,
  productName,
  disabled = false,
  price,
  quantity,
  maxQuantity,
  label,
  imageUrl,
  
}: CartItemProps) {
 //const [quantity, setQuantity] = useState(q);
  const {updateItem, removeItem} = useCart();

  const handleQuantityChange = (n: number)=>{
    const newQuantity = Math.min(n, maxQuantity);
    updateItem({variation_id: variation_id,quantity: newQuantity})

  }

  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-8">
      <div className="col-span-6 md:col-span-4 flex">
        {/* product image */}
        <img
          src={imageUrl}
          alt=""
          className="w-20 h-20 md:w-40 md:h-40"
        />

        <div className="flex flex-col">
          {/* product title */}
          <h1 className="text-sm line-clamp-3 w-2/4 sm:w-full md:text-xl md:line-clamp-3 md:wrap-break-word md:w-7/10 xl:w-full cursor-pointer underline" onClick={()=>navigate(`/collections/${product_id}`)}>
            {productName}
          </h1>
          <h2 className="">{label}</h2>
          <div className="flex">
            <h2 className="mt-5">RM {Number(price).toFixed(2)}</h2>
            
            {/* Mobile version of selec quantity */}
            <div className="flex flex-col items-center sm:flex-row ms-8 md:hidden">
              <QuantitySelector
                initialQuantity={1}
                cartCount={0}
                displayItemInCart={false}
                max={maxQuantity}
                currentQuantity={quantity}
                disabled={disabled}
                setQuantity={handleQuantityChange}
              ></QuantitySelector>
              <Trash2 className="cursor-pointer mt-2 ms-2 w-5 h-5" onClick={()=>removeItem(variation_id)}></Trash2>
              
            </div>
          </div>
        </div>

      </div>

      {/* Window version of quantity */}
      <div className="hidden h-full md:col-span-3 lg:col-span-2 md:flex">
        <QuantitySelector
          initialQuantity={1}
          cartCount={0}
          displayItemInCart={false}
          max={maxQuantity}
          currentQuantity={quantity}
          disabled={disabled}
          setQuantity={handleQuantityChange}
        ></QuantitySelector>
        <Trash2 className="cursor-pointer mt-2 ms-2 w-5 h-5" onClick={()=>removeItem(variation_id)}></Trash2>
      </div>

      {/* Total */}
      <div className="md:col-span-1 lg:col-span-2 h-5">RM {(price * quantity).toFixed(2)} </div>
      
    </div>
  );
}

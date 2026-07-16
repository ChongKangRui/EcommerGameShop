import { Badge } from "@/components/ui/badge";

import { Link, useNavigate } from "react-router";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import QuantitySelector from "./QuantitySelector";
import { Button } from "@/components/ui/button";
import type { Product, ProductVariation } from "@ecom/shared/src/type/product";

import { useCart } from "@/hooks/useCart";
import { flashMessage_Failed } from "@/lib/flash";
import Loading from "../Loading";

type ShopItemProps = {
  // productName: string;
  // price: number;
  // stock: number;
  product: Product;
  productVariation: ProductVariation[];
  currentProductVariation: ProductVariation | undefined;
  setCurrentVariationId: (variation_id: string) => void;
};

export function ProductDetail({
  product,
  productVariation,
  currentProductVariation,
  setCurrentVariationId,
}: ShopItemProps) {
  const [quantity, setQuantity] = useState(
    Math.min(currentProductVariation?.stock ?? 0, 1),
  );

  useEffect(() => {
    setQuantity(Math.min(currentProductVariation?.stock ?? 0, 1));
  }, [currentProductVariation]);

  const { items, addItem, isLoading } = useCart();
  const cartItem = items.find(
    (i) => i.variation_id === currentProductVariation?.variation_id,
  );

  const stock = currentProductVariation?.stock ?? 0;
  const maxStock = stock - (cartItem?.quantity ?? 0);
  const cartItemQuantity = cartItem?.quantity ?? 0;

  const disableAddToChart = stock <= 0 || cartItemQuantity >= stock;

  const addItemFn = () => {
    if (cartItem) {
    
      const finalQuantity = Math.min(cartItem.quantity + quantity, stock); 

      addItem({
        variation_id: currentProductVariation?.variation_id ?? "",
        quantity: finalQuantity,
      });
    } else {
      console.log(quantity, "+", cartItemQuantity);
      addItem({
        variation_id: currentProductVariation?.variation_id ?? "",
        quantity: quantity,
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex flex-col justify-center items-center h-full gap-5 md:gap-5 md:items-stretch md:justify-between mt-10 md:w-1/2">
        <h1 className="text-3xl wrap text-center md:text-left">
          {product.name}
        </h1>
        <div>
          <h3 className="text-gray-600 text-center md:text-left">
            Free delivery to East and West Malaysia
          </h3>
          <h2 className="text-2xl text-center md:text-left">
            RM {currentProductVariation?.final_price}
          </h2>
        </div>

        {productVariation.length > 0 && (
          <div className="flex gap-2">
            {productVariation.map((variation) => {
              return (
                variation.label &&
                <Button
                  key={variation.variation_id}
                  className="min-w-20"
                  disabled={
                    variation.variation_id ===
                    currentProductVariation?.variation_id
                  }
                  onClick={() => setCurrentVariationId(variation.variation_id)}
                >
                  {variation.label}
                </Button>
              );
            })}
          </div>
        )}

        <div className="flex flex-row justify-center gap-5 items-center md:flex-col md:items-baseline">
          <QuantitySelector
            initialQuantity={1}
            cartCount={1}
            max={maxStock}
            currentQuantity={quantity}
            setQuantity={setQuantity}
          ></QuantitySelector>
          <Button
            className="hover:bg-black hover:text-red-500 mt-5"
            disabled={disableAddToChart}
            onClick={() => addItemFn()}
          >
            Add to chart
          </Button>
        </div>
      </div>
    </div>
  );
}

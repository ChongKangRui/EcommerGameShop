import { Badge } from "@/components/ui/badge";

import { Link } from "react-router";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import QuantitySelector from "./QuantitySelector";
import { Button } from "@/components/ui/button";


type ShopItemProps = {
  productName: string;
  price: number;
  stock: number;
  Date?: Date;
};

export function ProductDetail({ productName, price, stock }: ShopItemProps) {

const [quantity, setQuantity] = useState(1);

  return (
    <div>
        <div className="flex flex-col justify-center items-center md:items-stretch md:justify-around mt-10 md:w-1/2">
            <h1 className="text-3xl wrap text-center md:text-left">{productName}</h1>
            <div>
            <h3 className="text-gray-600 mt-5 text-center md:text-left">Free delivery to East and West Malaysia</h3>
            <h2 className="mt-5 text-2xl text-center md:text-left">RM {price}</h2>
            </div>
            
            <div className="mt-20">
                <QuantitySelector initialQuantity={1} cartCount={1}  max={stock} currentQuantity={quantity} setQuantity={setQuantity}></QuantitySelector>

            </div>
             <Button className="hover:bg-black hover:text-red-500 mt-5">Add to chart</Button>    
        </div>


    </div>
  );
}

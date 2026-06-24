import { ShopItemCard } from "@/components/shop/ShopItem";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ShopFilterSelection } from "@/components/shop/ShopFilterSelection";

import { ProductDetail } from "@/components/shop/ProductDetail";
import { ProductDescription } from "@/components/shop/ProductDescription";

export default function Product() {
  return (
    <div>
        <div className="flex flex-col md:flex-row md:justify-center md:items-center  ">
            <img src="https://m.media-amazon.com/images/I/616X8zng9wS.jpg" className="md:w-1/2 md:p-20" alt="" />
            
            <ProductDetail productName="Ps5 lorem lorem lorem lorem lorem lorem lorem lorem lorem" price={2000} stock={15}></ProductDetail>


        </div>
        <ProductDescription description="Lorem"></ProductDescription>
        

    </div>
  );
}

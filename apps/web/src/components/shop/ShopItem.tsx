import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ShopItemProps = {
  id: number,
  productName: string;
  discountedPrice: number;
  originalPrice: number;
  soldOut: boolean;
  image_url: string;
  
};

export function ShopItemCard({id, productName, discountedPrice, soldOut, image_url, originalPrice }: ShopItemProps) {

const hasDiscount = discountedPrice < originalPrice;
  return (
    <Link to={`/collections/${id}`}>
      <Card size="sm" className="mx-auto w-full max-w-xs overflow-hidden p-0 ">
        <CardHeader className="relative p-0">
          {/* Sold Out Badge - positioned absolutely on the image */}
          {soldOut && (
            <Badge
              
              className="absolute right-2 bottom-2 z-10 text-[12px] h-4 py-3 px-5 bg-black text-white"
            >
              Sold Out
            </Badge>
          )}

          {/* Image - fills the CardHeader space */}
          <div className="relative aspect-square w-full bg-muted">
            <img
              src={image_url}
              alt={productName}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-0 px-3 pb-2 -mt-2">
          {/* Product Name - top of footer */}
          <h3 className="text-sm font-medium leading-tight line-clamp-3">
            {productName}
          </h3>

          {/* Price - bottom of footer */}
          <div className="flex w-full text-xs font-semibold text-muted-foreground">
             RM
             <p className={`${hasDiscount && "line-through"}`}>
            {originalPrice}
          </p>
           {hasDiscount && <p className='text-xs font-semibold text-black italic ms-1'>{discountedPrice}</p>}
          </div>
          
         
        </CardFooter>
      </Card>
    </Link>
  );
}

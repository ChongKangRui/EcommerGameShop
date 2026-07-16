import { ShoppingCart } from "lucide-react";

import { useCart } from "@/hooks/useCart";



export default function ShoppingCartIcon() {


  const {totalItems}=useCart();

  return (
    <div className="relative">
      <ShoppingCart className="size-6 hover:text-red-500" />
      <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
        {totalItems}
      </span>
    </div>
  );
}

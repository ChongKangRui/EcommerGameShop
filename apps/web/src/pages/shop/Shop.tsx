import { ShopItemCard } from "@/components/shop/ShopItem";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ShopFilterSelection } from "@/components/shop/ShopFilterSelection";
import { useProductSearch } from "@/hooks/useProductSearch";
import { flashMessage_Failed } from "@/lib/flash";

export default function Shop() {

const { data, search, filters, pagination } = useProductSearch({limit:20});


   if(data.isError){
     flashMessage_Failed(data.error ?? "Invalid action");
     
   }

  return (
    <div>

      <div className="flex justify-around my-10">
        <div className="relative w-2/5">
          <Input type="text" placeholder="Search" className="pl-3 pr-10" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <ShopFilterSelection></ShopFilterSelection>
      </div>

      <div className="grid grid-cols-2 px-3 gap-2 w-12/12 md:grid-cols-4 md:gap-9 md:w-full md:px-40">
        {/* <ShopItemCard
          productName="lorem loremloremloremlorem loremloremv loremlorem"
          price={12312.21}
          soldOut={false}
        ></ShopItemCard>
        <ShopItemCard
          productName="PS5 ABCD"
          price={12312.21}
          soldOut={false}
        ></ShopItemCard>
        <ShopItemCard
          productName="PS5 ABCD"
          price={12312.21}
          soldOut={true}
        ></ShopItemCard>
        <ShopItemCard
          productName="PS5 ABCD"
          price={12312.21}
          soldOut={false}
        ></ShopItemCard>
        <ShopItemCard
          productName="PS5 ABCD"
          price={12312.21}
          soldOut={false}
        ></ShopItemCard>
        <ShopItemCard
          productName="PS5 ABCD"
          price={12312.21}
          soldOut={false}
        ></ShopItemCard>
        <ShopItemCard
          productName="PS5 ABCD"
          price={12312.21}
          soldOut={false}
        ></ShopItemCard> */}
      </div>
    </div>
  );
}

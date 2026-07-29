
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { usePromotedProductQuery } from "@/hooks/useProduct";
import { ShopItemCard } from "../shop/ShopItem";
import { useAutoplayCarousel } from "@/hooks/useCarousell";

export default function PromotedProductCarousell() {
  const { plugin,setApi, onMouseEnter, onMouseLeave } = useAutoplayCarousel({
    delay: 3000,
    stopOnInteraction: false,
  });

  const promotedProductQuery = usePromotedProductQuery();

  if (promotedProductQuery.isLoading || promotedProductQuery.isError) {
    return <></>;
  }

  return (
    <Carousel
      className="w-full mx-auto max-w-[30rem] md:max-w-[70rem] mt-5"
      plugins={[plugin]}
      setApi={setApi}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      opts={{
        loop: true,
        watchDrag: true,
      }}
    >
      <CarouselContent className="-ml-1">
        {promotedProductQuery.data?.products.map((product, index) => {
          const discounted_price = Number(
            parseFloat(product.discounted_price).toFixed(2),
          );
          const originalPrice = Number(parseFloat(product.price).toFixed(2));
          return (
            <CarouselItem key={index} className="basic-2/2 sm:basis-1/2 pl-5 md:pl-10 md:basis-1/5">
              <div className="p-1">
                <ShopItemCard
                  key={product.product_id}
                  id={product.product_id}
                  productName={product.name}
                  discountedPrice={discounted_price}
                  soldOut={false}
                  image_url={product.cover_image_url}
                  originalPrice={originalPrice}
                ></ShopItemCard>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

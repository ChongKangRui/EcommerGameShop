"use client"

import { HomeBannerCollections } from "@/data/HomeBannerCollection"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
 
} from "@/components/ui/carousel"
import { useAutoplayCarousel } from "@/hooks/useCarousell"

export default function HomeCarousell() {
 const { plugin,setApi, onMouseEnter, onMouseLeave } = useAutoplayCarousel({
     delay: 5000,
     stopOnInteraction: false,
   });

  return (
    <Carousel
     
      className="max-w-[50rem] md:max-w-5xl mx-auto mt-5"
      plugins={[plugin]}
      setApi={setApi}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      opts={{
        loop: true,  
      watchDrag: true,
      }}
    >
      <CarouselContent>
        {HomeBannerCollections.map((item, index) => (
          <CarouselItem key={index} >
            <img className="w-full h-70 sm:h-100 md:h-130 object-cover" src={item.imgRef} alt="" />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselPrevious />
      <CarouselNext /> */}
    </Carousel>
  )
}

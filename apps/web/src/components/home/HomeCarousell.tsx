"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { HomeBannerCollections } from "../../data/HomeBannerCollection"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
 
} from "@/components/ui/carousel"

export default function HomeCarousell() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="max-w-[50rem] md:max-w-5xl mx-auto mt-5"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={()=>{plugin.current.reset(); plugin.current.play()}}
      opts={{
        loop: true,  
      watchDrag: true,
      }}
    >
      <CarouselContent>
        {HomeBannerCollections.map((item, index) => (
          <CarouselItem key={index} >
            <img className="w-full h-50 md:h-130 object-cover" src={item.imgRef} alt="" />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselPrevious />
      <CarouselNext /> */}
    </Carousel>
  )
}

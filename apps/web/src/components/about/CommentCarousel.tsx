"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { customerComments } from "../../data/CommentCollection"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
 
} from "@/components/ui/carousel"

export default function CommentCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full max-w-[50rem] md:max-w-3xl"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={()=>{plugin.current.reset(); plugin.current.play()}}
      opts={{
        loop: true,  
        watchDrag: false
      }}
    >
      <CarouselContent>
        {customerComments.map((comment, index) => (
          <CarouselItem key={index} >
            <div className="">
              <h1> {comment.comment}</h1>
                <h1 className="mt-5 font-bold"> {comment.name}</h1>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselPrevious />
      <CarouselNext /> */}
    </Carousel>
  )
}

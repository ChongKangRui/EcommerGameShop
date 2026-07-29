// hooks/useAutoplayCarousel.ts
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import type { CarouselApi } from "@/components/ui/carousel";

interface UseAutoplayCarouselOptions {
  delay?: number;
  stopOnInteraction?: boolean;
}

export function useAutoplayCarousel(options: UseAutoplayCarouselOptions = {}) {
  const { delay = 5000, stopOnInteraction = false } = options;

  const plugin = React.useRef(Autoplay({ delay, stopOnInteraction }));
  const [api, setApi] = React.useState<CarouselApi>();

  const onMouseEnter = React.useCallback(() => {
    api?.plugins()?.autoplay?.stop();
  }, [api]);

  const onMouseLeave = React.useCallback(() => {
    const autoplay = api?.plugins()?.autoplay;
    if (!autoplay) return;
    autoplay.reset();
    autoplay.play();
  }, [api]);

  return { plugin: plugin.current, setApi, onMouseEnter, onMouseLeave };
}
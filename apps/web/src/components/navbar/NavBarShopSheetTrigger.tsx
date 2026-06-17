import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useState, useEffect } from "react";

import NavBarMenuItem from "./NavBarMenuItem";
import {productCategoryCollections} from "../data/ProductCategoryCollections"

export default function NavBarShopSheetTrigger() {
  const [isDesktop, setIsDesktop] = useState(false);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Create media query list
    const media = window.matchMedia("(min-width: 768px)");

    // Set initial value
    setIsDesktop(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
      console.log("is desktop?",event.matches);
    };

    // Add listener
    media.addEventListener("change", listener);

    // Cleanup, run only after unmounted
    return () => {
    console.log("Clear event listener?");
      media.removeEventListener("change", listener);
    };
  }, []);

  useEffect(() => {
    if (isDesktop && open) {
      setOpen(false);
    }
  }, [isDesktop, open]);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger render={<Button className="bg-black hover:bg-black hover:text-red-500 text-white"> Shop By Platform</Button>} />
      <SheetContent className="data-[side=right]:w-full  bg-black">
        <SheetHeader>
          <SheetTitle>Shop By Platform</SheetTitle>
        
          <hr />
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 justify-center">
           
{productCategoryCollections.map((collection) => (
                    <NavBarMenuItem
                      key={collection.href}
                      name={collection.title}
                      link={collection.href}
                    />
                  ))}
         
        </div>
      </SheetContent>
    </Sheet>
  );
}

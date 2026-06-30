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

import {
  MenuIcon
} from "lucide-react";

import { useState, useEffect } from "react";

import NavBarMenuItem from "./NavBarMenuItem";
import NavBarShopSheetTrigger from "./NavBarShopSheetTrigger";
import { useAuth } from "@/context/AuthProvider";

export default function NavBarSheet() {
  const [isDesktop, setIsDesktop] = useState(false);

  const [open, setOpen] = useState(false);
 const {isAuthenticated, user, logout} = useAuth();

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
      <SheetTrigger render={<Button><MenuIcon className="size-7"></MenuIcon> </Button>} />
      <SheetContent className="data-[side=right]:w-full  bg-black">
        <SheetHeader>
          <SheetTitle className="text-white">Hi, {isAuthenticated ? `${user?.first_name} ${user?.last_name}` : "Guest"}</SheetTitle>
          <SheetDescription>
           Have fun with Redfield Gaming
          </SheetDescription>
          <hr />
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 justify-start">
           
          <NavBarMenuItem name="Home" link="/" onClick={()=>setOpen(false)} />
          <NavBarShopSheetTrigger/>
          <NavBarMenuItem name="About" link="/about" onClick={()=>setOpen(false)} />

          {
          isAuthenticated ?
            <div className="grid auto-rows-min gap-6 ">
              <NavBarMenuItem name="Profile" link="/" onClick={()=>setOpen(false)} />
              <NavBarMenuItem name="Logout" link="/" onClick={()=>{setOpen(false);logout();}} />
            </div>
          :
          <div>
              <NavBarMenuItem name="Login" link="/login" onClick={()=>setOpen(false)} />
              <NavBarMenuItem name="Register" link="/register" onClick={()=>setOpen(false)} />
             
            </div>

         }
        
        </div>
         
         


      </SheetContent>
    </Sheet>
  );
}

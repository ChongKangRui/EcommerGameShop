import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import NavBarLinkItem from "./NavBarLinkItem";
import NavBarMenuItem from "./NavBarMenuItem";
import NavBarUserDropDown from "./NavBarUserDropDown"
import NavBarSheet from "./NavBarSheet"; 
import { useState } from "react";

import {productCategoryCollections} from "../../data/ProductCategoryCollections"
import { Link } from "react-router";

export default function NavBar() {

 const [value, setValue] = useState("");
  return (
    <NavigationMenu value={value} onValueChange={setValue} className={"bg-black text-white w-full"}>
      <NavigationMenuList className={" justify-between"}>
       
       {/* Title */}
       <Link className="font-bitcount p-4" to={"/"}>RedField Gaming</Link>
        
        <div className="hidden md:flex">
          {/* Home Page */}
          <NavBarLinkItem name="Home" link="/" />

          {/* Shop page */}
          <NavigationMenuItem className="" value="platform">
            <NavigationMenuTrigger className="" >
              Shop By Platform
            </NavigationMenuTrigger>
            <NavigationMenuContent className={"bg-black"}>
              <ul className="grid w-[100px] lg:w-[200px]">
                <li>
                  {productCategoryCollections.map((collection) => (
                    <NavBarMenuItem
                      key={collection.href}
                      name={collection.title}
                      link={collection.href}
                      onClick={() => setValue("")}
                    />
                  ))}
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* About Page */}
          <NavBarLinkItem name="About" link="/about" />

        </div>

        <div className="hidden md:flex justify-center items-center">
          <Link to={"/carts"}> <img src="/cartIcon.png" className="invert w-5 h-5 " alt="" /> </Link>
          <NavBarUserDropDown ></NavBarUserDropDown> 
        </div>                   
       
       {/* Mobile Nav Bar Sheet */}
       <div className="flex items-center md:hidden">
        <Link to={"/carts"}> <img src="/cartIcon.png" className="invert w-8 h-8 " alt="" /> </Link>
            <NavBarSheet></NavBarSheet>
       </div>
      
      
      </NavigationMenuList>

      


    </NavigationMenu>
  );
}

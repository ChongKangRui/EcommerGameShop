import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import NavBarLinkItem from "./NavBarLinkItem";
import NavBarMenuItem from "./NavBarMenuItem";
import NavBarUserDropDown from "./NavBarUserDropDown"
import NavBarSheet from "./NavBarSheet"; 

import {productCategoryCollections} from "../data/ProductCategoryCollections"

export default function NavBar() {
  return (
    <NavigationMenu className={"bg-black text-white w-full"}>
      <NavigationMenuList className={" justify-between"}>
       
       {/* Title */}
        <h1 className="font-bitcount p-4">RedField Gaming</h1>

        <div className="hidden md:flex">
          {/* Home Page */}
          <NavBarLinkItem name="Home" link="/" />

          {/* Shop page */}
          <NavigationMenuItem className="" >
            <NavigationMenuTrigger className="">
              Shop By Platform
            </NavigationMenuTrigger>
            <NavigationMenuContent className={"bg-black"}>
              <ul className="grid w-[100px] lg:w-[200px">
                <li>
                  {productCategoryCollections.map((collection) => (
                    <NavBarMenuItem
                      key={collection.href}
                      name={collection.title}
                      link={collection.href}
                    />
                  ))}
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* About Page */}
          <NavBarLinkItem name="About" link="/about" />

        </div>

        <div className="hidden md:block">
          <NavBarUserDropDown ></NavBarUserDropDown> 
        </div>                   
       
       {/* Mobile Nav Bar Sheet */}
       <div className="block md:hidden">
            <NavBarSheet></NavBarSheet>
       </div>
      
      
      </NavigationMenuList>

      


    </NavigationMenu>
  );
}

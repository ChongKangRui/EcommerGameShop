import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import NavBarLinkItem from "./NavBarLinkItem";
import NavBarMenuItem from "./NavBarMenuItem";
import NavBarUserDropDown from "./NavBarUserDropDown";
import NavBarSheet from "./NavBarSheet";
import { useState } from "react";

import { productCategoryCollections } from "@/data/ProductCategoryCollections";
import { Link } from "react-router";
import ShoppingCartIcon from "./ShoppingCartIcon";

export default function NavBar() {
  const [value, setValue] = useState<string | null>(null);
  //const [platformValue, setPlatformValue] = useState("platform");
  return (
    <NavigationMenu
      value={value}
      onValueChange={(v) => {
    setValue(v);
  }}
      className={"bg-black text-white w-full"}
    >
      <NavigationMenuList className={" justify-between"}>
        {/* Title */}
        <Link className="font-bitcount p-4" to={"/"}>
          RedField Gaming
        </Link>

        <div className="hidden md:flex">
          {/* Home Page */}
          <NavBarLinkItem name="Home" link="/" />

          {/* Shop page */}
          <NavigationMenuItem className="" value="platform">
            <NavigationMenuTrigger className="">
              Shop By Platform
            </NavigationMenuTrigger>
            <NavigationMenuContent className={"bg-black data-[motion^=from-]:animate-none data-[motion^=to-]:animate-none data-[motion=from-start]:translate-x-0 data-[motion=from-end]:translate-x-0"}>
              <ul className="grid w-[100px] lg:w-[200px]">
                <li>
                  {productCategoryCollections.map((collection) => (
                    <NavBarMenuItem
                      key={collection.href}
                      name={collection.title}
                      link={collection.href}
                      onClick={() => setValue(null)}
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
          <Link to={"/carts"}>
            <ShoppingCartIcon />
          </Link>
          <NavBarUserDropDown></NavBarUserDropDown>
        </div>

        {/* Mobile Nav Bar Sheet */}
        <div className="flex items-center md:hidden">
          <Link to={"/carts"}>
            <ShoppingCartIcon />
          </Link>
          <NavBarSheet></NavBarSheet>
        </div>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

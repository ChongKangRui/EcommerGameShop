
import { Link } from "react-router";

import {
  NavigationMenuItem,
    NavigationMenuLink,
    
} from "@/components/ui/navigation-menu";
import type {NavBarLinkProps} from "./NavBarItemType";


export default function NavBarLinkItem({name, link, onClick} : NavBarLinkProps) {
  return (
   
        <NavigationMenuItem>
          <NavigationMenuLink className={"hover:text-red-500"} render={<Link to={link}>{name}</Link>} onClick={onClick}/>
        
        </NavigationMenuItem>
  );
}

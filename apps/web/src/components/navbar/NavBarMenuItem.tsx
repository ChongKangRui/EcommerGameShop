import {

NavigationMenuLink,
    
} from "@/components/ui/navigation-menu";

import { Link } from "react-router";
import type {NavBarLinkProps} from "./NavBarItemType";


export default function NavBarMenuItem({name, link, onClick} : NavBarLinkProps) {
  return (
   
    <NavigationMenuLink onClick={onClick} className="flex-row items-center gap-2 text-white hover:text-red-500" render={<Link to={link}>{name}</Link>} />

  );
}

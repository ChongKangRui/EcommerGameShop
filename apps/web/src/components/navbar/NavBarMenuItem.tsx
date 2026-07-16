import {

NavigationMenuLink,
    
} from "@/components/ui/navigation-menu";

import { Link, useNavigate } from "react-router";
import type {NavBarLinkProps} from "./NavBarItemType";


export default function NavBarMenuItem({name, link, onClick} : NavBarLinkProps) {

  const navigate = useNavigate();
  const handleClick = ()=>{
    onClick?.();
    navigate(`${link}`);
  }

  return (
   
    <NavigationMenuLink onClick={handleClick} className="flex-row items-center gap-2 text-white hover:text-red-500" render={
    <div className="cursor-pointer">{name}</div>} />

  );
}

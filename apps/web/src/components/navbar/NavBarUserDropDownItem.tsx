
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import type{ CommonType } from "../CommonType"
import type { NavBarLinkProps } from "./NavBarItemType"
import { Link } from "react-router"

export default function NavBarUserDropDownItem({name, link, onClick} : NavBarLinkProps){
    return(
         <DropdownMenuItem className="text-white hover:bg-black cursor-pointer  focus:hover:text-red-500 focus:hover:bg-black not-focus:hover:text-red-500" onClick={onClick} render={<Link to={link}>{name}</Link>}>
          
         </DropdownMenuItem>
    )
} 
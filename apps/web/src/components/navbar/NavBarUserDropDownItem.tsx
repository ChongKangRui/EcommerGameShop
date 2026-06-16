
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import type{ CommonType } from "../CommonType"

export default function NavBarUserDropDownItem({children} : CommonType){
    return(
         <DropdownMenuItem className="text-white hover:bg-gray-600">{children}</DropdownMenuItem>
    )
} 
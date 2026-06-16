import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import NavBarUserDropDownItem from "./NavBarUserDropDownItem"

export default function NavBarUserDropDown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button className="bg-black hover:text-red-500"><img src="/UserIcon.png" alt="" className="w-7 h-7 invert" /></Button>} />
      <DropdownMenuContent className="bg-black">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Customer Name</DropdownMenuLabel>
         <NavBarUserDropDownItem>Profile</NavBarUserDropDownItem>
           <NavBarUserDropDownItem>Settings</NavBarUserDropDownItem>
           <NavBarUserDropDownItem>Logout</NavBarUserDropDownItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

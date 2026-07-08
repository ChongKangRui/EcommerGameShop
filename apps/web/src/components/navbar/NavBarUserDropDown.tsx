import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,

  DropdownMenuLabel,

  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import NavBarUserDropDownItem from "./NavBarUserDropDownItem";
import { useAuth } from "@/context/AuthProvider";

import {

  User,
} from "lucide-react";


export default function NavBarUserDropDown() {

const {isAuthenticated, user, logout} = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="bg-black hover:text-red-500 cursor-pointer">
            <User className="size-6 "></User>
           
          </Button>
        }
      />
      <DropdownMenuContent className="bg-black">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Hi, {isAuthenticated ? `${user?.first_name} ${user?.last_name}` : "Guest"}</DropdownMenuLabel>
 
          
             {
          isAuthenticated ?
          <div>
            <NavBarUserDropDownItem name="Profile" link="/profile"></NavBarUserDropDownItem>
            {/* <NavBarUserDropDownItem name="Settings" link="/"></NavBarUserDropDownItem> */}
            <NavBarUserDropDownItem name="Logout" link="/" onClick={logout}></NavBarUserDropDownItem>
          </div>:
          <div>
             <NavBarUserDropDownItem name="Login" link="/login"></NavBarUserDropDownItem>
          <NavBarUserDropDownItem name="Register" link="/register"></NavBarUserDropDownItem>

          </div>
             }

         
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

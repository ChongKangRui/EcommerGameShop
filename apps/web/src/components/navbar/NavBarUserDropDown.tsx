import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import NavBarUserDropDownItem from "./NavBarUserDropDownItem";
import { useAuth } from "@/context/AuthProvider";

export default function NavBarUserDropDown() {

const {isAuthenticated, user, logout} = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="bg-black hover:text-red-500 cursor-pointer">
            <img src="/UserIcon.png" alt="" className="w-7 h-7 invert" />
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

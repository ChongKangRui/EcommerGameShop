import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import NavBarUserDropDownItem from "@/components/navbar/NavBarUserDropDownItem";
import { useAuth } from "@/context/AuthProvider";

import { User } from "lucide-react";

type AdminDropdownProps = {
  isCollapsed: boolean;
};

export default function AdminDropDown({ isCollapsed }: AdminDropdownProps) {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="bg-black hover:bg-black cursor-pointer">
           
              <User className="shrink-0 h-5 w-5" />
              {!isCollapsed && (
                <span className="truncate text-sm ms-5">
                  {user?.first_name} {user?.last_name}
                </span>
              )}
           
          </Button>
        }
      />
      <DropdownMenuContent className="bg-black" >
        <DropdownMenuGroup>
          {/* <DropdownMenuLabel>Hi, {isAuthenticated ? `${user?.first_name} ${user?.last_name}` : "Guest"}</DropdownMenuLabel>
           */}

          <div>
            <NavBarUserDropDownItem
              name="Profile"
              link="/profile"
            ></NavBarUserDropDownItem>

            <NavBarUserDropDownItem
              name="Logout"
              link="/"
              onClick={logout}
            ></NavBarUserDropDownItem>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

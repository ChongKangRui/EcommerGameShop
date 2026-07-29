
 import { Link } from "react-router-dom";
 import {
   LayoutDashboard,
   Package,
   ShoppingCart,
   PanelLeft,
   Plus,
   RotateCcw ,
 } from "lucide-react";

 import AdminDropDown from "./AdminDropDown"
import { useIsMobile } from "@/lib/utils";
 const menuItems = [
   { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
   { to: "/admin/products", icon: Package, label: "View Products" },
   { to: "/admin/addproduct", icon: Plus, label: "Add Product" },
    { to: "/admin/refunds", icon: RotateCcw, label: "Check Refunds" },
   { to: "/admin/orders", icon: ShoppingCart, label: "Check Orders" },
 ];

type collapseState = {
  isCollapsed: boolean,
  setIsCollapsed: (collapse: boolean)=>void,
}

 export function AdminSideBar({isCollapsed, setIsCollapsed}: collapseState) {
   //const [isCollapsed, setIsCollapsed] = useState(false);

   const isMobile = useIsMobile();

   return (
     <div
       className={`
         flex flex-col h-full fixed shrink-0
         border-r border-zinc-800 bg-zinc-950 text-white
         transition-all duration-300 ease-in-out
         ${isCollapsed ? "w-14" : "w-full md:w-52"}
       `}
     >
       {/* Header */}
       <div className="flex items-center justify-between px-3 py-4 border-b border-zinc-800">
         {!isCollapsed && (
           <Link className="font-bitcount text-sm truncate text-white" to="/">
             RedField Gaming
           </Link>
         )}
         <button
           onClick={() => setIsCollapsed(!isCollapsed)}
           className="ml-auto p-1 rounded hover:bg-zinc-800 shrink-0 cursor-pointer"
         >
           <PanelLeft className="h-5 w-5 text-zinc-400" />
         </button>
       </div>
       {/* Menu */}
       <div className="flex flex-col gap-1 p-2 flex-1">
         {menuItems.map(({ to, icon: Icon, label }) => (
           <Link
             key={to}
             to={to}
             className="flex items-center gap-3 px-2 py-2 rounded-md
                        hover:bg-zinc-800 text-zinc-300 hover:text-white
                        transition-colors"
              onClick={()=> setIsCollapsed(!isCollapsed && isMobile)}
           >
             <Icon className="shrink-0 h-5 w-5" />
             {!isCollapsed && <span className="truncate text-sm">{label}</span>}
           </Link>
         ))}
       </div>
       {/* footer */}
       <div className="flex py-5 px-4 rounded shrink-0">
        <AdminDropDown isCollapsed={isCollapsed}></AdminDropDown>
         {/* <User className="shrink-0 h-5 w-5" />
         {!isCollapsed && <span className="truncate text-sm ms-5">{user?.first_name} {user?.last_name}</span>} */}
       </div>
     </div>
   );
 }
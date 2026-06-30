//import { Link } from "react-router-dom";
//import {
//  LayoutDashboard,
//  Package,
//  ShoppingCart,
//  Plus,
//  User,
//} from "lucide-react";
//import {
//  Sidebar,
//  SidebarHeader,
//  SidebarContent,
//  SidebarFooter,
//  SidebarMenu,
//  SidebarMenuItem,
//  SidebarMenuButton,
//  SidebarTrigger,
//} from "@/components/ui/sidebar";
//import { useAuth } from "@/context/AuthProvider";
//import { useState } from "react";
//
//
//const menuItems = [
//  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
//  { to: "/admin/products", icon: Package, label: "View Products" },
//  { to: "/admin/addproduct", icon: Plus, label: "Add Product" },
//  { to: "/admin/orders", icon: ShoppingCart, label: "Check Orders" },
//];

// export function AdminSideBar() {
//   const { user } = useAuth();
//   //const [isCollapsed, setIsCollapsed] = useState(false);
//   return (
//     <Sidebar
//       collapsible="icon"
//       className="border-r border-zinc-800 bg-zinc-950 text-white "
    
//     >
//       {/* Header */}
//       <SidebarHeader className="flex flex-row items-center justify-between px-3 py-4 border-b border-zinc-800">
//         <Link
//           className="font-bitcount text-sm truncate text-white group-data-[collapsible=icon]:hidden"
//           to="/"
//         >
//           RedField Gaming
//         </Link>
//         <SidebarTrigger className="text-white hover:text-gray-500 hover:bg-black" />
//       </SidebarHeader>

//       {/* Menu */}
//       <SidebarContent className="p-2">
//         <SidebarMenu>
//           {menuItems.map(({ to, icon: Icon, label }) => (
//             <SidebarMenuItem key={to}>
//               <SidebarMenuButton tooltip={label}>
//                 <Link
//                   to={to}
//                   className="text-zinc-300 hover:bg-zinc-800 hover:text-white flex 
//                   items-center gap-3 px-1 py-2 rounded-md transition-colors"
//                 >
//                   <Icon className="shrink-0 h-5 w-5" />

//                   <span className="truncate text-sm">{label}</span>
//                 </Link>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           ))}
//         </SidebarMenu>
//       </SidebarContent>

//       {/* Footer */}
//       <SidebarFooter className="flex flex-row items-center py-5 px-4">
//         <User className="shrink-0 h-5 w-5" />
//         <span className="truncate text-sm ms-3 group-data-[collapsible=icon]:hidden">
//           {user?.first_name} {user?.last_name}
//         </span>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

 import { Link } from "react-router-dom";
 import {
   LayoutDashboard,
   Package,
   ShoppingCart,
   PanelLeft,
   Plus,
   User,
 } from "lucide-react";
 import { useSidebar } from "@/components/ui/sidebar";
 import { useState } from "react";
 import { useAuth } from "@/context/AuthProvider";
 const menuItems = [
   { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
   { to: "/admin/products", icon: Package, label: "View Products" },
   { to: "/admin/addproduct", icon: Plus, label: "Add Product" },
   { to: "/admin/orders", icon: ShoppingCart, label: "Check Orders" },
 ];

type collapseState = {
  isCollapsed: boolean,
  setIsCollapsed: (collapse: boolean)=>void,
}

 export function AdminSideBar({isCollapsed, setIsCollapsed}: collapseState) {
   //const [isCollapsed, setIsCollapsed] = useState(false);
   const {user} = useAuth();
   

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
           >
             <Icon className="shrink-0 h-5 w-5" />
             {!isCollapsed && <span className="truncate text-sm">{label}</span>}
           </Link>
         ))}
       </div>
       {/* footer */}
       <div className="flex py-5 px-4 rounded shrink-0">
         <User className="shrink-0 h-5 w-5" />
         {!isCollapsed && <span className="truncate text-sm ms-5">{user?.first_name} {user?.last_name}</span>}
       </div>
     </div>
   );
 }
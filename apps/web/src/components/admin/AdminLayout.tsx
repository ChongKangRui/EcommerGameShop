// AdminLayout.tsx
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import { AdminSideBar } from "./AdminSideBar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    // defaultOpen={true} ensures sidebar starts expanded on all screen sizes

    <div className="flex flex-row min-h-screen w-full">
      <AdminSideBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      {/* <SidebarInset> */}
      <main
        className={`
    flex-1 p-6 overflow-auto
    transition-[padding,opacity] duration-300 ease-in-out
    ${
      isCollapsed
        ? "pl-[10vh] opacity-100 pointer-events-auto"
        : " opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto md:pl-[35vh]"
    }
  `}
      >
        <Outlet />
      </main>
      {/* </SidebarInset> */}
    </div>
  );
}

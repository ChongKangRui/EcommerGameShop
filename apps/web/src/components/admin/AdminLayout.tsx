import { AdminSideBar } from "./AdminSideBar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-row min-h-screen w-full">
      <AdminSideBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

{/* ensure the admin panel content respect the sidebar space */}
      <main
        className={`
    flex-1 p-6 overflow-y-scroll
    transition-[padding,opacity] duration-300 ease-in-out
    ${
      isCollapsed
        ? "pl-[10vh] opacity-100 pointer-events-auto"
        : " opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto md:pl-[16rem]"
    }
  `}
      >
        <Outlet />
      </main>
    </div>
  );
}

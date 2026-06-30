import NavBar from "./navbar/NavBar";
import Footer from "./Footer";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <NavBar />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

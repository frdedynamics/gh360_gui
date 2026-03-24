import { Outlet } from "react-router-dom";
import Navbar from "./Sidenav";
import Topbar from "./Topbar";

function Applayout() {
  return (
    //  Create a page layout that is divided in two rows and two columns.
    <div className="grid min-h-dvh grid-cols-[260px_2fr]">
      {/* //Sidebar spans 2 rows, and leaves the remaining space to the maincontent + topbar*/}
      <aside className="bg-nav overflow-y-auto overflow-x-hidden">
        <Navbar />
      </aside>

      {/* Main content */}
      <main className="min-w-0 overflow-y-auto bg-background h-full">
        <Outlet />
      </main>
    </div>
  );
}

export default Applayout;

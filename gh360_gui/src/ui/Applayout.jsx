import { Outlet } from "react-router-dom";
import Navbar from "./Sidenav";

function Applayout() {
  return (
    //  Create a page layout that is divided in two columns.
    <div className="grid h-dvh grid-cols-[260px_1fr] 2xl:grid-cols-[512px_1fr]">
      {/* //Sidebar spans 2 rows, and leaves the remaining space to the maincontent + topbar*/}
      <aside className="bg-nav overflow-y-auto overflow-x-hidden border-r-2">
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

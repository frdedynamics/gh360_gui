import { Outlet } from "react-router-dom";
import Navbar from "./Sidenav";
import Topbar from "./Topbar";

function Applayout() {
  return (
    //  Create a page layout that is divided in two rows and two columns.
    <div className="grid min-h-dvh grid-cols-[260px_1fr] grid-rows-[56px_1fr]">
      {/* //Sidebar spans 2 rows, and leaves the remaining space to the maincontent + topbar*/}
      <aside className="row-span-2 bg-background overflow-y-auto">
        <Navbar />
      </aside>

      {/* Topbar  takes 56px and leaves the remaining space for the maincontent*/}
      <header className="bg-background  px-4 flex items-center">
        <Topbar />
      </header>

      {/* Main content */}
      <main className="min-w-0 overflow-y-auto bg-blue-300 h-full">
        <Outlet />
      </main>
    </div>
  );
}

export default Applayout;

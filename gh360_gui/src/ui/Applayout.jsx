import { Outlet } from "react-router-dom";
import Navbar from "./Sidenav";
import { useState } from "react";
import { PanelLeftOpen } from "lucide-react";

function Applayout() {
  const [openNavbar, setOpenNavbar] = useState(true);

  return (
    //  Create a page layout that is divided in two columns.
    <div
      className={`grid h-dvh  ${
        openNavbar
          ? "grid-cols-[260px_1fr] 2xl:grid-cols-[360px_1fr]"
          : "grid-cols-1"
      }`}
    >
      {openNavbar ? (
        <aside className="bg-nav border-r-2 ">
          <Navbar setOpenNavbar={setOpenNavbar} />
        </aside>
      ) : (
        <div className="absolute top-2">
          <button
            className="cursor-pointer"
            onClick={() => setOpenNavbar((bool) => !bool)}
            title="Open navigation bar"
          >
            <PanelLeftOpen />
          </button>
        </div>
      )}

      <main className="min-w-0 overflow-y-auto bg-background h-full">
        <Outlet />
      </main>
    </div>
  );
}

export default Applayout;

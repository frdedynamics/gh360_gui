import { Card } from "@/components/ui/card";
import ModeToggle from "@/components/ui/modeToggle";
import useRosStore from "@/store/rosStore";
import { CircleQuestionMark, Code, LayoutDashboard } from "lucide-react";

function Navbar() {
  const { status } = useRosStore();
  const isConnected = status === "connected";
  const navbarOptions = [
    { icon: <LayoutDashboard />, name: "Dashboard" },
    { icon: <CircleQuestionMark />, name: "Placeholder" },
    { icon: <Code />, name: "Block Programming" },
  ];

  return (
    <nav className="flex flex-col h-full w-full  ">
      <div className="text-xl items-center justify-center font-semibold p4- p-2">
        GH360 Robot Arm
      </div>
      <div className="flex flex-col gap-5 mt-2">
        {/* SIDENAV OPTIONS */}
        {navbarOptions.map((item) => (
          <button
            className="flex gap-2 border-b-2 border-b-primary cursor-pointer hover:scale-105"
            key={item.name}
          >
            <div className="ml-2">{item.icon}</div>
            <div className="">{item.name}</div>
          </button>
        ))}
      </div>

      {/* CONNECTION STATUS AND THEME TOGGLER */}
      <div className="mt-auto flex flex-col gap-2 p-2 border-t-2 border-t-primary">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span
              className={`animate-ping  absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? "bg-green-400" : "bg-red-400"}`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            />
          </div>
          <p
            className={`capitalize text-sm font-medium ${isConnected ? "text-green-500" : "text-red-500"}`}
          >
            {status}
          </p>
        </div>
        <ModeToggle />
      </div>
    </nav>
  );
}

export default Navbar;

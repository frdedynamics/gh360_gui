import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ui/modeToggle";
import useRosStore from "@/store/rosStore";
import {
  BotMessageSquare,
  Code,
  FileQuestionMark,
  LayoutDashboard,
  PanelLeftClose,
  Power,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

function Navbar({ setOpenNavbar }) {
  const { status, disconnect, reconnect } = useRosStore();
  const isConnected = status === "connected";
  const [reconnectCooldown, setReconnectCooldown] = useState(false);

  const navbarOptions = [
    { icon: <LayoutDashboard />, name: "Dashboard" },
    { icon: <BotMessageSquare />, name: "Move robot arm" },
    { icon: <Code />, name: "Block Programming" },
  ];

  const navbarOptions2 = [
    { icon: <LayoutDashboard />, navlink: <NavLink to="/">Dashboard</NavLink> },
    {
      icon: <BotMessageSquare />,
      navlink: <NavLink to="/moverobot">Move robot arm</NavLink>,
    },
    {
      icon: <Code />,
      navlink: <NavLink to="/block_programming">Block programming</NavLink>,
    },
    { icon: <FileQuestionMark />, navlink: <NavLink to="instruction_page"> Instructions</NavLink>}
  ];

  return (
    <nav className="flex flex-col h-full w-full relative">
      <div className="text-xl items-center justify-center font-semibold p-2 sm:text-2xl sm:p-3 md:text-2xl md:p-3 lg:text-3xl lg:p-4 xl:text-2xl xl:p-5 2xl:text-5xl 2xl:p-6">
        <p>GH360</p> Robot Arm
      </div>

      {/* //Closeable Navbar Button  */}
      <div className="absolute -right-2 top-2 z-10">
        <button
          title="Close navigation bar"
          className="cursor-pointer"
          onClick={() => setOpenNavbar((bool) => !bool)}
        >
          <PanelLeftClose />
        </button>
      </div>

      <div className="flex flex-col gap-5 mt-2">
        {navbarOptions2.map((item, i) => (
          <button
            className="flex gap-2 border-b-2 border-b-primary cursor-pointer hover:scale-105 sm:gap-3 md:gap-3 lg:gap-4 xl:gap-5 2xl:text-2xl 2xl:gap-6"
            key={i}
          >
            <div className="ml-2 sm:ml-3 md:ml-3 lg:ml-4 xl:ml-5 2xl:ml-6 2xl:scale-125">
              {item.icon}
            </div>
            <div>{item.navlink}</div>
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2 p-2 sm:gap-2 sm:p-2 md:gap-2 md:p-3 lg:gap-3 lg:p-3 xl:gap-2 xl:p-4 2xl:gap-4 2xl:p-4 border-t-2 border-t-primary">
        <div className="flex items-center gap-2 sm:gap-2 md:gap-3 lg:gap-3 xl:gap-2 2xl:gap-4">
          <div className="relative flex h-2 w-2 2xl:scale-125">
            <span
              className={`inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? "bg-green-400 animate-ping absolute" : ""
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-40 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>

          <p
            className={`capitalize text-sm font-medium sm:text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-2xl ${
              isConnected ? "text-green-500" : "text-red-500"
            }`}
          >
            {status}
          </p>

          <Button
            className="sm:size-7 md:size-7 lg:size-8 xl:size-9 2xl:size-10"
            variant="outline"
            size="icon"
            onClick={() => {
              setReconnectCooldown(true);
              reconnect();
              setTimeout(() => setReconnectCooldown(false), 1000);
            }}
            disabled={reconnectCooldown}
            title="Reconnect"
          >
            <RefreshCw
              color="#32d17a"
              className={`sm:scale-75 md:scale-75 lg:scale-90 xl:scale-100 2xl:scale-125 ${
                reconnectCooldown ? "animate-spin" : ""
              }`}
            />
          </Button>

          <Button
            className="sm:size-7 md:size-7 lg:size-8 xl:size-9 2xl:size-10"
            variant="outline"
            size="icon"
            onClick={() => disconnect()}
            disabled={!isConnected}
            title="Disconnect"
          >
            <Power
              className="sm:scale-75 md:scale-75 lg:scale-90 xl:scale-100 2xl:scale-125"
              color="#e00b24"
            />
          </Button>
        </div>

        <div className="p-2  2xl:origin-left">
          <ModeToggle
            className="sm:size-8 md:size-9 lg:size-10 xl:size-11 2xl:size-11"
            title="Toggle theme"
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ui/modeToggle";
import useRosStore from "@/store/rosStore";
import {
  CircleQuestionMark,
  Code,
  LayoutDashboard,
  Power,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

function Navbar() {
  const { status, disconnect, reconnect } = useRosStore();
  const isConnected = status === "connected";
  const [reconnectCooldown, setReconnectCooldown] = useState(false);

  const navbarOptions = [
    { icon: <LayoutDashboard />, name: "Dashboard" },
    { icon: <CircleQuestionMark />, name: "Placeholder" },
    { icon: <Code />, name: "Block Programming" },
  ];

  return (
    <nav className="flex flex-col h-full w-full ">
      <div className="text-xl items-center justify-center font-semibold p-2 2xl:text-5xl 2xl:p-6">
        GH360 Robot Arm
      </div>
      <div className="flex flex-col gap-5 mt-2">
        {navbarOptions.map((item) => (
          <button
            className="flex gap-2 border-b-2 border-b-primary cursor-pointer hover:scale-105 2xl:text-4xl 2xl:gap-6"
            key={item.name}
          >
            <div className="ml-2 2xl:ml-6 2xl:scale-150">{item.icon}</div>
            <div>{item.name}</div>
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2 p-2 2xl:p-4 border-t-2 border-t-primary ">
        <div className="flex items-center gap-2 2xl:gap-4">
          {/* Status indicator */}
          <div className="relative flex h-2 w-2 2xl:scale-200">
            <span
              className={`inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? "bg-green-400 animate-ping absolute " : ""
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-40 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
          <p
            className={`capitalize text-sm font-medium 2xl:text-4xl ${
              isConnected ? "text-green-500" : "text-red-500"
            }`}
          >
            {status}
          </p>

          {/* Reconnect button */}
          <Button
            className="2xl:size-14"
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
              className={`2xl:scale-200 ${reconnectCooldown ? "animate-spin" : ""}`}
            />
          </Button>

          {/* Disconnect button */}
          <Button
            className="2xl:size-14"
            variant="outline"
            size="icon"
            onClick={() => disconnect()}
            disabled={!isConnected}
            title="Disconnect"
          >
            <Power color="#e00b24" className="2xl:scale-200" />
          </Button>
        </div>
        <div className="2xl:scale-150 2xl:origin-left p-2">
          <ModeToggle className="2xl:size-12" title="Toggle theme" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

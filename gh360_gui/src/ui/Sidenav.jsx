import useRosStore from "@/store/rosStore";
import { CircleQuestionMark, Code, LayoutDashboard } from "lucide-react";

function Navbar() {
  const { status } = useRosStore();

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
    </nav>
  );
}

export default Navbar;

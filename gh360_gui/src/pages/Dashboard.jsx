import Camera from "@/components/Camera";
import JointCard from "@/components/JointCard";
import Model from "@/components/Model";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { JOINT_CONFIG } from "@/configs/jointConfigs";
import { use, useState } from "react";

function Dashboard() {
  const [toggleCamera, setToggleCamera] = useState(false);
  const [angleUnit, setAngleUnit] = useState("radians");

  console.log(angleUnit);
  return (
    <div className="grid grid-cols-[2fr_1fr] h-dvh w-full overflow-hidden">
      {/* LEFT —*/}
      <div className="overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 2xl:text-4xl">
          <Card className="w-full">
            <CardHeader className="font-semibold">
              Dashboard settings
            </CardHeader>
            <CardContent className="flex flex-col gap-2 ">
              <p className="flex items-center gap-2">
                Enable camera
                <Checkbox
                  className="2xl:scale-200 2xl:ml-2"
                  checked={toggleCamera}
                  onCheckedChange={(checked) => setToggleCamera(checked)}
                />
              </p>
              <p>Angle joints measured in:</p>

              <label>
                Radians{" "}
                <input
                  type="radio"
                  name="angleUnit"
                  value="radians"
                  checked={angleUnit === "radians"}
                  onChange={() => setAngleUnit("radians")}
                />
              </label>

              <label>
                Degrees{" "}
                <input
                  type="radio"
                  name="angleUnit"
                  value="degrees"
                  checked={angleUnit === "degrees"}
                  onChange={() => setAngleUnit("degrees")}
                />
              </label>
              <DropdownMenu />
            </CardContent>
          </Card>

          {JOINT_CONFIG.map((joint) => (
            <JointCard
              key={joint.jointName}
              jointName={joint.jointName}
              index={joint.index}
              motors={joint.motors}
              angleUnit={angleUnit}
            />
          ))}
        </div>
      </div>

      {/* RIGHT —*/}
      <aside className="flex flex-col h-full gap-2 p-2 overflow-hidden">
        <div className="flex-1 min-h-0">
          <Model />
        </div>
        <div className="flex-1 min-h-0">
          <Camera
            setToggleCamera={setToggleCamera}
            toggleCamera={toggleCamera}
          />
        </div>
      </aside>
    </div>
  );
}

export default Dashboard;

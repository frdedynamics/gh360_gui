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
import { useState } from "react";

function Dashboard() {
  const [toggleCamera, setToggleCamera] = useState(true);

  return (
    <div className="grid grid-cols-[2fr_1fr] w-full min-h-screen">
      {/* LEFT side of the dashboard */}
      <div className="grid grid-cols-2 gap-2 items-stretch w-full p-4 h-full">
        {/* An info card for other things to display */}
        {/* !TODO */}
        <Card className="min-h-20 w-full h-full">
          <CardHeader className=" font-semibold">Dashboard settings</CardHeader>
          <CardTitle></CardTitle>
          <CardDescription></CardDescription>
          <CardContent className="flex-col flex ">
            <div className="">
              <p className="flex items-center gap-2">
                Enable camera
                <span>
                  <Checkbox
                    checked={toggleCamera}
                    onCheckedChange={(checked) => setToggleCamera(checked)}
                  />
                </span>
              </p>
              <p>Angle joints measured in</p> <DropdownMenu />
            </div>
          </CardContent>
        </Card>
        {JOINT_CONFIG.map((joint) => (
          <div key={joint.jointName} className="w-full">
            <JointCard
              jointName={joint.jointName}
              index={joint.index}
              motors={joint.motors}
            />
          </div>
        ))}
      </div>

      {/* RIGHT SIDE OF THE DASHBOARD */}
      <aside className="flex flex-col min-h-screen w-full gap-2 p-2">
        <div className="flex-1 w-full">
          <Model />
        </div>
        <div className="flex-1 w-full">
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

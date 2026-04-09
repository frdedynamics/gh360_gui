import Camera from "@/components/Camera";
import JointCard from "@/components/JointCard";
import Model from "@/components/Model";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { JOINT_CONFIG } from "@/configs/jointConfigs";
import { useState } from "react";

function Dashboard() {
  const [toggleCamera, setToggleCamera] = useState(false);
  const [angleUnit, setAngleUnit] = useState("radians");

  console.log(angleUnit);
  return (
    <div className="grid grid-cols-[2fr_1fr] h-dvh w-full overflow-hidden">
      {/* LEFT —*/}
      <div className="overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 2xl:text-3xl">
          <Card className="w-full">
            <CardHeader className="font-semibold">
              <p className="underline decoration-2 underline-offset-6 2xl:underline-offset-8 2xl:text-6xl">
                Dashbord settings
              </p>
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

              <RadioGroup
                value={angleUnit}
                onValueChange={setAngleUnit}
                className="w-fit 2xl:gap-4"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem
                    className="2xl:size-6"
                    value="radians"
                    id="r1"
                  />
                  <Label className="2xl:text-2xl" htmlFor="r1">
                    Radians
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem
                    className="2xl:size-6"
                    value="degrees"
                    id="r2"
                  />
                  <Label className="2xl:text-2xl" htmlFor="r2">
                    Degrees
                  </Label>
                </div>
              </RadioGroup>
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

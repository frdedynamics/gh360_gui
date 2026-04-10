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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] h-dvh w-full overflow-hidden">
      <div className="overflow-y-auto p-2 sm:p-3 md:p-3 lg:p-4 xl:p-4 2xl:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-2 lg:gap-3 xl:gap-3 2xl:gap-4 sm:text-sm md:text-sm lg:text-base xl:text-base 2xl:text-xl">
          <Card className="w-full">
            <CardHeader className="font-semibold">
              <p className="underline decoration-2 underline-offset-4 sm:underline-offset-4 md:underline-offset-4 lg:underline-offset-6 xl:underline-offset-6 2xl:underline-offset-6 sm:text-base md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
                Dashboard settings
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 md:gap-2 lg:gap-3 xl:gap-3 2xl:gap-3">
              <p className="flex items-center gap-2">
                Enable camera
                <Checkbox
                  className="sm:scale-90 md:scale-90 lg:scale-100 xl:scale-110 2xl:scale-125 2xl:ml-1"
                  checked={toggleCamera}
                  onCheckedChange={(checked) => setToggleCamera(checked)}
                />
              </p>
              <p>Angle joints measured in:</p>
              <RadioGroup
                value={angleUnit}
                onValueChange={setAngleUnit}
                className="w-fit gap-2 md:gap-2 lg:gap-3 xl:gap-3 2xl:gap-3"
              >
                <div className="flex items-center gap-2 md:gap-2 lg:gap-3 xl:gap-3 2xl:gap-3">
                  <RadioGroupItem
                    className="sm:size-3 md:size-3 lg:size-4 xl:size-4 2xl:size-5"
                    value="radians"
                    id="r1"
                  />
                  <Label
                    className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg"
                    htmlFor="r1"
                  >
                    Radians
                  </Label>
                </div>
                <div className="flex items-center gap-2 md:gap-2 lg:gap-3 xl:gap-3 2xl:gap-3">
                  <RadioGroupItem
                    className="sm:size-3 md:size-3 lg:size-4 xl:size-4 2xl:size-5"
                    value="degrees"
                    id="r2"
                  />
                  <Label
                    className="sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg"
                    htmlFor="r2"
                  >
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

      <aside className="hidden sm:flex flex-col h-full gap-2 p-2 md:gap-2 md:p-2 lg:gap-2 lg:p-2 xl:gap-2 xl:p-2 2xl:gap-3 2xl:p-3 overflow-hidden">
        <div className="flex-1 min-h-0">
          <Model />
          {/* <div className="flex-1 min-h-0">
          <Camera
            setToggleCamera={setToggleCamera}
            toggleCamera={toggleCamera}
          />
        </div> */}
        </div>
      </aside>
    </div>
  );
}

export default Dashboard;

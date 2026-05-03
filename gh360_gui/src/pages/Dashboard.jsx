import Camera from "@/components/Camera";
import JointCard from "@/components/JointCard";
import Model from "@/components/Model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { JOINT_CONFIG } from "@/configs/jointConfigs";
import { Video, VideoOff } from "lucide-react";
import { useEffect, useState } from "react";
import useRosStore from "@/store/rosStore.js";

function Dashboard() {
  const [toggleCamera, setToggleCamera] = useState(false);
  const [angleUnit, setAngleUnit] = useState("radians");

  const code = useRosStore((s) => s.blockCode);
  const publishCmdJointPos = useRosStore((s) => s.publishCmdJointPos);

  function runCode() {
    console.log(code);
    eval(code);
  }
  // Changes the tab name when it first mounts.
  useEffect(() => {
    document.title = "GH360 Dashboard";
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] h-dvh w-full overflow-hidden">
      <div className="overflow-y-auto p-2 sm:p-3 md:p-3 lg:p-4 xl:p-4 2xl:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-2 lg:gap-3 xl:gap-3 2xl:gap-4 sm:text-sm md:text-sm lg:text-base xl:text-base 2xl:text-xl">
          {/* Card for setting the rad or deg. Can also play a set of positions from block-progamming. */}
          <Card className="w-full">
            <CardHeader className="font-semibold">
              <p className="underline decoration-2 underline-offset-4 sm:underline-offset-4 md:underline-offset-4 lg:underline-offset-6 xl:underline-offset-6 2xl:underline-offset-6 sm:text-base md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
                Dashboard settings
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 md:gap-2 lg:gap-3 xl:gap-3 2xl:gap-3">
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
              <Button className={code ? "flex-1" : "hidden"} onClick={runCode}>
                Play saved code
              </Button>
            </CardContent>
          </Card>
          {/* Displaying the different joints in each card.  */}
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
        <div className={toggleCamera ? "flex-1 min-h-0 " : "h-full"}>
          <Model setToggleCamera={setToggleCamera} />
        </div>

        <div className="flex justify-between items-center px-2">
          <p>Camera feed</p>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setToggleCamera((bool) => !bool)}
            title="Toggle camera feed"
          >
            {toggleCamera ? (
              <>
                <VideoOff />
              </>
            ) : (
              <>
                <Video />
              </>
            )}
          </Button>
        </div>

        {/* Always mounted so ROS subscription stays alive */}
        <div className={toggleCamera ? "flex-1 min-h-0" : "hidden"}>
          <Camera toggleCamera={toggleCamera} />
        </div>
      </aside>
    </div>
  );
}

export default Dashboard;

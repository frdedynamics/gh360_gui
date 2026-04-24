import JointSliders from "@/components/JointSliders";
import Model from "@/components/Model";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider.jsx";
import { JOINT_CONFIG, JOINT_LIMITS } from "@/configs/jointConfigs";
import useRosStore from "@/store/rosStore";
import { useEffect, useRef, useState } from "react";

function MoveRobot() {
  const initialJointValues = {
    name: JOINT_CONFIG.map((j) => j.jointName),
    position: JOINT_CONFIG.map(() => 0),
  };
  const [jointValues, setJointValues] = useState(initialJointValues);
  const jointValuesRef = useRef(initialJointValues);
  useEffect(() => {
    jointValuesRef.current = jointValues;
  }, [jointValues]);

  const [angleUnit, setAngleUnit] = useState("radians");

  // RosStore function for publishing messages.
  const publishJointMessage = useRosStore((s) => s.publishJointMessage);

  const SEND_COOLDOWN_MS = 6000; // 6 seconds cooldown, easy way to keep messages ordered.
  const sendQueueRef = useRef([]);
  const sendingRef = useRef(false);
  const cooldownTimerRef = useRef(null);

  return (
    <div className="grid grid-cols-[1fr_2fr] h-dvh w-full p-4 gap-2 ">
      {/* Configuration side */}
      <Card className="flex flex-col gap-2 flex-1 p-4">
        <CardHeader>
          <CardTitle>Move robot joints</CardTitle>
        </CardHeader>
        <CardContent>{/* Where the sliders are located */}</CardContent>
        {JOINT_CONFIG.map((joint) => (
          <JointSliders
            key={joint.jointName}
            jointName={joint.jointName}
            index={joint.index}
            angleUnit={angleUnit}
          />
        ))}
        <CardFooter className="p-4">
          <Button>Send Goal</Button>
        </CardFooter>
      </Card>
      {/* Model page */}

      <div>
        <Model />
      </div>
    </div>
  );
}

export default MoveRobot;

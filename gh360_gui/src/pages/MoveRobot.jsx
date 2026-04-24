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
import { JOINT_CONFIG, JOINT_LIMITS, DEG_TO_RAD } from "@/configs/jointConfigs";
import useRosStore from "@/store/rosStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const SEND_COOLDOWN_MS = 6000;
const notify = () => toast.success("Position sent");
const errorMsg = () => toast.error("Too many inputs. Please wait.");

function MoveRobot() {
  const initialJointValues = {
    name: JOINT_CONFIG.map((j) => j.jointName),
    position: JOINT_CONFIG.map(() => 0),
  };

  const [jointValues, setJointValues] = useState(initialJointValues);
  const [angleUnit, setAngleUnit] = useState("radians");

  const jointValuesRef = useRef(initialJointValues);
  const sendQueueRef = useRef([]);
  const sendingRef = useRef(false);
  const cooldownTimerRef = useRef(null);

  const publishJointMessage = useRosStore((s) => s.publishJointMessage);
  const setJointPositions = useRosStore((s) => s.setJointPositions);

  useEffect(() => {
    jointValuesRef.current = jointValues;
  }, [jointValues]);

  function handleSliderChange(jointName, displayVal) {
    const isRad = angleUnit === "radians";
    let val = isRad ? Number(displayVal) : DEG_TO_RAD(Number(displayVal));
    if (Number.isNaN(val)) return;

    const limits = JOINT_LIMITS[jointName];
    val = Math.max(limits.lower, Math.min(limits.upper, val));

    setJointValues((prev) => {
      const index = prev.name.indexOf(jointName);
      if (index === -1) return prev;
      const nextPositions = [...prev.position];
      nextPositions[index] = val;
      const next = { ...prev, position: nextPositions };
      jointValuesRef.current = next;
      setJointPositions(nextPositions);
      return next;
    });
  }

  function sendNext() {
    const item = sendQueueRef.current.shift();
    if (!item) {
      sendingRef.current = false;
      return;
    }
    sendingRef.current = true;
    publishJointMessage({ name: item.name, position: item.position });
    cooldownTimerRef.current = window.setTimeout(() => {
      cooldownTimerRef.current = null;
      if (sendQueueRef.current.length > 0) {
        sendNext();
      } else {
        sendingRef.current = false;
      }
    }, SEND_COOLDOWN_MS);
  }

  function enqueueSend() {
    const { name, position } = jointValuesRef.current;
    if (sendQueueRef.current.length < 1) {
      sendQueueRef.current.push({
        name: [...name],
        position: [...position],
        timeRequested: Date.now(),
      });
      notify();
    } else {
      errorMsg();
    }
    if (!sendingRef.current) sendNext();
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] h-dvh w-full overflow-hidden">
      {/* Sliders side */}
      <Card className="flex flex-col overflow-hidden m-2 sm:m-2 md:m-2 lg:m-3 xl:m-3 2xl:m-4">
        <CardHeader className="shrink-0">
          <CardTitle className="  sm:text-base md:text-base lg:text-lg xl:text-xl 2xl:text-2xl underline decoration-2 underline-offset-4 sm:underline-offset-4 md:underline-offset-4 lg:underline-offset-6 xl:underline-offset-6 2xl:underline-offset-6">
            Move Robot Joints
          </CardTitle>
          <div className="flex gap-2 mt-1  p-2">
            {["radians", "degrees"].map((u) => (
              <Button
                key={u}
                size="sm"
                variant={angleUnit === u ? "default" : "outline"}
                onClick={() => setAngleUnit(u)}
                className="sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-base cursor-pointer"
              >
                {u}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col overflow-y-auto flex-1 gap-3 sm:gap-3 md:gap-3 lg:gap-4 xl:gap-4 2xl:gap-5 sm:text-sm md:text-sm lg:text-base xl:text-base 2xl:text-xl px-3 sm:px-3 md:px-3 lg:px-4 xl:px-4 2xl:px-5">
          {JOINT_CONFIG.map((joint) => (
            <JointSliders
              key={joint.jointName}
              jointName={joint.jointName}
              index={joint.index}
              angleUnit={angleUnit}
              value={jointValues.position[joint.index]}
              onChange={handleSliderChange}
            />
          ))}
        </CardContent>

        <CardFooter className="shrink-0 p-3 sm:p-3 md:p-3 lg:p-4 xl:p-4 2xl:p-5">
          <Button
            onClick={enqueueSend}
            className="w-full sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-base cursor-pointer"
            title="Send positions"
          >
            Send Goal
          </Button>
        </CardFooter>
      </Card>

      {/* Model side */}
      <div className="hidden sm:block p-2 sm:p-2 md:p-2 lg:p-3 xl:p-3 2xl:p-4 h-full overflow-hidden">
        <Model />
      </div>
    </div>
  );
}

export default MoveRobot;

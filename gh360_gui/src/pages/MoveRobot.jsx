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
import CustomInput from "../components/CustomInput";
import {Power} from "lucide-react";

// Cooldown for sending goal positions
const SEND_COOLDOWN_MS = 6000;

// Notifications
const notify = () => toast.success("Position sent");
const saved = (name) => toast.success("Position saved with name: " + name);
const errorMsg = () => toast.error("Too many inputs. Please wait.");
const errorInput = () => toast.error("Please enter a name.");

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
  const nameInputRef = useRef(null);
  const userTouchedSlidersRef = useRef(false);

  // Imports functions from the rosStore.
  const publishCmdJointPos = useRosStore((s) => s.publishCmdJointPos);
  const setJointPositions = useRosStore((s) => s.setJointPositions);
  const setSavedPosition = useRosStore((s) => s.setSavedPosition);
  const setStop = useRosStore((s) => s.setStop);

  // Listens to changes to variables in the rosStore.
  const savedPositions = useRosStore((s) => s.savedPositions);
  const msgJointPositions = useRosStore((s) => s.msgJointPositions);
  const currentlyRunning = useRosStore((s) => s.isProcessingJointQueue);


  // Sets the reference variable whenever the real one changes.
  useEffect(() => {
    jointValuesRef.current = jointValues;
  }, [jointValues]);

  // Sets title on the page.
  useEffect(() => {
    document.title = "GH360 Move Robot";
  }, []);

  // Clear cooldown timer on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!msgJointPositions || !msgJointPositions.length) return;
    if (userTouchedSlidersRef.current) return;

    setJointValues((prev) => {
      const nextPositions = [...msgJointPositions];
      const next = { ...prev, position: nextPositions };

      jointValuesRef.current = next;
      setJointPositions(nextPositions); // keep store in sync (for Model)

      return next;
    });
  }, [msgJointPositions, setJointPositions]);

  function handleSliderChange(jointName, displayVal) {
    const isRad = angleUnit === "radians";
    // val is stored as radians, so convert to radians if degrees.
    let val = isRad ? Number(displayVal) : DEG_TO_RAD(Number(displayVal));
    if (Number.isNaN(val)) return;
    userTouchedSlidersRef.current = true;

    const limits = JOINT_LIMITS[jointName];
    // clamp val to limits if it exceeds them.
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

  // Updates the list of saved positions in the rosStore with a name and position.
  function updateSavedPositions() {
    const name = nameInputRef.current?.value.trim();
    if (!name) {
      errorInput(); // Notification.
      return;
    }

    const position = jointValuesRef.current;
    if (!position) {
      return;
    }
    saved(name); // Notification.
    setSavedPosition(name, position); // adds a new item to the list if the name isn't used, replaces old one if it exists.
  }

  // Method for sending messages to the rosStore with a cooldown. Now redundant since the send button is disabled while
  // the robot moves.
  function sendNext() {
    const item = sendQueueRef.current.shift();
    if (!item) {
      sendingRef.current = false;
      return;
    }
    sendingRef.current = true;

    // Publish to the rosStore. Adds the position to a list that sends commands to the robot when available.
    publishCmdJointPos(item.position);

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
      notify(); // notification.
    } else {
      errorMsg(); // notification.
    }
    if (!sendingRef.current) sendNext();
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] h-dvh w-full overflow-hidden">
      {/* Sliders side */}
      <Card className="flex flex-col overflow-hidden m-2 sm:m-2 md:m-2 lg:m-3 xl:m-3 2xl:m-4">
        <CardHeader className="shrink-0">
          <CardTitle className="sm:text-base md:text-base lg:text-lg xl:text-xl 2xl:text-2xl underline decoration-2 underline-offset-4 sm:underline-offset-4 md:underline-offset-4 lg:underline-offset-6 xl:underline-offset-6 2xl:underline-offset-6">
            Move Robot Joints
          </CardTitle>
          <div className="flex gap-2 mt-1 p-2">
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
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <CustomInput
                savedPositions={savedPositions}
                nameInputRef={nameInputRef}
              />
              <Button
                onClick={updateSavedPositions}
                className="flex sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-base cursor-pointer w-"
                title="Save position"
              >
                Save position
              </Button>
            </div>
            <div className="flex w-full gap-2">
              <Button
                onClick={enqueueSend}
                disabled={currentlyRunning}
                className="flex-1 sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-base cursor-pointer"
                title="Send positions"
              >
                Move to position
              </Button>
              <Button
                  className="flex-4"
                  variant="outline"
                  size="icon"
                  onClick={() => setStop(true)}
                  disabled={!currentlyRunning}
                  title="Stop"
              >
                <Power
                    className="sm:scale-75 md:scale-75 lg:scale-90 xl:scale-100 2xl:scale-125"
                    color="#e00b24"
                />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Model side, ghost=true to get 2 models: ghost that listens to received messages and normal model
      that listens to sliders */}
      <div className="hidden sm:block p-2 sm:p-2 md:p-2 lg:p-3 xl:p-3 2xl:p-4 h-full overflow-hidden">
        <Model ghost={true} />
      </div>
    </div>
  );
}

export default MoveRobot;

import { useRef, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Minus, Plus } from "lucide-react";
import useRosTopic from "@/hooks/useRosTopics";

function JointCard({ jointName, index, motors }) {
  const [jointAngle, setJointAngle] = useState(null);
  const [motorData, setMotorData] = useState(null);
  const [moreInfo, setMoreInfo] = useState(false);

  useRosTopic("/gh360/joint_states", "sensor_msgs/msg/JointState", 100, (msg) =>
    setJointAngle(msg.position[index]),
  );

  useRosTopic(
    "/gh360/motor_states_sorted",
    "gh360_interfaces/msg/PortStatus",
    100,
    (msg) => setMotorData(motors.map((i) => msg.motors[i])),
  );

  return (
    <Card className="w-full h-full overflow-hidden flex flex-col">
      <CardHeader className="text-lg shrink-0">
        <CardTitle>{jointName.replaceAll("_", " ")}</CardTitle>
        <CardAction>
          <button
            className="cursor-pointer"
            onClick={() => setMoreInfo((prev) => !prev)}
          >
            {!moreInfo ? (
              <Plus
                className="hover:rotate-90 hover:duration-300 bg-muted rounded-2xl"
                strokeWidth={2.5}
              />
            ) : (
              <Minus className="bg-muted rounded-2xl" strokeWidth={2.5} />
            )}
          </button>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        {jointAngle === null ? (
          <p>Waiting for data...</p>
        ) : (
          <div className="gap-2 pt-2">
            <div className="text-4xl">
              {jointAngle.toFixed(3)}
              <span className="opacity-50 text-2xl">rad</span>
            </div>
          </div>
        )}
        {moreInfo
          ? motorData.map((motor, i) => (
              <div key={motors[i]} className="mt-2">
                <p className="font-semibold text-sm">Motor {motors[i] + 1}</p>
                <p className="ml-5">
                  Present position: {motor.present_position.toFixed(3)}
                </p>
                {moreInfo && (
                  <div>
                    <p className="ml-5">
                      Present velocity: {motor.present_velocity.toFixed(3)}
                    </p>
                    <p className="ml-5">
                      Present current: {motor.present_current.toFixed(3)}
                    </p>
                  </div>
                )}
              </div>
            ))
          : ""}
      </CardContent>
    </Card>
  );
}

export default JointCard;

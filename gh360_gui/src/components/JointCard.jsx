import { useState, memo } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Minus, Plus } from "lucide-react";
import useRosStore from "@/store/rosStore";
import { useShallow } from "zustand/react/shallow";

function JointCard({ jointName, index, motors, angleUnit }) {
  const [moreInfo, setMoreInfo] = useState(false);

  const jointAngle = useRosStore(
    (s) => s.jointMessage?.position[index] ?? null,
  );

  const motorData = useRosStore(
    useShallow((s) =>
      s.motorMessage ? motors.map((i) => s.motorMessage.motors[i]) : null,
    ),
  );

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden min-h-36">
      <CardHeader className="text-lg shrink-0 xl:text-2xl 2xl:text-4xl">
        <CardTitle>{jointName.replaceAll("_", " ")}</CardTitle>
        <CardAction className="">
          <button
            className="cursor-pointer"
            onClick={() => setMoreInfo((prev) => !prev)}
            disabled={motorData === null}
          >
            {!moreInfo ? (
              <Plus
                className="hover:rotate-90 hover:duration-300 bg-muted rounded-2xl 2xl:scale-150"
                strokeWidth={2.5}
              />
            ) : (
              <Minus
                className="bg-muted rounded-2xl 2xl:scale-150"
                strokeWidth={2.5}
              />
            )}
          </button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {jointAngle === null ? (
          <p>Waiting for data...</p>
        ) : (
          <div className="pt-2">
            <div className="text-3xl xl:text-4xl 2xl:text-9xl">
              {angleUnit === "radians"
                ? jointAngle.toFixed(3)
                : (jointAngle * (180 / Math.PI)).toFixed(3)}
              <span className="opacity-50 text-xl xl:text-2xl 2xl:text-8xl">
                {angleUnit === "radians" ? (
                  <span>rad</span>
                ) : (
                  <span>deg</span>
                )}{" "}
              </span>
            </div>
          </div>
        )}
        {moreInfo &&
          motorData?.map((motor, i) => (
            <div
              key={motors[i]}
              className="mt-2 text-sm xl:text-base 2xl:text-3xl 2xl:flex 2xl:flex-col"
            >
              <p className="font-semibold">Motor {motors[i] + 1}</p>
              <p className="ml-3">
                Position: {motor.present_position.toFixed(3)}
              </p>
              <p className="ml-3">
                Velocity: {motor.present_velocity.toFixed(3)}
              </p>
              <p className="ml-3">
                Current: {motor.present_current.toFixed(3)}
              </p>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

export default memo(JointCard);

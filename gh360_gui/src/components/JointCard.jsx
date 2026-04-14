import { useState, memo, useMemo } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Minus, Plus } from "lucide-react";
import useRosStore from "@/store/rosStore";

function JointCard({ jointName, index, motors, angleUnit }) {
  const [moreInfo, setMoreInfo] = useState(false);
  const jointPositions = useRosStore((s) => s.jointPositions);
  const motorStates = useRosStore((s) => s.motorStates);

  const jointAngle = jointPositions?.[index] ?? null;
  const motorData = useMemo(() => {
    if (!motorStates) return null;
    return motors.map((i) => motorStates[i]);
  }, [motorStates, motors]);

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden min-h-24 sm:min-h-28 md:min-h-32 lg:min-h-36 xl:min-h-36 2xl:min-h-44">
      <CardHeader className="text-sm shrink-0 sm:text-base md:text-base lg:text-lg xl:text-2xl 2xl:text-3xl">
        <CardTitle>{jointName.replaceAll("_", " ")}</CardTitle>
        <CardAction>
          <button
            className="cursor-pointer"
            onClick={() => setMoreInfo((prev) => !prev)}
            disabled={motorData === null}
          >
            {!moreInfo ? (
              <Plus
                className="hover:rotate-90 hover:duration-300 bg-muted rounded-2xl sm:scale-90 md:scale-90 lg:scale-100 xl:scale-110 2xl:scale-125"
                strokeWidth={2.5}
              />
            ) : (
              <Minus
                className="bg-muted rounded-2xl sm:scale-90 md:scale-90 lg:scale-100 xl:scale-110 2xl:scale-125"
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
          <div className="pt-1 sm:pt-1 md:pt-2 lg:pt-2 xl:pt-2">
            <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
              {angleUnit === "radians"
                ? jointAngle.toFixed(2)
                : (jointAngle * (180 / Math.PI)).toFixed(2)}
              <span className="opacity-50 text-sm sm:text-base md:text-base lg:text-xl xl:text-2xl 2xl:text-3xl">
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
              className="mt-1 sm:mt-1 md:mt-2 lg:mt-2 xl:mt-2 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg"
            >
              <p className="font-semibold">Motor {motors[i] + 1}</p>
              <p className="ml-2 sm:ml-2 md:ml-3 lg:ml-3 xl:ml-3">
                Position:{motor.present_position.toFixed(2)}
                <span className="opacity-50">
                  {angleUnit === "radians" ? (
                    <span>rad</span>
                  ) : (
                    <span>deg</span>
                  )}
                </span>
              </p>
              <p className="ml-2 sm:ml-2 md:ml-3 lg:ml-3 xl:ml-3">
                Velocity:{" "}
                {angleUnit === "radians"
                  ? motor.present_velocity.toFixed(2)
                  : (motor.present_velocity * (180 / Math.PI)).toFixed(2)}
                <span className="opacity-50">
                  {angleUnit === "radians" ? (
                    <span>rad/s</span>
                  ) : (
                    <span>deg/s</span>
                  )}{" "}
                </span>
              </p>
              <p className="ml-2 sm:ml-2 md:ml-3 lg:ml-3 xl:ml-3">
                Current: {motor.present_current.toFixed(2)}
                <span className="opacity-50">mA</span>
              </p>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

export default memo(JointCard);

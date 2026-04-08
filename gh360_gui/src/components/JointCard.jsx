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

function JointCard({ jointName, index, motors }) {
  //Using the zustand library to fetch from a single source of truth.
  const jointMessage = useRosStore((state) => state.jointMessage);
  const motorMessage = useRosStore((state) => state.motorMessage);

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
    <Card className="w-full h-full flex flex-col overflow-hidden min-h-42">
      <CardHeader className="text-lg shrink-0">
        <CardTitle>{jointName.replaceAll("_", " ")}</CardTitle>
        <CardAction>
          <button
            className="cursor-pointer"
            onClick={() => setMoreInfo((prev) => !prev)}
            disabled={motorData === null}
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
      <CardContent className="flex-1 overflow-hidden">
        {jointAngle === null ? (
          <p>Waiting for data...</p>
        ) : (
          <div className="pt-2">
            <div className="text-3xl xl:text-4xl 2xl:text-5xl">
              {jointAngle.toFixed(3)}
              <span className="opacity-50 text-xl xl:text-2xl">rad</span>
            </div>
          </div>
        )}
        {moreInfo &&
          motorData?.map((motor, i) => (
            <div key={motors[i]} className="mt-2 text-sm xl:text-base">
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
              <div>
                {moreInfo ? (
                  <div>
                    {" "}
                    <p className="ml-5">
                      Present velocity:{" "}
                      {motorMessage.motors[index].present_velocity.toFixed(
                        3,
                      )}
                    </p>
                    <p className="ml-5">
                      Present current:{" "}
                      {motorMessage.motors[index].present_current.toFixed(
                        3,
                      )}
                    </p>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

export default memo(JointCard);

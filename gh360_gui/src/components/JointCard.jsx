import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import useRosStore from "@/store/rosStore";

function JointCard({ jointName, index, motors }) {
  //Using the zustand library to fetch from a single source of truth.
  const jointMessage = useRosStore((state) => state.jointMessage);
  const motorMessage = useRosStore((state) => state.motorMessage);

  const [moreInfo, setMoreInfo] = useState(false);

  return (
    <Card className="w-full min-h-20 overflow-hidden">
      <CardHeader className="text">
        <CardTitle>{jointName.replace("_", " ")}</CardTitle>
        <CardAction>
          <button
            className="cursor-pointer"
            onClick={() => setMoreInfo((prev) => !prev)}
          >
            {!moreInfo ? (
              <Plus
                className=" hover:rotate-90 hover:duration-300 bg-gray-200 rounded-2xl"
                strokeWidth={2.5}
              />
            ) : (
              <Minus className=" bg-gray-200 rounded-2xl" strokeWidth={2.5} />
            )}
          </button>
        </CardAction>
        <CardDescription>
          {" "}
          {!jointMessage ? (
            <p>Waiting for data...</p>
          ) : (
            <p>Joint angle : {jointMessage.position[index].toFixed(3)} </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-y-auto ">
        {!motorMessage ? (
          <p>Waiting...</p>
        ) : (
          motors.map((motorIndex) => (
            <div key={motorIndex} className="mt-2">
              <h2 className="font-semibold">Motor {motorIndex + 1}</h2>
              <p className="ml-5">
                Present position:{" "}
                {motorMessage.motors[motorIndex].present_position.toFixed(3)}
              </p>

              <div>
                {moreInfo ? (
                  <div>
                    {" "}
                    <p className="ml-5">
                      Present velocity:{" "}
                      {motorMessage.motors[motorIndex].present_velocity.toFixed(
                        3,
                      )}
                    </p>
                    <p className="ml-5">
                      Present current:{" "}
                      {motorMessage.motors[motorIndex].present_current.toFixed(
                        3,
                      )}
                    </p>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default JointCard;

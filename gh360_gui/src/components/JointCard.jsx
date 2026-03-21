import useTopics from "@/hooks/useTopics";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";

function JointCard({ jointName, index, motors }) {
  //subscribes to  a joint state topic using the custom hook
  const jointMessage = useTopics(
    "/gh360/joint_states",
    "sensor_msgs/msg/JointState",
  );

  //subscribes to the motor topic using the cusstom hook

  const motorMessage = useTopics(
    "/gh360/motor_states_sorted",
    "gh360_interfaces/msg/PortStatus",
  );

  return (
    <Card>
      <CardHeader className="text-lg">
        <CardTitle>{jointName.replace("_", " ")}</CardTitle>
        <CardAction>
          {!jointMessage ? (
            <p>Waiting for data...</p>
          ) : (
            jointMessage.position[index].toFixed(3)
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        {!jointMessage ? (
          <p>Waiting for data...</p>
        ) : (
          <p>Joint angle : {jointMessage.position[index].toFixed(3)} </p>
        )}

        {!motorMessage ? (
          <p>Waiting...</p>
        ) : (
          motors.map((motorIndex) => (
            <div key={motorIndex} className="mt-2">
              <h2 className="font-semibold">Motor {motorIndex + 1}</h2>
              <p className="ml-5">
                Present position:{" "}
                {motorMessage.motors[motorIndex].present_position.toFixed(4)}
              </p>
              <p className="ml-5">
                Present velocity:{" "}
                {motorMessage.motors[motorIndex].present_velocity.toFixed(4)}
              </p>
              <p className="ml-5">
                Present current:{" "}
                {motorMessage.motors[motorIndex].present_current.toFixed(4)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default JointCard;

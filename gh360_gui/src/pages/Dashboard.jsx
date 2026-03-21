import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useTopics from "@/hooks/useTopics";

function Dashboard() {
  const message = useTopics(
    "/gh360/joint_states",
    "sensor_msgs/msg/JointState",
  );

  return (
    <div className="flex justify-center items-center h-full  text-foreground">
      <Card>
        <CardHeader>
          <CardTitle>Elbow Joint</CardTitle>
          <CardDescription>This card shows the elbow joint</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          {!message ? (
            <p>Waiting for data...</p>
          ) : (
            <p>{message.position.toString()}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;

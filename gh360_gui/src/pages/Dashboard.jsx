import Camera from "@/components/Camera";
import JointCard from "@/components/JointCard";
import Model from "@/components/Model";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { JOINT_CONFIG } from "@/configs/jointConfigs";

function Dashboard() {
  return (
    <div className="grid grid-cols-2 w-full ">
      {/* LEFT side of the dashboard */}
      <div className="grid grid-cols-2 gap-4 items-start w-full p-4">
        {/* An info card for other things to display */}
        {/* !TODO */}
        <Card className="min-h-56">
          <CardHeader></CardHeader>
          <CardDescription></CardDescription>
        </Card>
        {JOINT_CONFIG.map((joint) => (
          <div key={joint.jointName} className="w-full">
            <JointCard
              jointName={joint.jointName}
              index={joint.index}
              motors={joint.motors}
            />
          </div>
        ))}
      </div>

      {/* RIGHT SIDE OF THE DASHBOARD */}
      <aside className="grid grid-rows-2 items-center justify-center min-h-screen">
        <Camera />
        <Model />
      </aside>
    </div>
  );
}

export default Dashboard;

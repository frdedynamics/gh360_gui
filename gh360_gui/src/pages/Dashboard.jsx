import Camera from "@/components/Camera";
import JointCard from "@/components/JointCard";
import Model from "@/components/Model";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { JOINT_CONFIG } from "@/configs/jointConfigs";

function Dashboard() {
  return (
    <div className="grid grid-cols-[2fr_1fr] w-full ">
      {/* LEFT side of the dashboard */}
      <div className="grid grid-cols-2 gap-4 items-start w-full p-4">
        {/* An info card for other things to display */}
        {/* !TODO */}
        <Card className="min-h-20">
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
      <aside className="flex flex-col min-h-screen w-full gap-2 p-2">
        <div className="flex-1 w-full">
          <Camera />
        </div>
        <div className="flex-1 w-full">
          <Model />
        </div>
      </aside>
    </div>
  );
}

export default Dashboard;

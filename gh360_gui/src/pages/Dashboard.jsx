import JointCard from "@/components/JointCard";
import { JOINT_CONFIG } from "@/configs/jointConfigs";

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {JOINT_CONFIG.map((joint) => (
        <JointCard
          key={joint.jointName}
          jointName={joint.jointName}
          index={joint.index}
          motors={joint.motors}
        />
      ))}
    </div>
  );
}

export default Dashboard;

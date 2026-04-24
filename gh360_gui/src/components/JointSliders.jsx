import { Slider } from "./ui/slider";
import { JOINT_LIMITS } from "@/configs/jointConfigs";

function JointSliders({ jointName, index, angleUnit }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="">{jointName.replaceAll("_", " ")}</div>
      <Slider
        defaultValue={[75]}
        max={10}
        step={1}
        className="mx-auto w-full max-w-xs"
      />
    </div>
  );
}

export default JointSliders;

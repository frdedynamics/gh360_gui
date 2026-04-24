import { Slider } from "@/components/ui/slider";
import { JOINT_LIMITS, RAD_TO_DEG } from "@/configs/jointConfigs";

function JointSliders({ jointName, value, angleUnit, onChange }) {
  const limits = JOINT_LIMITS[jointName];
  const isRad = angleUnit === "radians";

  const min = isRad ? limits.lower : limits.lowerdeg;
  const max = isRad ? limits.upper : limits.upperdeg;
  const displayValue = isRad ? value : RAD_TO_DEG(value);

  return (
    <div className="flex flex-col gap-1 sm:gap-1 md:gap-1 lg:gap-2 xl:gap-2 2xl:gap-2">
      <div className="flex justify-between items-center">
        <span className="capitalize sm:text-xs md:text-xs lg:text-sm xl:text-base 2xl:text-lg font-medium">
          {jointName.replaceAll("_", " ")}
        </span>
        <span className="text-muted-foreground tabular-nums sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-base">
          {displayValue.toFixed(2)}&nbsp;{isRad ? "rad" : "°"}
        </span>
      </div>
      <Slider
        value={[displayValue]}
        min={min}
        max={max}
        step={isRad ? 0.01 : 0.5}
        onValueChange={([v]) => onChange(jointName, v)}
        className="w-full"
      />
    </div>
  );
}

export default JointSliders;

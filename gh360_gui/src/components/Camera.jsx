import useRosStore from "@/store/rosStore";
import { Card } from "./ui/card";

function Camera() {

  const cameraMessage = useRosStore((state) => state.cameraMessage)

  console.log(cameraMessage)

  return <Card className="bg-amber-300 w-full h-full">CAMERA SECTION</Card>;
}

export default Camera;
